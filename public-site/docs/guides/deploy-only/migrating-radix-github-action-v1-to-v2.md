---
title: Migration Guide for Radix GitHub Action v1 to v2
---

# Migration Guide for Radix GitHub Action v1 to v2

The new version will authenticate and install `rx` into your workflow, The commands will behave exactly the same in the workflow as they do locally on your machine.



## Without authentication:

**Before**
```yaml
name: radix-public-site-pr
on:
  pull_request:
    branches:
    - main
jobs:
  validate-radixconfig:
    runs-on: ubuntu-latest
    steps:
      - name: 'Get Azure principal token for Radix'
        run: |
          echo "APP_SERVICE_ACCOUNT_TOKEN=hello-world" >> $GITHUB_ENV
      - uses: actions/checkout@v4
      - name: 'Validate public-site'
        uses: equinor/radix-github-actions@v1
        with:
          args: validate radix-config --config-file radixconfig.yaml
      - name: 'Validate oauth example radix-app'
        uses: equinor/radix-github-actions@v1
        with:
          args: validate radix-config --config-file examples/radix-example-oauth-proxy/radixconfig.yaml
```

**After**
```yaml
name: radix-public-site-pr
on:
  pull_request:
    branches:
    - main
jobs:
  validate-radixconfig:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: equinor/radix-github-actions@v2
      - name: 'Validate public-site'
        run: rx validate radix-config --config-file radixconfig.yaml
      - name: 'Validate oauth example radix-app'
        run: rx validate radix-config --config-file examples/radix-example-oauth-proxy/radixconfig.yaml
```

## With authentication:
**Before**
```yaml
name: Deploy on Radix # Authenticate with Federated Credentials

on:
  workflow_dispatch:

permissions:
  contents: read
  id-token: write # required to get a GitHub federated credential

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    steps:
    - name: Login Azure
      uses: azure/login@v1
      with:
        client-id: "00000000-0000-0000-0000-000000000000"
        tenant-id: "3aa4a235-b6e2-48d5-9195-7fcf05b459b0"
        allow-no-subscriptions: true
    - name: Get token
      run: |
        token=$(az account get-access-token --resource 6dae42f8-4368-4678-94ff-3960e28e3630 --query=accessToken -otsv)
        echo "::add-mask::$token"
        echo "APP_SERVICE_ACCOUNT_TOKEN=$token" >> $GITHUB_ENV
    - uses: equinor/radix-github-actions@v1
      with:
        args: >
          create pipeline-job
          build-deploy
          --application application-name
          --branch qa
          --follow
          --token-environment
          #--context platform,platform2 or playground
```

**After**
```yaml
name: Deploy on Radix # Authenticate with Federated Credentials

on:
  workflow_dispatch:

permissions:
  contents: read
  id-token: write # required to get a GitHub federated credential

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: equinor/radix-github-actions@v2
      with:
        azure_client_id: "00000000-0000-0000-0000-000000000000"
        # azure_client_secret: ${{ secrets.AZURE_CLIENT_SECRET }} # Available if you do not use Federated Credentials
    - run: rx create pipeline-job deploy
       --application application-name
       --environment qa
       --follow
       #--context platform,platform2 or playground
```


## Notes
You can use the github action without arguments to just install `rx`. Afterwards you can login with `rx login` as you do locally:

```shell
rx login --help
# Login to Radix.
# 
# Usage:
#   rx login [flags]
# 
# Flags:
#       --azure-client-id string              Authenticate with Azure Client Id and federated token or client secret
#       --azure-client-secret string          Authenticate with Azure Client Secret and Azure Client Id
#       --federated-credentials-file string   Authenticate with Federated Credentials and Azure Client Id
#   -h, --help                                help for login
#       --use-device-code                     Authenticate with Azure Device Code
#       --use-github-credentials              Authenticate with Github Workload Identity
#       --use-interactive-login               Authenticate with Azure Interactive Login. Default if no other option is specified
#       --verbose                             (Optional) Verbose output
```
