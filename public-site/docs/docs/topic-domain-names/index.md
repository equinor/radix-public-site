---
title: Domain names
---

# Domain names

There can be several domain names mapped to [application components](/start/radix-concepts/index.md#component) in Radix. In general you will want to use the [public name](#public-name), but you should understand all options.

The domain names are composed by combining information about the application, and the Radix cluster where the application is hosted:

- `component-name`: The name of a component, e.g. `frontend`.
- `app-name`: The name of the application, e.g. `myapp`.
- `env-name`: The name of the environment where the component is deployed to, e.g. `production`.
- `cluster-name`: The name of the underlying Kubernetes cluster used for hosting a specific [Radix cluster](../../start/radix-clusters/), e.g. `eu-18`. This value can change, for example during upgrade of a Radix cluster. Domain names using this value should only be used for debugging purposes, and should never be used by end users/services.
- `cluster-dns-zone`: The DNS zone for the [Radix cluster](../../start/radix-clusters/) where the application is hosted, e.g. `radix.equinor.com`.

## Canonical name

```text
[component-name]-[app-name]-[env-name].[cluster-name].[cluster-dns-zone]
```

The authoritative name for a specific component in a specific Kubernetes and Radix cluster. The _canonical name_ should never be used by end users/services, but can be useful for debugging purposes, for example during Radix cluster upgrade that requires a new Kubernetes cluster.

- Automatically allocated
- One per component

Examples:

- `serializer-oneapp-qa.eu-18.radix.equinor.com`
- `frontend-myapp-production.c2-11.c2.radix.equinor.com`
- `backend-myapp-production.playground-92.playground.radix.equinor.com`

## Public name

```text
[component-name]-[app-name]-[env-name].[cluster-dns-zone]
```

- Automatically allocated
- One per component

Examples:

- `serializer-oneapp-qa.radix.equinor.com`
- `frontend-myapp-production.c2.radix.equinor.com`
- `backend-myapp-production.playground.radix.equinor.com`

## App default alias

```text
[app-name].app.[cluster-dns-zone]
```

The _app default alias_ is a convenience domain name to make it easier to publish and use your application. It points to a specific component and environment in your application, and allows a reasonable URL to be distributed to end users/services without the hassle of setting up [external aliases](#external-alias).

- One per application
- [Defined in `radixconfig.yaml`](/radix-config/index.md#dnsappalias)

Examples:

- `oneapp.app.radix.equinor.com`
- `theapp.app.c2.radix.equinor.com`
- `myapp.app.playground.radix.equinor.com`

## App alias

```text
[subdomain].[cluster-dns-zone]
```

The _app alias_ allows you to configure a custom subdomain in the `[cluster-dns-zone]` where the application is hosted. With the exception of a few reserved names, the rule is _"first come, first served"_.


- Multiple allowed per component
- [Defined in `radixconfig.yaml`](/radix-config/index.md#dnsalias)

Examples:

- `oneapp.radix.equinor.com`
- `otherapp.c2.radix.equinor.com`
- `myapp.playground.radix.equinor.com`

## External alias

```text
[a valid external DNS name]
```

For ultimate customisation of your domain names, you can "bring your own" domain into Radix with an _external alias_. There is a [detailed guide](/guides/external-alias/) on how to configure this.

- Multiple allowed per component
- [Defined in `radixconfig.yaml`](/radix-config/index.md#dnsexternalalias)
- Requires external DNS alias management
- Bring your own TLS certificate, or let Radix handle it

Examples:

- `myapp.equinor.com`
- `www.mydomain.com`
