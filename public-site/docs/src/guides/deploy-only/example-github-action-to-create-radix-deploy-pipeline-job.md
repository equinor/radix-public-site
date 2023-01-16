---
title: Example of using GitHub action to create a Radix deploy pipeline job
sidebarDepth: 3
---

# Example of using GitHub action to create a Radix deploy pipeline job
To create a GitHub Actions you need to create a workflow file in the folder `.github/workflows`. In the sample workflow below we will build new images for `main` (`qa` environment) and `release` (`prod` environment) branches:

Steps in the example:
* "Az CLI login" - login to the Azure with a service principal - an app registration Application ID or user-assigned managed identity Client ID
* "Get Azure principal token for Radix" - get an Azure access token for the resource `6dae42f8-4368-4678-94ff-3960e28e3630`, which is a fixed Application ID, corresponding to the Azure Kubernetes Service AAD Server, globally provided by Azure. This token is put to the environment variable `APP_SERVICE_ACCOUNT_TOKEN`, available in following GitHub action job steps
* "Deploy API on Radix" - create a Radix deploy-only pipeline job. The [Radix CLI](https://github.com/equinor/radix-cli) in this step expects an environment variable `APP_SERVICE_ACCOUNT_TOKEN` to be set

`PRIVATE_TOKEN` - in this example it is a private token, used for publishing a package to the GitHub package repository. The name is irrelevant. It is a personal access token that you configure for your GitHub user. In this example the same token is used for producing the package, giving the Radix an access to pull the image to the cluster

```yaml
name: CI

on:
  push:
    branches:
      - main
      - release

permissions:
  id-token: write
  # contents: read # set required permissions (https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

jobs:
  build:
    name: deploy
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
      - uses: actions/checkout@v1
      - name: 'Set default image tag'
        run: |
          echo ::set-env name=IMAGE_TAG::$(echo ${GITHUB_REF##*/}-latest)
      - name: Override image tag for prod environment
        if: github.ref == 'refs/heads/release'
        run: |
          echo ::set-env name=IMAGE_TAG::$(echo ${GITHUB_REF##*/}-${GITHUB_SHA::8})
      - name: 'Build API component'
        run: |
          docker build -t ghcr.io/your-radix-app-repo-name/component1:$IMAGE_TAG ./todoapi/
      - name: 'Push the image to GPR'
        run: |
          echo ${{ "{{ secrets.PRIVATE_TOKEN " }}}} | docker login ghcr.io -u <your-github-user-name> --password-stdin
          docker push ghcr.io/your-radix-app-repo-name/component1:$IMAGE_TAG
      - name: Prepare for committing new tag to radix config on main
        uses: actions/checkout@v2-beta
        with:
          ref: main
      - name: 'Modify radixconfig tag for production on main branch'
        if: github.ref == 'refs/heads/release'
        run: |
          # Install pre-requisite
          python3 -m pip install --user ruamel.yaml
          python3 hack/modifyTag.py api ${GITHUB_REF##*/} $IMAGE_TAG
          git config --global user.name 'your-git-user'
          git config --global user.email 'your-git-user@users.noreply.github.com'
          git remote set-url origin https://x-access-token:${{ "{{ secrets.PRIVATE_TOKEN  " }}}}@github.com/${{ "{{ github.repository " }}}}
          git commit -am $IMAGE_TAG
          git push origin HEAD:main
      - name: 'Get environment from branch'
        id: getEnvironment
        uses: equinor/radix-github-actions@main
        with:
          args: >
            get config branch-environment
            --from-config
            -b ${GITHUB_REF##*/}
      - name: 'Deploy API on Radix'
        uses: equinor/radix-github-actions@main
        with:
          args: >
            create job
            deploy
            --context playground
            --from-config
            -e ${{ "{{ steps.getEnvironment.outputs.result " }}}}
            -f
```