---
title: Egress rules
---

# Egress rules

[Egress rules](../../references/reference-radix-config/#egressrules) are rules which deny outbound traffic from a Radix application. 

## Default rules
Two egress rules are applied by default to every Radix application environment: 

1. TCP and UDP port 53 to the internal Radix DNS service 
2. all TCP and UDP ports to all jobs and components in the same [Radix application environment](../../docs/topic-concepts/#environment)

## Limitations
As of February 2022, the following limitations apply

* Egress rules are only configurable per application [environment](../../docs/topic-concepts/#environment). Rules which are specific for [components](../../docs/topic-concepts/#component) or [jobs](../../docs/topic-concepts/#job) are currently not supported.
* Destinations in egress rules must be IPv4 subnets. IPv6 subnets or FQDNs are currently not supported.
* Network traffic logs to debug egress rules are currently not available.

## Allow traffic to Radix
As of February 2022, the Radix cluster does not have a static ingress IP range. If there is a need to whitelist egress traffic from a Radix application to another Radix application, it must be anticipated that the Radix ingress IP can change, and that the egress rules will need periodic updates. The ingress IP of the cluster remains static during the lifetime of the cluster, but will change whenever the cluster is redeployed. Empirically, these events occur every few months, and are announced a week in advance on the [#omnia-radix slack channel](https://equinor.slack.com/archives/C8U7XGGAJ). However, there are two caveats: 
1. The new cluster IP is not known until the cluster deployment is complete 
2. In response to disaster recovery scenarios, the cluster ingress IP may change without warning

### Workaround with APIM
A viable workaround in order to make a stable egress rule to another Radix application, is to expose the API of a receiving Radix application in Equinor's [APIM](https://docs.omnia.equinor.com/services/apim/), and configure the egress rules to allow outbound traffic to APIM. Empirically, the public IP addresses of the APIM gateway change less frequently than the ingress IPs of the Radix cluster.

## Allow traffic for OAuth2
If a Radix application uses the [Radix OAuth2 feature](../authentication/#using-the-radix-oauth2-feature), it needs outbound access to login.microsoftonline.com, TCP port 443. As of February 2022, this domain has IP ranges 20.190.128.0/18 and 40.126.0.0/18 ([link to Microsoft 365 documentation](https://docs.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges?view=o365-worldwide#microsoft-365-common-and-office-online)). The [git history of the Microsoft 365 documentation](https://github.com/MicrosoftDocs/microsoft-365-docs/commit/589c327b139be96eca71128d36109ef7d56c39eb) shows these ranges have remained stable since at least August 2020.

## Allow traffic to Azure service
If a Radix application needs outbound access to some Azure SaaS service without a static IP, it may be possible to use the IP ranges defined in [Azure service tags](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview). A mapping between service tags and IP ranges [can be downloaded in JSON format](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview#discover-service-tags-by-using-downloadable-json-files). 

Example: suppose an application needs to connect to an Azure SQL server in the North Europe Azure region. The public IP address of this server is guaranteed to be within the IP ranges of the `Sql.NorthEurope` service tag. As of February 2022, this service tag corresponds to the following IPv4 ranges

> 13.69.224.0/26, 13.69.224.192/26, 13.69.225.0/26, 13.69.225.192/26, 13.69.233.136/29, 13.69.239.128/26, 13.74.104.64/26, 13.74.104.128/26, 13.74.105.0/26, 13.74.105.128/26, 13.74.105.192/29, 20.50.73.32/27, 20.50.73.64/26, 20.50.81.0/26, 23.102.16.130/32, 23.102.52.155/32, 40.85.102.50/32, 40.113.14.53/32, 40.113.16.190/32, 40.113.93.91/32, 40.127.128.10/32, 40.127.137.209/32, 40.127.141.194/32, 40.127.177.139/32, 52.138.224.0/26, 52.138.224.128/26, 52.138.225.0/26, 52.138.225.128/26, 52.138.229.72/29, 52.146.133.128/25, 65.52.225.245/32, 65.52.226.209/32, 104.41.202.30/32, 191.235.193.75/32, 191.235.193.139/32, 191.235.193.140/31

An appropriate egress rule could be to allow outbound traffic to these IPv4 ranges on TCP port 1433. Be wary of allowing traffic to service tags which can comprise IP addresses belonging to arbitrary services controlled by malicious actors. E.g., one can argue that a rule which allows traffic to the `AzureCloud.NorthEurope` service tag introduces greater risk than a rule which merely allows the `Sql.NorthEurope` tag.

However, these IP ranges are subject to change. As of February 2022, the `Sql.NorthEurope` tag has been subject to 11 revisions during its lifetime, 8 of which have happened between April 2021 and February 2022. 24 out of 961 IPv4 addresses which were included in the tag in April 2021, are no longer present in February 2022. 224 out of 1161 IPv4 addresses which are included as of February 2022, were not included in April 2021.