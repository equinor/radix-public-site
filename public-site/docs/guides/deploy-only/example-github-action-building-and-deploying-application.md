---
title: Example of using GitHub Action to build and push container to custom Container Registry
---

# Example of using GitHub Action to build and push container to custom Container Registry

:::tip
This example triggers a deployment directly using Radix CLI with the current commit ID. See [Example of using GitHub action to create a Radix deploy pipeline job](./example-github-action-to-create-radix-deploy-pipeline-job) for how you can modify your `radixconfig.yaml` file with he new image tag instead, and then keep a history of changes in your config file.
:::

To create a GitHub Actions you need to create a workflow file in the folder `.github/workflows`.

Steps in the example:


* "Az CLI login" - login to the Azure with a service principal - an app registration Application ID or user-assigned managed identity Client ID
* "ACR Login" - login to the Azure Container Registry with service principal
* "RADIX Login" - get an Azure access token for the resource `6dae42f8-4368-4678-94ff-3960e28e3630`, which is a fixed Application ID, corresponding to the Azure Kubernetes Service AAD Server, globally provided by Azure. This token is put to the environment variable `APP_SERVICE_ACCOUNT_TOKEN`, available in following GitHub action job steps
* "Build and push Docker images" - Notice it uses your GitHub Commit SHA to tag your container image.
* "Get environment from branch" - Reads your `radixconfig.yaml` file and figures out which environment to use in the next step
* "Deploy API on Radix" - example of use the [Radix CLI](https://github.com/equinor/radix-cli), In this case to tell Radix to use your newly created image for a component in a specific environment. The Radix CLI in this step expects an environment variable `APP_SERVICE_ACCOUNT_TOKEN` to be set

```yaml
name: Docker Image CI

on:
  push:
    branches: [ "main" ]

permissions:
  id-token: write
  contents: read

jobs:

  build:

    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: 'Az CLI login'
        uses: azure/login@v1
        with:
          client-id: 5e5e5e5e-abcd-efgh-ijkl-f6f6f6f6f6f6 #app registration Application ID or user-assigned managed identity Client ID
          tenant-id: 3aa4a235-b6e2-48d5-9195-7fcf05b459b0
          allow-no-subscriptions: true

      - name: ACR Login
        run: 'az acr login --name YOUR_ACR_NAME --subscription SUBSCRIPTION_ID'

      - name: RADIX Login
        run: |
          token=$(az account get-access-token --resource 6dae42f8-4368-4678-94ff-3960e28e3630 --query=accessToken -otsv | tr -d '[:space:]')
          echo "::add-mask::$token"
          echo "APP_SERVICE_ACCOUNT_TOKEN=$token" >> $GITHUB_ENV

      - name: Build and push Docker images
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: YOUR_ACR_NAME.azurecr.io/ORG/NAME:${{ github.sha }}

      - name: 'Get environment from branch' # for "deploy only" pipeline workflow
        id: radix
        uses: equinor/radix-github-actions@v1
        with:
          args: >
            get config branch-environment
            --from-config 
            -b ${GITHUB_REF##*/}

      - name: 'Deploy API on Radix'
        uses: equinor/radix-github-actions@v1
        with:
          args: >
            create pipeline-job
            deploy
            --context playground 
            --from-config 
            --environment ${{ steps.radix.outputs.result }}
            --image-tag-name web=${{ github.sha }}
            --follow

```
When necessary, the `create pipeline-job deploy` command can be accompanied by an option `commitID` to provide a reference to the GitHub commit. 

Example how to provide [current commit](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables):
```yaml
      - name: 'Deploy API on Radix'
        uses: equinor/radix-github-actions@v1
        with:
          args: >
            create pipeline-job
            deploy
            --context playground 
            --from-config 
            --commitID $GITHUB_SHA
            --follow
```
