---
title: OAuth 2.0 Header Migration Guide
---

# What's changing?
We're updating our platform's authentication setup.
The only visible change is a switch in which headers carry user identity information.
Today, if you have set the [`setXAuthRequestHeaders`](../../radix-config/index.md#oauth2) property to _true_ in _radixconfig.yaml_, your application receives both _X-Auth-Request-*_ and _X-Forwarded-*_ identity headers like:
- _X-Auth-Request-User_
- _X-Forwarded-User_

After migrating to the new setup, only _X-Forwarded-*_ headers will remain.

:::info
For now you can choose to opt-in to this change, but this migration will be enforced for all applications **in two weeks** on February 16th.
:::

# Why this change is happening
Ingress-nginx, our current ingress controller, will be retired in March 2026. To prepare for this, we're upgrading our infrastructure to use a new ingress controller called Istio, which will improve performance and reliability.

This upgrade requires us to update how OAuth2Proxy operates. Currently, it relies on nginx-specific directives that are not compatible with Istio. To make it compatible with our new infrastructure, we're moving the OAuth2Proxy from sidecar mode to proxy mode. As a side effect of this architectural change, the headers carrying user information will change from _X-Auth-Request-*_ to _X-Forwarded-*_ headers.

# What do you need to do?
If you have not set the [`setXAuthRequestHeaders`](../../radix-config/index.md#oauth2) property (or set it to _false_), you do not have to do anything.
If you have set it to _true_ and your application reads user information from request headers, update it to use _X-Forwarded-*_ instead of _X-Auth-Request-*_.
Currently both header types are available.
This is the only required code change.

# How to enable the new header format (opt-in)
Currently both header formats exist (with the same values), so you can safely test before opting in.
You choose when to switch by adding the `radix.equinor.com/preview-oauth2-proxy-mode` annotation to your _radixconfig.yaml_ file.
The value for this annotation is a comma-separated list of environments where you want to enable proxy mode. You can also set a wildcard (`*`) to cover all environments.

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: my-app
  annotations:
    radix.equinor.com/preview-oauth2-proxy-mode: "dev,qa"
```

After adding the annotation you need to deploy your application to the affected environments again.

# What to expect during the switch
There may be a couple of seconds of downtime during the switch.
After the switch, Only _X-Forwarded-*_ headers remain.
No changes to login flow, authentication prompts, or tokens.

# Summary
You need to:

- Update your app to read _X-Forwarded-*_ headers
- Add the opt‑in annotation when ready
- Redeploy your application
