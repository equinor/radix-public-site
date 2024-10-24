---
title: Request Private Link
---

The creation of Private Endpoints in Radix is a semi automated process, and the destination subscription must be part of Omnia Standalone.

## Prerequisite

The destination subscription must be whitelisted in an Azure policy managed by [Solum](https://github.com/equinor/Solum). The policy allows the creation of Private Endpoints Connections only to Private Link Services in a list of whitelisted subscriptions.

:::tip Check if the subscription is whitelisted
`Important:` If the target subscription are in this list [for Platform and Platform2](https://github.com/equinor/Solum/blob/master/src/platform/policyConfig/policy-assignments/S940_OP-Allow-PLS-Sub.json) or [for Playground](https://github.com/equinor/Solum/blob/master/src/platform/policyConfig/policy-assignments/S941_OP-Allow-PLS-Sub.json) the requirments are met.
:::

### How to add whitelist for your subscription

1. Create a Pull Request in the repo

Fork the Solum repo, and update the following file 
/src/platform/policyConfig/policy-assignments/S940_OP-Allow-PLS-Sub.json - for Radix Platform
/src/platform/policyConfig/policy-assignments/S941_OP-Allow-PLS-Sub.json - for Radix Playground

Commit and add the PR, including this information:
"This PR needs to be approved by Technical owner  `githubuser` and the `name`"

   - or - 
2. Ask us to whitelist the subscription

Provide the following information in the issue (request)
Subscription ID
GitHub `username` and the `name` of the Technical owner of the subscription

When the pull request has been approved and merged, the policy will be updated. 

## Request the Private Link/Endpoint

Create an issue in the main Radix repo,[request a new private link](https://github.com/equinor/radix/issues/new?template=privatelink.yaml)

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
