---
title: OAuth2 Proxy Mode Migration
---

# OAuth2 Proxy Mode Migration

:::info Migration Status
Proxy mode is coming soon. You can prepare your application now by migrating to the new request headers.
:::

## Overview

Radix is introducing a new architecture for OAuth2 authentication where the OAuth2 proxy runs **in front** of your component (proxy mode) rather than **alongside** it (sidecar mode).

This change improves performance, simplifies the request flow, and better aligns with standard reverse proxy patterns used across the industry.

### What's Changing?

**Current Architecture (Sidecar Mode):**

In sidecar mode, the OAuth2 proxy runs as a separate container alongside your component. Your component receives requests directly from the ingress, and the OAuth2 proxy validates authentication separately.

```
Internet → Ingress → Your Component
                  ↓
            OAuth2 Sidecar
```

**New Architecture (Proxy Mode):**

In proxy mode, the OAuth2 proxy sits in front of your component and handles all authentication before forwarding requests to your application.

```
Internet → Ingress → OAuth2 Proxy → Your Component
```

### Benefits of Proxy Mode

- **Simplified architecture** - Single request path instead of parallel authentication
- **Better performance** - Reduced overhead and network hops
- **Standard patterns** - Aligns with industry-standard reverse proxy authentication
- **Improved security** - All requests are authenticated before reaching your component
- **Easier debugging** - Clearer request flow and logging

## Migration Timeline

### Phase 1: Header Preparation (Current)

Both old (`X-Auth-Request-*`) and new (`X-Forwarded-*`) headers are available in sidecar mode. This allows you to update your application to use the new headers before switching to proxy mode.

**Action Required:** Update your application code to read from the new `X-Forwarded-*` headers.

### Phase 2: Proxy Mode Opt-In (Coming Soon)

Proxy mode will be available as an opt-in feature via configuration in `radixconfig.yaml`. You'll be able to test and switch at your own pace.

**Action Required:** Switch to proxy mode when your application is ready.

### Phase 3: Sidecar Mode Deprecation (Future)

After a transition period, sidecar mode will be deprecated and proxy mode will become the default. The old `X-Auth-Request-*` headers will be removed.

**Action Required:** Ensure you've completed migration before this phase.

## Request Header Changes

When `setXAuthRequestHeaders` is enabled, the OAuth2 service adds authentication claims as HTTP headers to requests sent to your component. The header names are changing to align with proxy mode.

### Header Mapping

| Old Header (Sidecar Mode) | New Header (Proxy Mode) | Description |
|---------------------------|-------------------------|-------------|
| `X-Auth-Request-User` | `X-Forwarded-User` | User identifier from access token |
| `X-Auth-Request-Groups` | `X-Forwarded-Groups` | User groups from access token |
| `X-Auth-Request-Email` | `X-Forwarded-Email` | User email from access token |
| `X-Auth-Request-Preferred-Username` | `X-Forwarded-Preferred-Username` | Preferred username from access token |
| `X-Auth-Request-Access-Token` | `X-Forwarded-Access-Token` | The access token itself |

### During Transition Period

**Both header sets are currently available** in sidecar mode. Your application will receive both old and new headers simultaneously, allowing you to migrate before activating proxy mode.

Once you switch to proxy mode, only the new `X-Forwarded-*` headers will be available.

## How to Migrate Your Application

### Step 1: Update Your Application Code

Modify your application to read from the new `X-Forwarded-*` headers instead of the old `X-Auth-Request-*` headers.

### Step 2: Test Locally

Test your changes locally to ensure the new headers are being read correctly. You can verify that both header sets are present in your current sidecar mode deployment.

### Step 3: Switch to Proxy Mode (When Available)

Once proxy mode is available and your application is updated:

1. Update your `radixconfig.yaml` to enable proxy mode (configuration details coming soon)
2. Deploy the configuration change
3. Verify that authentication works with proxy mode enabled
4. Roll out to production

## Configuration

:::info Coming Soon
Configuration options for enabling proxy mode will be added to `radixconfig.yaml`. This documentation will be updated when the feature is available.
:::

The configuration will likely be added to the `authentication.oauth2` section. Stay tuned for updates.

## Troubleshooting

### Headers Not Present

**Issue:** The new `X-Forwarded-*` headers are not present in requests.

**Solution:** Ensure that `setXAuthRequestHeaders: true` is configured in your `radixconfig.yaml` under the component's `authentication.oauth2` section.

### Headers Have Empty Values

**Issue:** The new headers are present but contain empty values.

**Solution:** Verify that your OAuth2 configuration is correct, including `clientId`, `scope`, and that authentication is working properly. Check the OAuth2 service logs in the Radix console.

### Different Values Between Old and New Headers

**Issue:** The old and new headers contain different values (during transition period).

**Solution:** This shouldn't happen - both header sets should contain identical values. If you observe this, please report it as a bug via the `#omnia_radix` Slack channel.

### Application Breaks After Switching to Proxy Mode

**Issue:** Authentication fails after enabling proxy mode.

**Solution:** 
1. Verify your application is reading from `X-Forwarded-*` headers, not `X-Auth-Request-*` headers
2. Check the OAuth2 proxy logs for errors
3. Temporarily roll back to sidecar mode and investigate
4. Contact support in `#omnia_radix` if the issue persists

## Frequently Asked Questions

### Do I need to migrate immediately?

No. Both header formats are available during the transition period. However, we recommend migrating as soon as practical to be ready when proxy mode becomes available.

### Will my application break if I don't migrate?

Not immediately. Sidecar mode will continue to work during the transition period. However, when proxy mode becomes the default in the future, applications still using old headers will need to be updated.

### Can I use both headers during the transition?

While both headers are available, we recommend updating your code to use only the new `X-Forwarded-*` headers to avoid confusion and ensure a smooth transition.

### What if I have multiple components with OAuth2?

Each component needs to be migrated independently. You can migrate components at different times - they don't all need to be updated simultaneously.

### How long will the transition period last?

The transition period will be announced via the `#omnia_radix` Slack channel. We'll provide ample notice before sidecar mode is deprecated.

### Will this affect my OAuth2 configuration in radixconfig.yaml?

The OAuth2 configuration options (`clientId`, `scope`, `setXAuthRequestHeaders`, etc.) will remain the same. Additional configuration for enabling proxy mode will be added later.

### Does this affect the Authorization header?

No. The `Authorization: Bearer` header (controlled by `setAuthorizationHeader`) is not affected by this change and will continue to work the same way.

### Where can I get help?

- Join the `#omnia_radix` Slack channel for questions and support
- Check the [main OAuth2 authentication guide](./index.md)
- Review the [radixconfig.yaml reference](../../radix-config/index.md#oauth2)

## Additional Resources

- [OAuth2 Authentication Guide](./index.md)
- [radixconfig.yaml OAuth2 Reference](../../radix-config/index.md#oauth2)
- [Radix Runtime Environment](../../docs/topic-runtime-env/index.md)

---

**Last Updated:** December 2025  
**Status:** Phase 1 - Header preparation active