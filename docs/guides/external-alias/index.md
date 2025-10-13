---
title: DNS Alias and certificate
---
# Configure External DNS Alias and automatically get Equinor certificate 


An application can be configured to use external DNS aliases, in addition to the automatically generated [domain names](/docs/topic-domain-names/index.md), provided you register the DNS record and optionally bring the corresponding TLS certificate into Radix. Traffic routing is configured in [`dnsExternalAlias`](/radix-config/index.md#dnsexternalalias) in `radixconfig.yaml`.

An application can be configured to use external DNS aliases, in addition to the automatically generated [domain names](/docs/topic-domain-names/index.md), provided you register the DNS record and bring the corresponding TLS certificate into Radix. Traffic routing is configured in [`dnsExternalAlias`](/radix-config/index.md#dnsexternalalias) in `radixconfig.yaml`.

The external DNS record must point to the [public name](/docs/topic-domain-names/index.md#public-name) of a component, to the [app default alias](/docs/topic-domain-names/index.md#app-default-alias) or to the [app alias](/docs/topic-domain-names/index.md#app-alias).


`useCertificateAutomation` in [`dnsExternalAlias`](/radix-config/index.md#dnsexternalalias) controls if the TLS certificate is automatically managed by Radix, or manually by you.

## Acquire a DNS record in the equinor.com zone

The process for setting up the DNS record depends on the service used to register and manage the DNS zone. This guide assumes registration of a DNS record in the `equinor.com` zone, but you should be able to adapt the instructions to a third-party provider.

1. Open the [Services@Equinor](https://equinor.service-now.com/selfservice) portal and find the service "Domain name system (DNS)"
1. Select option `New` in `Select service`
1. In `Where should the DNS record be added, changed or deleted?`, select if you only need `Internal DNS Service` (accessible only from Equinor internal network) or `Internal and external DNS service` (accessible from both Equinor internal network and Internet).
1. Enter the host name in `Host name` (exclude `.equinor.com` suffix).
1. Select `CNAME` in the `Type` drop down.
1. In the `Data (IP or FQDN)` field, enter the [public name](/docs/topic-domain-names/index.md#public-name), [app default alias](/docs/topic-domain-names/index.md#app-default-alias) or [app alias](/docs/topic-domain-names/index.md#app-alias) for which the new DNS record should point to.  

:::tip Example

```text
Select service:
New

Where should the DNS record be added, changed or deleted?:
Internal and external DNS service

Host name:
myapp

Type:
CNAME

Data (IP or FQDN):
frontend-myapp-prod.radix.equinor.com
```

:::

## Configure certificate automation service 

### Configure `dnsExternalAlias` in radixonfig.yaml

Add the alias to `dnsExternalAlias` in [radixconfig.yaml](../../radix-config/index.md#dnsexternalalias). You can add multiple entries as long as the `alias` value is unique. The referenced environment must be re-deployed in order for the changes to take effect.

If `useCertificateAutomation` is `true`, the external DNS record must be created in order for Radix to start the automatic certificate issuing process. `digicert.com` must also be authorized (from [CAA](https://en.wikipedia.org/wiki/DNS_Certification_Authority_Authorization) records) to issue certificates to the `alias`. You can use an online tool like [Entrust CAA Lookup](https://www.entrust.com/resources/tools/caa-lookup) to check this.

``` yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: myapp
spec:
  ...
  dnsExternalAlias:
    - alias: myapp.equinor.com
      component: frontend
      environment: prod
      useCertificateAutomation: false|true
```

You can also add and maintain the [certificates manually](../external-alias-certificate/)