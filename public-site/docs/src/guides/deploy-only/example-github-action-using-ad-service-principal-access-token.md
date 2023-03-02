---
title: Example of using AD service principal to get access to a Radix application in a GitHub action
sidebarDepth: 3
---

# Example of using AD service principal to get access to a Radix application in a GitHub action

To create a GitHub Actions you need to create a workflow file in the folder `.github/workflows`.

Steps in the example:

* "Az CLI login" - login to the Azure with a service principal - an app registration Application ID or user-assigned managed identity Client ID
* "Get Azure principal token for Radix" - get an Azure access token for the resource `6dae42f8-4368-4678-94ff-3960e28e3630`, which is a fixed Application ID, corresponding to the Azure Kubernetes Service AAD Server, globally provided by Azure. This token is put to the environment variable `APP_SERVICE_ACCOUNT_TOKEN`, available in following GitHub action job steps
* "Update build secret" - example of use directly the Radix API ([Radix Platform API](https://api.radix.equinor.com/swaggerui/) or [Radix Playground API](https://api.playground.radix.equinor.com/swaggerui/)), in this case to update a value of a build-secret. It is not recommended to use a Radix API directly, as its schema can be eventually changed
* "Restart qa env" - example of use the [Radix CLI](https://github.com/equinor/radix-cli), in this case to restart a Radix application components for an environment. The Radix CLI in this step expects an environment variable `APP_SERVICE_ACCOUNT_TOKEN` to be set

```yaml
name: Manage Radix App

on:
  push:
    branches: [ "main" ]

permissions:
  id-token: write
  # contents: read # set required permissions (https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

jobs:
  set-build-secret-and-restart:
    runs-on: ubuntu-latest
    steps:
      - name: 'Az CLI login'
        uses: azure/login@v1
        with:
          client-id: 5e5e5e5e-abcd-efgh-ijkl-f6f6f6f6f6f6 #app registration Application ID or user-assigned managed identity Client ID
          tenant-id: 3aa4a235-b6e2-48d5-9195-7fcf05b459b0
          allow-no-subscriptions: true
      - name: 'Get Azure principal token for Radix'
        run: |
          token=$(az account get-access-token --resource 6dae42f8-4368-4678-94ff-3960e28e3630 --query=accessToken -otsv)
          echo "::add-mask::$token"
          echo "APP_SERVICE_ACCOUNT_TOKEN=$token" >> $GITHUB_ENV
      - name: Update build secret
        run: |
          curl https://api.playground.radix.equinor.com/api/v1/applications/your-radix-app-name/buildsecrets/A_BUILD_SECRET \
            -X PUT \
            -d '{"secretValue":"new value"}' \
            -H 'Authorization: Bearer ${{ env.APP_SERVICE_ACCOUNT_TOKEN }}'
      - name: Restart qa env
        uses: equinor/radix-github-actions@master
        with:
          args: >
            restart
            environment
            --application your-radix-app-name
            --environment qa
            --context playground
```
