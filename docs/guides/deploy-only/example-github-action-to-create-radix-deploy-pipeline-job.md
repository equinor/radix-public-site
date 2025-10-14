---
title: Example of using GitHub action to create a Radix deploy pipeline job
---

# Example of using GitHub action to create a Radix deploy pipeline job

To use GitHub Actions, create a workflow file under `.github/workflows`. In the sample workflow below, we will build new images for the `api` component for the `main` branch and deploy to the `prod` environment.

Make sure your radixconfig.yaml file is in the root of your repository. The workflow will read the application name from the radixconfig.yaml file (the argument `--from-config`), or you can specify it with `--application` option.

It should also use the image tag name `api` for the component, but you can change it to your own component name.

You must also add a Github Personal Access Token to Radix Console for the GitHub Container Registry. Add it to your Application Configuration in Radix Console under Private Image Hubs.

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: YOUR-APP-NAME # Must match the registerd app in Radix Console
spec:
  environments:
    - name: prod
  privateImageHubs:
    ghcr.io:
      username: YOUR-GITHUB-USERNAME
  components:
    - name: api
      image: ghcr.io/YOUR-ORG/YOUR-REPO-NAME/api:{imageTagName}
      imagePullSecret: latest
      ports:
        - name: http
          port: 8000
      publicPort: http
```


Steps in the example:

* Build image tags
* Set up Docker Buildx
* Authenticate to Github Container Registry
* Build and push docker image
* Install RX and Authenticate
* Deploy your component on Radix

Read more about permissions in GitHub Actions [here](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

```yaml
name: CI

on:
  push:
    branches:
      - main

permissions:
  id-token: write # Required to authenticate with Azure Entra ID
  packages: write # Required to push to GitHub Container Registry
  contents: read # set required permissions (https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

jobs:
  build-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
            
      - name: Build image tags
        id: metadata
        run: |
          sha=${GITHUB_SHA::8}
          ts=$(date +%s)
          tag=${GITHUB_REF_NAME}-${sha}-${ts}
          repo=${GITHUB_REPOSITORY@L} # @L is bash syntax that converts REPO to lowercase
          
          echo "tag=${tag}" >> $GITHUB_OUTPUT
          echo "repo=${repo}" >> $GITHUB_OUTPUT 

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Login, build and push the image to your preffered registry

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }} # Use the default GITHUB_TOKEN for ghcr.io
          
      - name: Build and push docker image
        uses: docker/build-push-action@v6
        with:
          push: true
            ghcr.io/${{ steps.metadata.outputs.repo }}:latest
            ghcr.io/${{ steps.metadata.outputs.repo }}:${{ steps.metadata.outputs.tag }}
  
      # Radix
      # - Install rx cli and authenticate
      # - Create a pipeline job to deploy the application

      - name: Install RX and authenticate
        uses: equinor/radix-github-actions@v2
        with:
          azure_client_id: "00000000-0000-0000-0000-000000000000" # App Registration Application ID or Managed Identity Client ID
          
      - name: 'Deploy API on Radix'
        run: rx create pipeline-job deploy
            --context playground
            --from-config # Read application name from radixconfig.yaml in the root of the repository. Or use `--application your-app-name` to specify the application name
            --environment prod
            --image-tag-name api=${{ steps.metadata.outputs.tag }} # Specify the component name and image tag
            --commitID ${{ github.sha }} # GitHub commit hash can be specified from the workflow context
            --follow
```

Following are last steps for "Build and deploy" pipeline workflow (e.g. when some application components need to be built):
```yaml
      - name: 'Deploy API on Radix'
        run: rx create pipeline-job deploy
          --context playground
          --from-config
          --environment prod
          --image-tag-name api=${{ steps.metadata.outputs.tag }}
          --follow
```
An option `--context playground` is used if a Radix application is registered in the Playground cluster, otherwise remove this line - Platform cluster is used by default
### Troubleshooting
* Error `response status code does not match any response statuses defined for this endpoint in the swagger spec (status 403): {}` - make sure that in the Radix CLI command it is correctly specified an application name (an option `-a` or `--application`, if used), or context - cluster where the application is registered (an option `-c` or `--context`, if used)
* Error `Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable. Please make sure to give write permissions to id-token in the workflow.` - make sure that the permission is set:
    ```yaml
    permissions:
      id-token: write
    ```
* Error `No matching federated identity record found for presented assertion` - make sure that the [AD Service principal access token is set](./#ad-service-principal-access-token)
