---
title: Example of using AD service principal to get access to a Radix application in a GitHub action
---

# Example of using AD service principal to get access to a Radix application in a GitHub action

To create a GitHub Actions you need to create a workflow file in the folder `.github/workflows`.

Steps in the example:

* Install RX and authenticate: use the provided id-token (Workload Identity) and Azure Client ID to authenticate with matching federated credentials. The Federated Credentials must be configured upfront in Azure Entra for the specified Azure Client ID. 
* "Update build secret" - example of using the [Radix CLI](https://github.com/equinor/radix-cli) to configure a build secret.
* "Restart qa env" - example of use the [Radix CLI](https://github.com/equinor/radix-cli), in this case to restart a Radix application components for an environment. 
* After the workflow is finished, the Radix GitHub action will automatically remove the Azure AD token from the GitHub Actions runner.

```yaml
name: Manage Radix App

on:
  push:
    branches: [ "main" ]

permissions:
  id-token: write

jobs:
  set-build-secret-and-restart:
    runs-on: ubuntu-latest
    steps:
      - name: Install RX and authenticate
        uses: equinor/radix-github-actions@v2
        with:
          azure_client_id: "00000000-0000-0000-0000-000000000000" # App Registration Application ID or Managed Identity Client ID
          
      - run: rx set build-secret
            --application your-radix-app-name 
            --secret A_BUILD_SECRET
            --value P4ssW0rd
            --context playground
        
      - run: rx restart environment 
            --application your-radix-app-name
            --environment qa
            --context playground
```
