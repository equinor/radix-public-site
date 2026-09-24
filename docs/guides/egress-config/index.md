---
title: Egress
---

# Egress

The [egress configuration](../../radix-config/index.md#egress) defines rules for outbound traffic from a Radix application.

## Built-in rules

Two built-in egress rules are applied to every Radix application environment:

1. TCP and UDP port 53 to the internal Radix DNS service
1. all TCP and UDP ports to all jobs and components in the same [Radix application environment](../../start/radix-concepts/index.md#environment)

## Limitations

As of May 2022, the following limitations apply

* Egress configuration only applies per application [environment](../../start/radix-concepts/index.md#environment). Egress configurations which are specific for [components](../../start/radix-concepts/index.md#component) or [jobs](../../start/radix-concepts/index.md#job) are currently not supported.
* Destinations in egress rules must be IPv4 subnets. IPv6 subnets or FQDNs are currently not supported.
* Network traffic logs to debug egress configurations are currently not available.

## Allow traffic for OAuth2

If a Radix application uses the [Radix OAuth2 feature](../authentication/#using-the-radix-oauth2-feature), necessary openings in the egress configuration are automatically taken care of.

However, if an application uses a custom OAuth2 implementation, it is necessary to allow traffic to identity provider (IDP) in the egress rules. If the IDP is Microsoft, the application needs outbound access to login.microsoftonline.com, TCP port 443. As of February 2022, this domain has IP ranges 20.190.128.0/18 and 40.126.0.0/18 ([link to Microsoft 365 documentation](https://docs.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges?view=o365-worldwide#microsoft-365-common-and-office-online)). The [git history of the Microsoft 365 documentation](https://github.com/MicrosoftDocs/microsoft-365-docs/commit/589c327b139be96eca71128d36109ef7d56c39eb) shows these ranges have remained stable since at least August 2020.

## Allow traffic to Azure service

### Private Link preferred option

Private Links are the preferred way to connect a Radix application to an Azure SaaS service. Create a [Private Link from the Radix cluster](../../docs/topic-private-link/index.md) to the SaaS service, then use the private IPv4 address in your egress rules. A Private Link provides a stable IPv4 address from the RFC1918 range, and that address will not change during the lifetime of the Private Link. You can safely refer to it in egress rules in `radixconfig.yaml`.

#### Firewall rules

If the target service also needs to allow traffic from the Radix cluster, find the cluster's outbound IP addresses in Radix Web Console. Click the `i` icon in the top right corner for the cluster you use, and check the About page. These IP addresses are specific to each cluster, so use the values shown for the cluster where your application runs. 

### Allow traffic to public IP

If a Radix application needs outbound access to an Azure SaaS service without Private Link or another static IP, it may be possible to use the IP ranges defined in [Azure service tags](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview). A mapping between service tags and IP ranges [can be downloaded in JSON format](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview#discover-service-tags-by-using-downloadable-json-files).

Example: suppose an application needs to connect to an Azure SQL server in the North Europe Azure region. The public IP address of this server is guaranteed to be within the IP ranges of the `Sql.NorthEurope` service tag. 

An appropriate egress rule could be to allow outbound traffic to these IPv4 ranges on TCP port 1433. Be wary of allowing traffic to service tags which can comprise IP addresses belonging to arbitrary services controlled by malicious actors. E.g., one can argue that a rule which allows traffic to the `AzureCloud.NorthEurope` service tag introduces greater risk than a rule which merely allows the `Sql.NorthEurope` tag.

However, these IP ranges are subject to change. As of February 2022, the `Sql.NorthEurope` tag has been subject to 11 revisions during its lifetime, 8 of which have happened between April 2021 and February 2022. 24 out of 961 IPv4 addresses which were included in the tag in April 2021, are no longer present in February 2022. 224 out of 1161 IPv4 addresses which are included as of February 2022, were not included in April 2021.
