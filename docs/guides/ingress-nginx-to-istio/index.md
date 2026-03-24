---
title: Ingress-NGINX Migration to Istio and Gateway API
---

# Ingress-NGINX migration to Istio and Gateway API

Ingress-NGINX, our current ingress controller, is being retired. To move to a supported platform, Radix is migrating from the Kubernetes Ingress API to the Gateway API and replacing [Ingress-NGINX](https://github.com/kubernetes/ingress-NGINX) with [Istio](https://istio.io/). This removes Ingress-NGINX-specific behavior from the platform and aligns public ingress with the technology Radix will support going forward.

Some existing Radix features depend on Ingress-NGINX-specific behavior, or on capabilities that are not currently available in the Gateway API and Istio setup used by Radix. Those features should therefore be treated as deprecated and replaced in application code or application architecture.

## Migration plan

### Phase 1

Phase 1 ends on Friday, April 10.

Applications that use deprecated features must:

- implement the recommended fixes
- test the application using the `radix.equinor.com/preview-gateway-mode` annotation in `radixconfig.yaml`

### Phase 2

Phase 2 runs from April 13 to April 18.

During this period, the Radix team will gradually migrate applications so that traffic is routed through Istio.

## Test traffic through Istio

You can test routing traffic through Istio before switching fully by adding the `radix.equinor.com/preview-gateway-mode` annotation to your `radixconfig.yaml` file.

The annotation value must be a comma-separated list of environments that should be routed through Istio, for example `dev,qa`. Use the value `*` to route all environments through Istio.

When an environment is enabled for Istio, the corresponding DNS records are updated to point to the Istio load balancer IP address. The DNS record TTL is 30 seconds, so expect some delay before traffic is routed correctly after enabling the annotation. Some browsers may also maintain their own DNS cache separately from the operating system, which can delay the switch further.

Example:

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: my-app
  annotations:
    radix.equinor.com/preview-gateway-mode: "dev,qa"
spec:
  environments:
    - name: dev
    - name: qa
    - name: prod
  components:
    - name: web
      src: web
      ports:
        - name: http
          port: 8080
      publicPort: http
```

To route all environments through Istio, use:

```yaml
metadata:
  annotations:
    radix.equinor.com/preview-gateway-mode: "*"
```

## Network configuration

The clusters currently run with both Ingress-NGINX and Istio. Ingress-NGINX and Istio use different load balancer IP addresses.

| Cluster | Region | Ingress-NGINX IP | Istio IP |
| --- | --- | --- | --- |
| Platform | North Europe | `20.223.122.1` | `20.223.122.2` |
| Platform 2 | West Europe | `20.61.119.160` | `20.61.119.163` |
| Platform 3 | Sweden Central | `51.12.145.16` | `51.12.145.17` |

When all applications have been migrated to Istio, Ingress-NGINX will be removed from the clusters. At that point, the Ingress-NGINX load balancer and its IP addresses will also be removed.

## Breaking changes

### External DNS A records

If you have A records in another DNS zone that point directly to the Ingress-NGINX IP address, you need to update those records to point to the corresponding Istio IP address instead.

This is especially important for custom DNS records that are not managed by Radix. If those records continue to point to the Ingress-NGINX load balancer, traffic will not follow the Istio path after migration.

### Client certificate authentication

The [`clientCertificate`](../../radix-config/index.md#clientcertificate) section configures NGINX client certificate authentication for a public component. This is deprecated because the Gateway API does not currently support this capability in the way Radix used it with Ingress-NGINX.

If you rely on this for access control, replace it with an IP allow list in your application code. Because requests arrive through trusted proxies, configure your application to trust the proxy chain and inspect the [`X-Forwarded-For`](../../docs/topic-runtime-env/index.md#request-headers) header to determine the original client IP before applying the allow list.

See the [NGINX example](#nginx-ip-filtering-example) and [ASP.NET example](#aspnet-ip-filtering-example) at the bottom of this document.

### ingressConfiguration

The [`ingressConfiguration`](../../radix-config/index.md#ingressconfiguration) section is deprecated. These settings were implemented for Ingress-NGINX and do not carry over to the Gateway API migration.

#### stickysessions

The `stickysessions` option is deprecated. Session persistence is defined in the Gateway API, but it is not currently supported by Istio for Radix public ingress.

In practice this is usually only required when using SignalR with negotiate enabled, which is the default. The preferred workaround is to disable negotiate and always use WebSockets, since modern browsers support WebSockets. If that is not possible, consider using Azure SignalR Service.

#### websocketfriendly

The `websocketfriendly` option is no longer needed. It existed to override Ingress-NGINX defaults by increasing the connection timeout to one hour for long-lived connections.

Istio does not define a default request timeout for this path, so Radix no longer needs a special ingress override for this scenario. If your application still requires explicit timeouts, implement them in the application itself.

### Public ingress configuration

The [`spec.components.network.ingress.public`](../../radix-config/index.md#network-detailed) section is deprecated. These public ingress settings were implemented for Ingress-NGINX and do not carry over to the Gateway API migration.

All settings in this section can be safely disregarded, except `allow`. This includes the following Ingress-NGINX-specific override settings:

- `proxyBodySize`
- `proxyReadTimeout`
- `proxySendTimeout`
- `proxyBufferSize`
- `proxyRequestBuffering`

If you are not using `allow`, no replacement is needed for this section.

The `proxy*` settings were introduced to override default Ingress-NGINX behavior. Istio does not enforce these NGINX-specific request size, timeout, and buffering settings, so they will stop having effect after migration. If your application still depends on these limits or behaviors, enforce them in code or in middleware that you own. That includes request body limits, read and write timeouts, response header limits, and buffering strategy for uploads or streaming requests.

If you are using `allow`, IP filtering must be handled in your application instead of in `radixconfig.yaml`. Configure trusted proxy handling correctly, then inspect the [`X-Forwarded-For`](../../docs/topic-runtime-env/index.md#request-headers) header and apply the allow list in your own code.

See the [NGINX example](#nginx-ip-filtering-example) and [ASP.NET example](#aspnet-ip-filtering-example) below.

## IP filtering examples

:::note
These examples are illustrative only. In most cases they will need to be modified to fit your current code base, framework setup, proxy topology, and deployment configuration.
:::

### NGINX IP filtering example

If your application is fronted by NGINX, configure NGINX to trust the `10.0.0.0/8` private range, derive the client IP from `X-Forwarded-For`, and deny requests that are not in the allowed ranges.

This is safe because only Istio is allowed to connect to containers in an application's environment.

Replace the example allowed client ranges with values that match your setup.

```nginx
server {
	listen 8080;

	real_ip_header X-Forwarded-For;
	real_ip_recursive off;

	# Trust Istio proxies in Radix.
	set_real_ip_from 10.0.0.0/8;

	location / {
		allow 203.0.113.10;
		allow 143.97.110.1/24;
		deny all;

		proxy_pass http://my_app_upstream;
	}
}
```

### ASP.NET IP filtering example

If your application is built with ASP.NET Core, configure forwarded headers so the application trusts the `10.0.0.0/8` private range used by Istio in Radix, then apply IP filtering in middleware.

This is safe because only Istio is allowed to connect to containers in an application's environment.

Replace the example allowed client ranges with values that match your setup.

```csharp
using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
	options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

	// Trust Istio proxies in Radix.
	options.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("10.0.0.0"), 8));
});

var app = builder.Build();

var allowedNetworks = new[]
{
	new System.Net.IPNetwork(IPAddress.Parse("203.0.113.10"), 32),
	new System.Net.IPNetwork(IPAddress.Parse("143.97.110.1"), 24),
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

## Migration checklist

- Update any external DNS A records that point to an Ingress-NGINX load balancer IP so they point to the corresponding Istio IP instead.
- Remove reliance on client certificate authentication.
- Replace `allow` IP filtering with application-level filtering based on trusted proxy handling and `X-Forwarded-For`.
- Remove reliance on `stickysessions`; for SignalR, prefer WebSocket-only transport or Azure SignalR Service.
- Remove `websocketfriendly` if it was only used to work around ingress-nginx timeouts.
- Review all `network.ingress.public` `proxy*` settings and move required limits and timeouts into the application.