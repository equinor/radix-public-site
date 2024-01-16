---
title: Private Link
---

# Overview

When running an application in Radix and there is a need to access external Azure services through a private IP address, Private Link Services can be used to connect the Radix application to the resource, using a Private Endpoint. A Private Endpoint works by connecting a target resource to a Virtual Network. Data passing through a Private Endpoint travels the Microsoft backbone network, not exposed to the internet. 

More information can be found in the [Azure documentation](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)

![Illustration](private-link-service-workflow-expanded.png)

In order to establish a Private Endpoint from Radix to your external resource, the following information is needed:

- Subscription owner
- Subscription ID
- Resource ID (found in the properties of a resource in the Azure portal)

> Resource ID example: `/subscriptions/A01234567-bc89-123d-ef45-678g9hi12jkl/resourceGroups/Some_RG_Prod/providers/Microsoft.Sql/servers/sql-some-prod`

## Instructions

The creation of Private Endpoints in Radix is currently a manual process, and the destination subscription must be part of Omnia Standalone. When in need of a Private Endpoint, contact the Radix team.

The destination subscription must be whitelisted in an Azure policy managed by Solum. The policy allows the creation of Private Endpoints Connections only to Private Link Services in a list of whitelisted subscriptions.
Adding a subscription to the whitelist is done by making a pull request to the Solum repository in GitHub. This is where most of the information is required, and the Subscription Owner will have to validate the request.

When the pull request has been approved and merged, the policy will be updated. After that, the Radix team can create a Private Endpoint using the `Resource ID` provided by the user. This will show up as a pending request in the destination subscription. When the user approves the request, a Private Endpoint will be created on the destination subscription, and a Private Link between the two endpoints will be established.

The user can continue using the same FQDN to access the remote resource after the Private Endpoint has been created.

## Caveats

In order to support resolution of Private Endpoint enabled resources in Omnia Classic from on-premise, Equinor's on-premise DNS servers forward e.g. lookups to privatelink.blob.core.windows.net to a centrally managed Private DNS Zone in Omnia Classic with the same name. This forwarding does not apply to all types of Private Endpoints. See the [Omnia platform team's documentation](https://docs.omnia.equinor.com/products/classic/PrivateEndpoints-documentation-for-AppTeams/#omnia-classic-private-endpoint-implementation) for an overview.

If you create a Private Endpoint on a resource in Omnia Standalone to Omnia Radix, *and* that resource type has a Private Endpoint DNS zone which is forwarded to Omnia Classic, then that resource will not be resolvable from on-premise. This applies e.g. to Blob Storage for Azure Storage Accounts.