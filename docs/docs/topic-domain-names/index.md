---
title: Domain names
---

# Domain names

Radix supports several domain names for each [application component](../../start/radix-concepts/index.md#component). Each domain name uses details from your application and the [Radix cluster](../../start/radix-clusters/index.md) hosting it.

**Domain name elements:**

- `component-name`: Component name, e.g. `frontend`
- `app-name`: Application name, e.g. `myapp`
- `env-name`: Environment name, e.g. `production`
- `cluster-name`: Used only in [canonical name](#canonical-name); refers to the underlying Kubernetes cluster, e.g. `eu-18`. This value may change and is for debugging only.
- `cluster-dns-zone`: DNS zone for the Radix cluster, e.g. `radix.equinor.com`, `playground.radix.equinor.com`

---

## Public name

Format:
```text
[component-name]-[app-name]-[env-name].[cluster-dns-zone]
```

- Created automatically
- Unique for each component and environment

**Examples:**
- `serializer-oneapp-qa.radix.equinor.com`
- `frontend-myapp-production.c2.radix.equinor.com`
- `backend-myapp-production.playground.radix.equinor.com`

---

## App default alias

Format:
```text
[app-name].app.[cluster-dns-zone]
```

The app default alias provides a simple, shareable domain name for your application. It points to a specific component and environment.

- One per application
- Set in [`radixconfig.yaml`](../../radix-config/index.md#dnsappalias)

**Examples:**
- `oneapp.app.radix.equinor.com`
- `otherapp.app.c2.radix.equinor.com`
- `myapp.app.playground.radix.equinor.com`

---

## App alias

Format:
```text
[subdomain].[cluster-dns-zone]
```

App aliases let you choose a custom subdomain within the cluster DNS zone. Most names are available on a first-come, first-served basis.

- Multiple aliases allowed per component
- Set in [`radixconfig.yaml`](../../radix-config/index.md#dnsalias)

**Examples:**
- `oneapp.radix.equinor.com`
- `otherapp.c2.radix.equinor.com`
- `myapp.playground.radix.equinor.com`

---

## External alias

Format:
```text
[a valid external DNS name]
```

Use an external alias to bring your own domain name to Radix. See the [external alias guide](../../guides/external-alias/index.md) for setup instructions.

- Multiple aliases allowed per component
- Set in [`radixconfig.yaml`](../../radix-config/index.md#dnsexternalalias)
- Requires external DNS management
- Use your own TLS certificate or [let Radix manage it](../../guides/external-alias/index.md#configure-certificate-automation-service)

**Examples:**
- `myapp.equinor.com`
- `www.mydomain.com`

---

## Canonical name

Format:
```text
[component-name]-[app-name]-[env-name].[cluster-name].[cluster-dns-zone]
```

The canonical name is the technical, authoritative domain for a component in a specific Kubernetes and Radix cluster.

- Created automatically
- One per component

:::warning
Do not use the canonical name for end users or services. The `cluster-name` can change without notice.
:::

**Examples:**
- `serializer-oneapp-qa.eu-18.radix.equinor.com`
- `frontend-myapp-production.c2-11.c2.radix.equinor.com`
- `backend-myapp-production.playground-92.playground.radix.equinor.com`
