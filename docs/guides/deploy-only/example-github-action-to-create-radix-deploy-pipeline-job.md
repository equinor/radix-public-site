---
title: Example of using GitHub action to create a Radix deploy pipeline job
---

# Example of using GitHub action to create a Radix deploy pipeline job

To use GitHub Actions, create a workflow file under `.github/workflows`. In the sample workflow below, a push to the `master` branch builds the `api` component with the static tag `master-latest` and deploys it to the `qa` environment. A push to the `release` branch builds it with a dynamic tag (`release-` followed by the commit SHA) and deploys it to the `prod` environment.

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
    - name: qa
    - name: prod
  privateImageHubs:
    ghcr.io:
      username: YOUR-GITHUB-USERNAME
  components:
    - name: api
      image: ghcr.io/YOUR-ORG/YOUR-REPO-NAME/api:{imageTagName}
      imagePullSecret: latest
      alwaysPullImageOnDeploy: true # Pull the image on every deployment, needed for the static tag in qa
      ports:
        - name: http
          port: 8000
      publicPort: http
      environmentConfig:
        - environment: qa
          imageTagName: master-latest # prod has no imageTagName, the workflow sets it with --image-tag-name
```


Steps in the example:

* Set default image tag
* Override image tag for prod environment
* Set up Docker Buildx
* Log in to GitHub Container Registry
* Build and push API component
* Get environment from branch
* Install RX and authenticate
* Deploy API on Radix

Read more about permissions in GitHub Actions [here](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

```yaml
name: CI

on:
  push:
    branches:
      - master
      - release

permissions:
  id-token: write # Required to authenticate with Azure Entra ID
  packages: write # Required to push to GitHub Container Registry
  contents: read # set required permissions (https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

jobs:
  build-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: Set default image tag
        run: |
          echo "REPO=${GITHUB_REPOSITORY@L}" >> $GITHUB_ENV # @L is bash syntax that converts REPO to lowercase
          echo "IMAGE_TAG=master-latest" >> $GITHUB_ENV # Static tag used by the qa environment

      - name: Override image tag for prod environment
        if: github.ref_name == 'release'
        run: echo "IMAGE_TAG=release-${GITHUB_SHA::8}" >> $GITHUB_ENV # Dynamic tag, unique for every commit

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@4d04d5d9486b7bd6fa91e7baf45bbb4f8b9deedd

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@b45d80f862d83dbcd57f89517bcf500b2ab88fb2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }} # Use the default GITHUB_TOKEN for ghcr.io

      - name: Build and push API component
        uses: docker/build-push-action@d08e5c354a6adb9ed34480a06d141179aa583294
        with:
          push: true
          tags: ghcr.io/${{ env.REPO }}/api:${{ env.IMAGE_TAG }}

      - name: Get environment from branch
        id: environment
        run: |
          case "${GITHUB_REF_NAME}" in
            master) echo "name=qa" >> $GITHUB_OUTPUT ;;
            release) echo "name=prod" >> $GITHUB_OUTPUT ;;
          esac

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
            --environment ${{ steps.environment.outputs.name }}
            --image-tag-name api=${IMAGE_TAG} # Specify the component name and image tag
            --commitID ${{ github.sha }} # GitHub commit hash can be specified from the workflow context
            --follow
```

Following are last steps for "Build and deploy" pipeline workflow (e.g. when some application components need to be built):
```yaml
      - name: 'Deploy API on Radix'
        run: rx create pipeline-job deploy
          --context playground
          --from-config
          --environment ${{ steps.environment.outputs.name }}
          --image-tag-name api=${IMAGE_TAG}
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
* Error `No matching federated identity record found for presented assertion` - make sure that the [Entra ID Service principal access token is set](./index.md#entra-id-service-principal)
