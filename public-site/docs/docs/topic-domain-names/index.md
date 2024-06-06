---
title: Domain names
---

# Domain names

There can be several domain names mapped to [application components](/start/radix-concepts/index.md#component) in Radix. In general you will want to use the [public name](#public-name), but you should understand all options.

:::tip Domain names
Some domain names include a `clusterEnvNamepace` component. This varies depending on the type of cluster. In Radix there are two(three) **cluster types**; these are the values for `clusterEnvNamepace` in each type

 - platform (_blank_) - (eu-"weeknumber")
 - playground (`playground`) - (playground-"weeknumber")
 - (dev (`dev`))
:::

## Canonical name

```text
[componentName]-[appName]-[envName].[clusterName].[clusterEnvNamepace].radix.equinor.com
```

The authoritative name for a specific component in a specific cluster. The _canonical name_ can be useful when debugging, however.

- Always allocated
- Automatically allocated
- One per component

Examples:

- `frontend-myapp-production.playground-92.playground.radix.equinor.com`
- `backend-myapp-production.playground-92.playground.radix.equinor.com`
- `serializer-oneapp-qa.eu-12.radix.equinor.com`

## Public name

```text
[componentName]-[appName]-[envName].[clusterEnvNamepace].radix.equinor.com
```

- Automatically allocated
- One per component

Examples:

- `frontend-myapp-production.playground.radix.equinor.com`
- `backend-myapp-production.playground.radix.equinor.com`
- `serializer-oneapp-qa.radix.equinor.com`

## App default alias

```text
[appName].app.[clusterEnvNamepace].radix.equinor.com
```

The _app default alias_ is a convenience domain name to make it easier to publish and use your application. It points to a specific component and environment in your application, and allows a reasonable URL to be distributed to end-users without the hassle of setting up [external aliases](#external-alias).

- One per application
- [Defined in `radixconfig.yaml`](/radix-config/index.md#dnsappalias)

Examples:

- `myapp.app.playground.radix.equinor.com`
- `oneapp.app.radix.equinor.com`

## App alias

```text
[appName].[clusterEnvNamepace].radix.equinor.com
```
`dnsAlias` creates one or several DNS aliases in the form of `<alias>.radix.equinor.com` for the specified environment and component. There are few reserved aliases which cannot be used:

- Difference from App default alias - it does not have `app.` domain before `radix.equinor.com` and there can be multiple aliases per application, per environment, per component
- [Defined in `radixconfig.yaml`](/radix-config/index.md#dnsalias)

Examples:

- `myapp.playground.radix.equinor.com`
- `oneapp.radix.equinor.com`

## External alias

```text
[whatever]
```

For ultimate customisation of your domain names, you can "bring your own" domain into Radix with an _external alias_. There is a [detailed guide](/guides/external-alias/) on how to configure this.

- Multiple allowed per component
- [Defined in `radixconfig.yaml`](/radix-config/index.md#dnsexternalalias)
- Requires external DNS alias management
- Requires custom TLS certificate

Examples:

- `cowabunga.equinor.com`
- `cheap-domains-r-us.net`
- `go0gle.com`
