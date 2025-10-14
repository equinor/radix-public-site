---
title: Private Links
---

The creation of Private Endpoints in Radix is a semi automated process, and the destination subscription must be part of Omnia Standalone.

:::warning
**All private links are shared across the cluster**. In other words, a private link does not replace authentication. However, it helps improve security and reduce network latency by avoiding internet traffic and routing data through private channels.
:::

## Prerequisite

The destination subscription must be whitelisted in an Azure policy managed by [Solum](https://github.com/equinor/Solum). The policy allows the creation of Private Endpoints Connections only to Private Link Services in a list of whitelisted subscriptions.

:::tip Check if the subscription is whitelisted
**Important:** If the target subscription is in the exemption list `Allow S940 external endpoints` (for Platform and Platform2) or `Allow S941 external endpoints` (for Playground) in the [OPS-Deny-PE-Cross-Subs policy](https://github.com/equinor/Solum/blob/master/src/platform/policyConfig/policysets/OPS-Deny-PE-Cross-Subs.json#L101), the requirements are met.
:::

### How to add whitelist for your subscription

1. Create a Pull Request in the Solum repo

Fork [the Solum repo](https://github.com/equinor/Solum), and add your subscription to appropriate exemption list in `/src/platform/policyConfig/policysets/OPS-Deny-PE-Cross-Subs.json`.

**For Radix Platform:**

```json showLineNumbers=100 {3,14}
{
  "policyDefinitionId": "/providers/Microsoft.Management/managementgroups/Omnia/providers/Microsoft.Authorization/policyDefinitions/OP-Allow-PrivateEndpoint-To-These-Subs",
  "policyDefinitionReferenceId": "Allow S940 external endpoints",
  "parameters": {
    "subscriptionId": {
      "value": "ded7ca41-37c8-4085-862f-b11d21ab341a"
    },
    "externalSubscriptionIds": {
      "value": [
        "<subscriptionId>",
        "<subscriptionId>",
        "<subscriptionId>",
        ...,
        "<your subscriptionId>",
```

**For Radix Playground:**

```json showLineNumbers=175 {3,14}
{
  "policyDefinitionId": "/providers/Microsoft.Management/managementgroups/Omnia/providers/Microsoft.Authorization/policyDefinitions/OP-Allow-PrivateEndpoint-To-These-Subs",
  "policyDefinitionReferenceId": "Allow S941 external endpoints",
  "parameters": {
    "subscriptionId": {
      "value": "16ede44b-1f74-40a5-b428-46cca9a5741b"
    },
    "externalSubscriptionIds": {
      "value": [
        "<subscriptionId>",
        "<subscriptionId>",
        "<subscriptionId>",
        ...,
        "<your subscriptionId>",
```

Commit and add the PR, including this information:
"This PR needs to be approved by Technical owner  `githubuser` and the `name`"

   - or - 
2. Ask us to whitelist the subscription

Provide the following information in the issue (request)
Subscription ID
GitHub `username` and the `name` of the Technical owner of the subscription

When the pull request has been approved and merged, the policy will be updated. 

## Request the Private Link/Endpoint

Create an issue in the main Radix repo, [request a new private link](https://github.com/equinor/radix/issues/new?template=privatelink.yaml)

```
- [x] Confirm target subscription are whitelisted by Solum (as described above)  - or -
- [x] Request the Whitelist to be done by us
- Resource ID: `Id of the destination resource`
  *sample*
  /subscriptions/A01234567-bc89-123d-ef45-678g9hi12jkl/resourceGroups/Some_RG_Prod/providers/Microsoft.Sql/servers/sql-some-prod  
- Radix environment (either):  
  - Radix Platform (North Europe)
  - Radix Platform 2 (West Europe)
  - Radix Playground
```
The issue/request will be prosessed by Radix team and approve the privatelink if all requirements are met.

The submitter will get a mail with text 'Private link is created but needs manual approval in Azure Portal.'

This will show up as a pending request in the destination subscription. When the user approves the request, a Private Endpoint will be created on the destination subscription, and a Private Link between the two endpoints will be established.

The user can continue using the same FQDN to access the remote resource after the Private Endpoint has been created.
