---
title: The radixconfig.yaml file
layout: document
parent: ["Docs", "../../docs.html"]
toc: true
---

# Overview

When running an application in radix and there is a need to get access to a network on a separate subscription, a private link can be used to connect the radix application to the external resource. A Private Link works by connecting an external target resource to a destination Virtual Network. Data passing through a private link travels the Microsoft backbone network, never exposed to the internet. 


In order to establish a private link from Radix to your external resource, the following information is needed:
- Subscription owner
- Product Owner
- WBSOwner
- Subscription ID
- Resource ID (found in the properties of a resource in the Azure portal) 
> Resource ID example: `/subscriptions/A01234567-bc89-123d-ef45-678g9hi12jkl/resourceGroups/Some_RG_Prod/providers/Microsoft.Sql/servers/sql-some-prod`

The creation of Private Links in Radix is currently a manual process. When in need of a Private Link, contact the Radix team. 

The destination subscription must be whitelisted in an Azure policy managed by Solum. The policy allows the creation of Private Endpoints Connections only to Private Link Services in a list of whitelisted subscriptions. 
Adding a subscription to the whitelist is done by making a pull request to the Solum repository in GitHub. This is where most of the information is required, and the Subscription Owner will have to validate the request.

When the pull request has been approved and merged, the policy will be updated. After that, the Radix team can create a Private Endpoint using the `Resource ID` provided by the user. This will show up as a pending request in the destination subscription. When the user approves the request, a Private Endpoint will be created on the destination subscription, and a Private Link between the two endpoints will be established. 

The user will be provided a FQDN to access the remote resource. 
>FQDN example: `sql-some-prod.privatelink.database.windows.net`