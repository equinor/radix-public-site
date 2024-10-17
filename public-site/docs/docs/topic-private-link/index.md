---
title: Private Link
---

# Overview

When running an application in Radix and there is a need to access external Azure services through a private IP address, Private Link Services can be used to connect the Radix application to the resource, using a Private Endpoint. A Private Endpoint works by connecting a target resource to a Virtual Network. Data passing through a Private Endpoint travels the Microsoft backbone network, not exposed to the internet. 

More information can be found in the [Azure documentation](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)

:::tip Omnia Classic governance

Private links have other [policies](https://docs.omnia.equinor.com/governance/security/components/v4/vnet-private-link/#introduction) in Omnia Classic subscriptions, which makes it not possible to establish services like Private Endpoints with Radix. More information in [Omnia Docs](https://docs.omnia.equinor.com/products/classic/PrivateEndpoints-documentation-for-AppTeams/)

:::

:::tip Tips
An alternative can be to host an API in Omnia Classic, publish this in [APIM](https://api.equinor.com/). Then this API can be used by an Radix application.

:::

![Illustration](private-link-service-workflow-expanded.png)

In order to establish a Private Endpoint from Radix to your external resource, the following information is needed:

- Subscription owner
- Subscription ID
- Resource ID (found in the properties of a resource in the Azure portal)

:::tip
Resource ID example: `/subscriptions/A01234567-bc89-123d-ef45-678g9hi12jkl/resourceGroups/Some_RG_Prod/providers/Microsoft.Sql/servers/sql-some-prod`
:::

## Instructions

The creation of Private Endpoints in Radix is a semi automated process, and the destination subscription must be part of Omnia Standalone.

The destination subscription must be whitelisted in an Azure policy managed by [Solum](https://github.com/equinor/Solum). The policy allows the creation of Private Endpoints Connections only to Private Link Services in a list of whitelisted subscriptions.
Adding a subscription to the whitelist is done by making a pull request to the Solum repository or submit an issue in GitHub. This is where most of the information is required, and the Subscription Owner will have to validate the request.  
`Important:` If the target subscription are in this list [for Platform and Platform2](https://github.com/equinor/Solum/blob/master/src/platform/policyConfig/policy-assignments/S940_OP-Allow-PLS-Sub.json) or [for Playground](https://github.com/equinor/Solum/blob/master/src/platform/policyConfig/policy-assignments/S941_OP-Allow-PLS-Sub.json) the requirments are met.

When the pull request has been approved and merged, the policy will be updated. After that, a issue [request a new private link](https://github.com/equinor/radix/issues/new?template=privatelink.yaml) can be made using the `Resource ID`.
The three input fields that need to be submitted:
```
- [x]Confirm target subscription are whitelisted by Solum (as described above)  
- Resource ID:  
  /subscriptions/A01234567-bc89-123d-ef45-678g9hi12jkl/resourceGroups/Some_RG_Prod/providers/Microsoft.Sql/servers/sql-some-prod  
- Radix environment (either):  
  - Platform NE
  - Platform WE
  - Playground
```
Radix team will now get a notification about the issue, and approve the privatelink if all requirements are met.
The submitter will get a mail with text 'Private link is created but needs manuall approval in Azure Portal.'

This will show up as a pending request in the destination subscription. When the user approves the request, a Private Endpoint will be created on the destination subscription, and a Private Link between the two endpoints will be established.

The user can continue using the same FQDN to access the remote resource after the Private Endpoint has been created.

## Caveats

In order to support resolution of Private Endpoint enabled resources in Omnia Classic from on-premise, Equinor's on-premise DNS servers forward e.g. lookups to privatelink.blob.core.windows.net to a centrally managed Private DNS Zone in Omnia Classic with the same name. This forwarding does not apply to all types of Private Endpoints. See the [Omnia platform team's documentation](https://docs.omnia.equinor.com/products/classic/PrivateEndpoints-documentation-for-AppTeams/#omnia-classic-private-endpoint-implementation) for an overview.

If you create a Private Endpoint on a resource in Omnia Standalone to Omnia Radix, *and* that resource type has a Private Endpoint DNS zone which is forwarded to Omnia Classic, then that resource will not be resolvable from on-premise. This applies e.g. to Blob Storage for Azure Storage Accounts.