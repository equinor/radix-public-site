---
title: Egress
---

# Egress

Egress traffic has two aspects: what external addresses a component is allowed to connect to, and what public IP address the external service sees the component connecting from. This guide covers the public egress address first, then how to configure outbound traffic rules in `radixconfig.yaml`.

## Public egress addresses

When a component connects out to an external service, the service sees the connection coming from one of the cluster's public egress IP addresses (source IP), not from the component itself.

Each Radix cluster has its own set of egress addresses. You can find them on the **About** page in Radix Web Console for the cluster where your application is running.

Use these addresses to configure firewall rules on external services, allowing traffic from applications running in Radix. Since the addresses are shared by every application in the cluster, a firewall rule that allows traffic from them permits traffic from any Radix application in that cluster, not just yours.

## Configure outbound traffic rules

Use the [egress configuration](../../radix-config/index.md#egress) in `radixconfig.yaml` to define what a component is allowed to connect to.

### Built-in rules

Radix applies two built-in egress rules to every application environment:

1. TCP and UDP port 53 to the internal Radix DNS service
1. All TCP and UDP ports to all jobs and components in the same [Radix application environment](../../start/radix-concepts/index.md#environment)

### Limitations

The following limitations currently apply:

* Egress configuration only applies per application [environment](../../start/radix-concepts/index.md#environment). Egress configurations specific to [components](../../start/radix-concepts/index.md#component) or [jobs](../../start/radix-concepts/index.md#job) aren't supported yet.
* Destinations in egress rules must be IPv4 subnets. IPv6 subnets and FQDNs aren't supported.
* Network traffic logs to debug egress configurations aren't available yet.

### Allow traffic for OAuth2

If a Radix application uses the [Radix OAuth2 feature](../authentication/#using-the-radix-oauth2-feature), Radix automatically opens the necessary egress rules.

However, if an application uses a custom OAuth2 implementation, you must allow traffic to the identity provider (IDP) in the egress rules. If the IDP is Microsoft, the application needs outbound access to login.microsoftonline.com, TCP port 443. This domain has used the IP ranges 20.190.128.0/18 and 40.126.0.0/18 since at least August 2020, according to the [git history of the Microsoft 365 documentation](https://github.com/MicrosoftDocs/microsoft-365-docs/commit/589c327b139be96eca71128d36109ef7d56c39eb). Check the [Microsoft 365 documentation](https://docs.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges?view=o365-worldwide#microsoft-365-common-and-office-online) for the current ranges before configuring egress rules, since they can change.

### Allow traffic to Azure service

#### Use Private Link

To create a stable egress rule that allows traffic to an Azure resource, use a [Private Link from the Radix cluster](../../docs/topic-private-link/index.md) to the SaaS service. A Private Link provides a stable IPv4 address from the RFC1918 range which will not change during the lifetime of the Private Link. This address can be safely referred to in egress rules in `radixconfig.yaml`.

#### Allow traffic to public IP

If a Radix application needs outbound access to an Azure resource without a static IP, you can use the IP ranges defined in [Azure service tags](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview). A mapping between service tags and IP ranges [can be downloaded in JSON format](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview#discover-service-tags-by-using-downloadable-json-files).

Example: suppose an application needs to connect to an Azure SQL server in the North Europe Azure region. The public IP address of this server is guaranteed to be within the IP ranges of the `Sql.NorthEurope` service tag. As an illustration, this service tag corresponded to the following IPv4 ranges in February 2022 — treat this as a historical example only, and always [download the current ranges](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview#discover-service-tags-by-using-downloadable-json-files) before configuring a rule:

:::warning
13.69.224.0/26, 13.69.224.192/26, 13.69.225.0/26, 13.69.225.192/26, 13.69.233.136/29, 13.69.239.128/26, 13.74.104.64/26, 13.74.104.128/26, 13.74.105.0/26, 13.74.105.128/26, 13.74.105.192/29, 20.50.73.32/27, 20.50.73.64/26, 20.50.81.0/26, 23.102.16.130/32, 23.102.52.155/32, 40.85.102.50/32, 40.113.14.53/32, 40.113.16.190/32, 40.113.93.91/32, 40.127.128.10/32, 40.127.137.209/32, 40.127.141.194/32, 40.127.177.139/32, 52.138.224.0/26, 52.138.224.128/26, 52.138.225.0/26, 52.138.225.128/26, 52.138.229.72/29, 52.146.133.128/25, 65.52.225.245/32, 65.52.226.209/32, 104.41.202.30/32, 191.235.193.75/32, 191.235.193.139/32, 191.235.193.140/31
:::

An appropriate egress rule could be to allow outbound traffic to the current ranges on TCP port 1433. Be wary of allowing traffic to service tags, which can include IP addresses belonging to arbitrary services controlled by malicious actors. For example, allowing traffic to the `AzureCloud.NorthEurope` service tag introduces more risk than allowing only the `Sql.NorthEurope` tag, since it also covers unrelated services.

These IP ranges are also subject to frequent change: between April 2021 and February 2022 alone, the `Sql.NorthEurope` tag was revised 8 times, with 24 of the original addresses removed and 224 new addresses added.
