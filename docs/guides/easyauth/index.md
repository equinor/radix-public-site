---
title: Radix EasyAuth
---

# Radix EasyAuth

:::info Available in Playground only
EasyAuth is currently available in the [Playground](../../start/radix-clusters/index.md) cluster. We plan to make it available in Platform, Platform 2 and Platform 3 once we've tested it further and collected feedback. Other clusters reject a `radixconfig.yaml` that contains the EasyAuth annotations.
:::

EasyAuth puts every public component of your application behind a sign-in page with a single annotation in `radixconfig.yaml`. You don't need an app registration, a client ID, a client secret or callback URLs. Radix creates and maintains all of it for you, including rotating the client secret.

Use EasyAuth when you want to make sure only Equinor employees and consultants, or members of specific groups, can reach a web application without writing any authentication code.

:::warning
EasyAuth doesn't give your application access tokens. If your application needs to call other APIs on behalf of the user, use the [Radix OAuth2 feature](../authentication/index.md#using-the-radix-oauth2-feature) with your own app registration instead.
:::

## How it works

When you enable EasyAuth, Radix places an [OAuth2 proxy](../authentication/index.md#using-the-radix-oauth2-feature) in front of each public component. The proxy sends users who aren't signed in to a Radix-managed OpenID Connect provider, which signs them in with Microsoft Entra ID. After sign-in, the proxy checks the user's group memberships. By default, all Equinor employees and consultants reach your component, and you can [limit access](#limit-access-to-specific-groups) to members of your own groups. Everyone else gets `403 Forbidden`.

Radix registers a callback URL for every public host of your application, so the default domain names, the [app alias](../../radix-config/index.md#dnsappalias), [DNS aliases](../../radix-config/index.md#dnsalias) and [external aliases](../external-alias/index.md) all work without any extra setup.

## Enable EasyAuth

Add the `easyauth.radix.equinor.com` annotation to the `metadata` section of `radixconfig.yaml`:

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: myapp
  annotations:
    easyauth.radix.equinor.com: "" # This protects all public components
spec:
  environments:
    - name: dev
  components:
    - name: web
      src: .
      ports:
        - name: http
          port: 8080
      publicPort: http
```

The annotation turns EasyAuth on for all public components, and gives every Equinor employee and consultant access. Its value must be an empty string (`""`), and Radix rejects the configuration if you give it any other value.

Commit the change to the config branch. Radix picks it up the next time the configuration is applied, either by a [build-deploy](../build-and-deploy/index.md) job or by the [apply-config](../apply-config/index.md) pipeline. As soon as the new configuration is applied, Radix adds EasyAuth to the active deployment in every environment, so you don't need to build or deploy again. Every deployment you create or [promote](../deployment-promotion/index.md) after that gets EasyAuth too.

Radix redeploys the public components with the OAuth2 proxy in front of them. Until the proxy has its client secret, the component is briefly unreachable instead of unprotected.

To check that it works, open the public URL of a component in a private browser window. You should land on a sign-in page instead of your application.

## Limit access to specific groups

To narrow access down from all Equinor employees and consultants, add the `easyauth.radix.equinor.com/allowed-identities` annotation with a comma-separated list of Microsoft Entra ID security group object IDs:

```yaml
metadata:
  name: myapp
  annotations:
    easyauth.radix.equinor.com: ""
    easyauth.radix.equinor.com/allowed-identities: "00000000-0000-0000-0000-000000000000,11111111-1111-1111-1111-111111111111" # Group Object IDs
```

Your groups replace the default, so only users who are members of at least one of them get access. Like the `easyauth.radix.equinor.com` annotation, changes to the list apply to the active deployments as soon as the configuration is applied. Don't add spaces around the commas or leave empty entries, since Radix rejects values like `"group-a, group-b"` and `"group-a,,group-b"`. Always use it together with `easyauth.radix.equinor.com`, since Radix rejects a configuration that has `allowed-identities` without it.

You'll find the object ID of a group on the group's overview page in the Microsoft Entra admin center, or with the Azure CLI:

```bash
az ad group show --group "My team" --query id --output tsv
```

Only security groups grant access. Microsoft 365 groups that aren't security-enabled don't show up in the user's group list.

Radix reads the user's groups when they sign in. A user who was just added to a group may need to sign out and back in before they get access. They can sign out by opening `/oauth2/sign_out` on your component's URL.

:::info
EasyAuth only supports groups for now. Granting access to individual users may come later.
:::

## What your application receives

The OAuth2 proxy forwards information about the signed-in user to your component in these request headers:

- `X-Forwarded-User`
- `X-Forwarded-Email`
- `X-Forwarded-Preferred-Username`
- `X-Forwarded-Groups`

Your application can use them to show who's signed in or to make finer-grained authorization decisions. The proxy doesn't forward access tokens or an `Authorization` header.

:::warning
Only the OAuth2 proxy sets these headers on requests from the internet. Other components and jobs in the same environment can call your component directly and bypass the proxy, so don't trust the headers on requests that don't come through it.
:::

## See who signed in

The OAuth2 proxy logs every sign-in and every request it passes on to your component, together with the signed-in user. Read more about what the log contains and how to find it in [OAuth2 proxy logs](../authentication/index.md#oauth2-proxy-logs).

The Radix Web Console only shows the log of the running proxy replicas, so the entries disappear from the console when the proxy restarts, for example when you deploy a new version or when Radix rotates the client secret. Radix still retains a copy of the log for 30 days, and keeps it in cold storage for another 60 days after that. If you need a record that lasts longer, log the `X-Forwarded-User` or `X-Forwarded-Email` header from your component.

The log contains personal data about everyone who signs in or tries to, and both your team and the Radix platform team can read it. Read more in [GDPR - Personal data in the logs](../authentication/index.md#oauth2-proxy-logs).

## What EasyAuth changes in your configuration

EasyAuth applies to every public component in the application. It replaces the `authentication.oauth2` section of each public component with a Radix-managed configuration, and it removes `authentication.oauth2` from their `environmentConfig` sections. Radix ignores any OAuth2 settings you've set yourself on public components, including `clientId`, `sessionStoreType` and `skipAuthRoutes`. Private components and jobs stay unchanged.

The managed configuration stores sessions in a Radix-managed Redis cache (`sessionStoreType: systemManaged`) and uses `/oauth2` as `proxyPrefix`.

:::warning
Since `skipAuthRoutes` isn't supported, every path requires sign-in. If one of your public components is an API that other services call, or an external uptime monitor checks a health endpoint, the proxy redirects those requests to the sign-in page too. Radix's own health checks talk to your container directly and aren't affected.
:::

## Client secret rotation

Radix rotates the client secret every 90 days and restarts the OAuth2 proxy with the new secret. You don't need to do anything. A user who signs in or refreshes their session right while the proxy restarts might see a failed sign-in, and trying again fixes it.

## Disable EasyAuth

Remove `easyauth.radix.equinor.com` and, if you use it, `easyauth.radix.equinor.com/allowed-identities` from `radixconfig.yaml` and commit the change. Radix rejects the configuration if you leave `allowed-identities` behind.

Unlike enabling, disabling doesn't change the active deployments. They keep EasyAuth, and sign-in keeps working, until you deploy a new version to each environment with a [build-deploy](../build-and-deploy/index.md) job. This way, your components never become publicly reachable just because the configuration changed. Until you deploy, Radix stops rotating the client secret and no longer registers callback URLs for new aliases.

Deployments created while EasyAuth was enabled still contain the EasyAuth configuration. If you [promote](../deployment-promotion/index.md) one of them after disabling EasyAuth, sign-in stops working in the target environment, so only promote deployments created after you removed the annotations.

:::warning
Without EasyAuth, your public components are open to the internet unless you've configured [authentication](../authentication/index.md) yourself. Set that up before you remove the annotations.
:::

## Troubleshooting

`EasyAuth is not available in this cluster`<br/>
Your application runs in a cluster where EasyAuth isn't installed yet. Remove the annotations, or use the Playground cluster.

Radix rejects the configuration<br/>
Check that `easyauth.radix.equinor.com` is present and has an empty value (`""`). If you use `allowed-identities`, make sure it sits next to `easyauth.radix.equinor.com` and contains no spaces or empty entries. When you disable EasyAuth, remove both annotations.

Users get `403 Forbidden` after signing in<br/>
The user isn't a member of any of the groups in `allowed-identities`, or a group isn't a security group. If they were added recently, ask them to sign out and back in.

## Give us feedback

EasyAuth is new, and your feedback decides how it evolves before it reaches the Platform clusters. Let us know what works and what doesn't through the channels listed on the [community page](../../community/index.md).
