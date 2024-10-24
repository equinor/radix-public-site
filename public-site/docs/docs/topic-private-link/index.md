---
title: Private Link
---

# Overview

When running an application in Radix and there is a need to access external Azure services through a private IP address, Private Link Services can be used to connect the Radix application to the resource, using a Private Endpoint. A Private Endpoint works by connecting a target resource to a Virtual Network. Data passing through a Private Endpoint travels the Microsoft backbone network, not exposed to the internet. 

More information can be found in the [Azure documentation](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)

:::tip Omnia Classic governance
Private links have other [policies](https://docs.omnia.equinor.com/governance/security/components/v4/vnet-private-link/#introduction) in Omnia Classic subscriptions, which makes it impossible to establish services like Private Endpoints with Radix. More information in [Omnia Docs](https://docs.omnia.equinor.com/products/classic/PrivateEndpoints-documentation-for-AppTeams/)
:::

:::tip Tips
An alternative can be to host an API in Omnia Classic, publish this in [APIM](https://api.equinor.com/). Then this API can be used by an Radix application.

:::

![Illustration](private-link-service-workflow-expanded.png)

In order to establish a Private Endpoint from Radix to your external resource, follow instructions in the [Private Link Guide](/guides/private-link/).

The following information is needed:

- Subscription owner
- Subscription ID
- Resource ID (found in the properties of a resource in the Azure portal)

:::tip Sample
Resource ID example: `/subscriptions/A01234567-bc89-123d-ef45-678g9hi12jkl/resourceGroups/Some_RG_Prod/providers/Microsoft.Sql/servers/sql-some-prod`
:::

This will show up as a pending request in the destination subscription. When the request is approved, a Private Endpoint will be created in your subscription, and a Private Link between the two endpoints will be established.

You can continue using the same FQDN to access the remote resource after the Private Endpoint has been created.


:::warning
If you create a Private Endpoint on a resource in Omnia Standalone to Omnia Radix, *and* that resource type has a Private Endpoint DNS zone which is forwarded to Omnia Classic, then that resource will not be resolvable from on-premise. This applies e.g. to Blob Storage for Azure Storage Accounts.
:::