---
title: Ingress
---

# Ingress

Ingress traffic is external traffic that reaches a public Radix component. Radix always proxies this traffic through a gateway controller before it reaches your component replicas. The gateway controller acts as a reverse proxy: it accepts the external request, adds forwarding headers, and sends the request to the selected component replica inside the cluster.

Network policies enforce this traffic path. A component replica can receive ingress traffic only from the gateway controller, with one exception: other replicas running in the same application environment can connect directly to it. External clients can't connect directly to component replicas.

## Gateway proxy headers

Radix routes all external traffic through the gateway controller before it reaches your component replicas. The gateway controller adds these forwarding headers:

- `X-Forwarded-For` contains the original client IP address chain.
- `X-Forwarded-Host` contains the original host requested by the client.
- `X-Forwarded-Port` contains the original port requested by the client.
- `X-Forwarded-Proto` contains the original protocol, such as `https`.

Configure your application or reverse proxy to trust `10.0.0.0/8` when processing forwarded headers. Gateway controllers and replicas for all applications are assigned IP addresses in this range. It is safe to trust this IP range because network policies blocks all traffic expect from the gateway controller and replicas in the same environment.

For ingress traffic, only the gateway controller can connect to your component replicas. Replicas in the same application environment can also connect directly to each other. Other services can't connect directly to your component replicas.

Because same-environment replicas can connect directly, another replica in the same environment can send its own `X-Forwarded-*` headers. Treat the application environment as the trust boundary, and don't use forwarded headers as the only protection between replicas in the same environment.

Use `X-Forwarded-For` when your application needs the original client IP address for IP filtering, auditing, or rate limiting. Read the trusted forwarded header first, then apply your application logic to the resolved client IP address.

:::note
These examples are illustrative only. Adjust allowed client ranges, rate limits, proxy targets, and middleware placement to match your application and framework setup.
:::

## IP filtering with NGINX

If your application is fronted by NGINX, configure NGINX to trust the `10.0.0.0/8` private range, derive the client IP from `X-Forwarded-For`, and deny requests that are not in the allowed ranges.

Replace the example allowed client ranges with values that match your setup.

```nginx
server {
	listen 8080;

	real_ip_header X-Forwarded-For;
	real_ip_recursive on;
	# Trust the Radix gateway controller.
	set_real_ip_from 10.0.0.0/8;

	location / {
		allow 203.0.113.10;
		allow 198.51.100.0/24;
		deny all;

		proxy_pass http://my_app_upstream;
	}
}
```

## IP filtering with ASP.NET Core

If your application is built with ASP.NET Core, configure forwarded headers so the application trusts the `10.0.0.0/8` private range used by the Radix gateway controller, then apply IP filtering in middleware.

Replace the example allowed client ranges with values that match your setup.

```csharp
using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
	options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

	// Trust the Radix gateway controller.
	options.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("10.0.0.0"), 8));
});

var app = builder.Build();

var allowedNetworks = new[]
{
	new System.Net.IPNetwork(IPAddress.Parse("203.0.113.10"), 32),
	new System.Net.IPNetwork(IPAddress.Parse("198.51.100.0"), 24),
};

app.UseForwardedHeaders();

app.Use(async (context, next) =>
{
	var remoteIp = context.Connection.RemoteIpAddress;
	var isAllowed = remoteIp is not null && allowedNetworks.Any(network => network.Contains(remoteIp));

	if (!isAllowed)
	{
		context.Response.StatusCode = StatusCodes.Status403Forbidden;
		await context.Response.WriteAsync("Forbidden");
		return;
	}

	await next();
});

app.MapGet("/", () => "Hello from ASP.NET Core");

app.Run();
```

## Rate limiting with NGINX

NGINX can rate limit requests by the resolved client IP address. Configure trusted forwarding first, then use `$binary_remote_addr` as the rate limit key. After NGINX processes `X-Forwarded-For` from the trusted gateway controller, `$binary_remote_addr` represents the original client IP address.

This example allows an average of 10 requests per second per client IP address, with a burst of 20 requests. Requests that exceed the limit receive `429 Too Many Requests`.

```nginx
http {
	limit_req_zone $binary_remote_addr zone=per_client:10m rate=10r/s;

	server {
		listen 8080;
		limit_req_status 429;

		real_ip_header X-Forwarded-For;
		real_ip_recursive off;

		# Trust the Radix gateway controller.
		set_real_ip_from 10.0.0.0/8;

		location / {
			limit_req zone=per_client burst=20 nodelay;

			proxy_pass http://my_app_upstream;
		}
	}
}
```

Tune the `rate`, `burst`, and `nodelay` values to match the traffic pattern your application should accept.

## Rate limiting with ASP.NET Core

ASP.NET Core can rate limit by the resolved client IP address after forwarded headers have been applied. Configure `UseForwardedHeaders()` before `UseRateLimiter()` so `context.Connection.RemoteIpAddress` contains the original client IP address from the trusted gateway controller.

This example allows 100 requests per minute per client IP address and returns `429 Too Many Requests` when the limit is exceeded.

```csharp
using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
	options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

	// Trust the Radix gateway controller.
	options.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("10.0.0.0"), 8));
});

builder.Services.AddRateLimiter(options =>
{
	options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
	options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
	{
		var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

		return RateLimitPartition.GetFixedWindowLimiter(clientIp, _ => new FixedWindowRateLimiterOptions
		{
			PermitLimit = 100,
			Window = TimeSpan.FromMinutes(1),
			QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
			QueueLimit = 0,
		});
	});
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseRateLimiter();

app.MapGet("/", () => "Hello from ASP.NET Core");

app.Run();
```

Apply rate limits close to the endpoints that need them. For example, login endpoints often need stricter limits than static content or health endpoints.

