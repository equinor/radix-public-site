---
title: Deploy Using External CI/CD Tools
---

# Deploy Using External CI/CD Tools

Radix can build and deploy your application, but you can also build it with an external CI tool, such as GitHub Actions or Azure DevOps, and let Radix handle only the deployment (CD). An application set up this way is called a deploy-only application.

In a deploy-only application, you build all container images outside of Radix and push them to a container registry. Radix doesn't build anything. It pulls the images you specify in `radixconfig.yaml` and deploys them. Other reasons for choosing this setup include:

- Your application consists of several components (for example microservices) with source code in separate repositories.
- Your application depends on other resources, and the deployment to Radix must be orchestrated with them.
- You need CI features that Radix doesn't provide, such as test reports.

## Configuring the app

Like any other Radix application, a deploy-only application needs:

- A GitHub repository (GitHub is the only supported provider at the moment).
- A `radixconfig.yaml` file that defines the environments. By default, Radix looks for it in the root of the repository.
- A [deploy key](../../start/registering-app/index.md#deploy-key) for the Radix application.

## The repository

A deploy-only application gives you two options for structuring your repositories:

- A pure configuration repository that holds `radixconfig.yaml`, while the source code for each component lives in other repositories.
- A source code repository that also holds `radixconfig.yaml`.

This guide uses the second option.

## The `radixconfig.yaml` file

:::tip
Radix reads `radixconfig.yaml` only from the branch set as the `Config Branch` in the application configuration form. Radix ignores changes to the file in other branches.
:::

The main difference between a deploy-only application and a regular Radix application is that the [`image`](../../radix-config/index.md#image) property is set for all components and jobs in `radixconfig.yaml`.

When `image` contains the [`{imageTagName}`](../../radix-config/index.md#imagetagname) placeholder, the Radix `deploy` pipeline replaces it with the `imageTagName` of the environment in `radixconfig.yaml`, or with the value of the `--image-tag-name` flag in the [Radix CLI](../../docs/topic-radix-cli/index.md#commands). If an environment has no `imageTagName`, you must set it with `--image-tag-name`. If you specify both, `--image-tag-name` takes precedence.

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: my-app
spec:
  environments:
    - name: qa
    - name: prod
  components:
    - name: api
      image: ghcr.io/my-repo/my-app/api:{imageTagName}
      ports:
        - name: http
          port: 3000
      publicPort: http
      environmentConfig:
        - environment: qa
          imageTagName: master-latest
    - name: frontend
      image: ghcr.io/my-repo/my-app/frontend:latest
      ports:
        - name: http
          port: 8080
      publicPort: http
  privateImageHubs:
    ghcr.io:
      username: <some GitHub user name>
      email: <some email>
```

This `radixconfig.yaml` uses two tagging strategies:

- **Static tag**<br/>The tag is fixed in `radixconfig.yaml`, either with a predefined `imageTagName` or by specifying the tag directly in `image`. In the example, the `api` component has `imageTagName: master-latest` in the `qa` environment, and the `frontend` component specifies `latest` directly in `image`.
- **Dynamic tag**<br/>The environment has no `imageTagName` in `radixconfig.yaml`, and the CI pipeline specifies the tag with `--image-tag-name` when it starts the deploy pipeline job. In the example, the `api` component has no `imageTagName` in the `prod` environment, so the pipeline must set it, for example with `--image-tag-name api=release-39f1a082`.

A dynamic tag typically changes with every build, for example by combining a prefix like the branch name with the commit SHA of the build. Dynamic tags give you better control over what runs in an environment, and they let you promote an older deployment if you need to roll back.

With a static tag, Radix doesn't pull a new image on its own after a deployment. See [Updating deployments on static tags](#updating-deployments-on-static-tags) for how to handle this.

The [`privateImageHubs`](../../radix-config/index.md#privateimagehubs) property is the second difference from a regular Radix application. It lets Radix pull images built outside of Radix.

See the [Radix Config reference](../../radix-config/index.md) for the full `radixconfig.yaml` syntax.

:::tip
The example doesn't map branches to environments with `build.from`. Radix never builds a deploy-only application, so a branch mapping has no effect. Your CI workflow decides which environment to deploy to.
:::

## Registering the application

Register the application as you would a regular Radix application, but don't add the webhook to GitHub. Without the webhook, a push to the repository doesn't trigger a build and deploy pipeline in Radix. You trigger deployments from your own CI tool instead, as described in the next sections.

## Entra ID service principal

To run a deploy-only pipeline job from an external tool, you must authenticate with an Azure service principal. A [managed identity](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview) is the preferred option, but an [Entra ID app registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) also works:

1. Create a managed identity, or use an existing one. Alternatively, use an Entra ID app registration.
2. Add the service principal as an administrator of the application.

   ![Configure the Radix application administrators](./radix-application-administrator-configuration.png)

3. Use the service principal to sign in from your external pipeline job, as described in [Making calls to Radix](#making-calls-to-radix).

Pipeline jobs created by a service principal show up in the pipeline job list in the Radix web console. The job is labeled with the application ID of the service principal followed by `(appid)`, or with its object ID followed by `(sub)`.

![Pipeline job list with IDs](./pipeline-job-list.png)

See [Connect GitHub and Azure](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure) for how to set up federation between GitHub and Azure.

## Making calls to Radix

Your pipeline job can call Radix in one of these ways:

- **Radix GitHub Actions**<br/>The preferred option if you use GitHub Actions for CI. [Radix GitHub Actions](https://github.com/equinor/radix-github-actions) signs in as the service principal and makes it easy to call Radix from your workflow. See the [migration guide from v1 to v2](./migrating-radix-github-action-v1-to-v2.md).
- **Radix CLI**<br/>Sign in as the service principal with one of the supported `rx login` options, then use the [Radix CLI](https://github.com/equinor/radix-cli) to call Radix. This works with any CI tool.
- **Radix API**<br/>Request an access token for the service principal and call the API directly, passing the token as a bearer token, for example `curl -X GET --header "Authorization: Bearer $token" <url>`.

:::warning
An access token is valid for one hour and grants every operation an application administrator can perform, including deleting the application and setting secrets. Keep it secret.
:::

## Updating deployments on static tags

With a static tag, a new deployment doesn't change the tag, so Radix doesn't pull a new image on its own. During a deployment, Radix reads `radixconfig.yaml` and creates or updates Kubernetes resources from it. If the resources don't change, Kubernetes does nothing, and the existing containers keep running. This is the case with static tags, since `radixconfig.yaml` stays the same between deployments.

To make the component run the latest image, restart it manually. Restart it from the component page in the web console, or call the restart endpoint in the [Radix API](https://api.radix.equinor.com/swaggerui/#/component/restartComponent) or [Radix CLI](https://github.com/equinor/radix-cli). The URL of the Radix API depends on which [Radix cluster](../../start/radix-clusters/index.md) hosts the application.

To avoid the manual restart, set `alwaysPullImageOnDeploy` to `true` on the component. Every deployment then changes the underlying Kubernetes resource, which makes Kubernetes pull the latest image from the container registry.

```yaml
spec:
  environments: 
  components:
    - name: api
      image: ghcr.io/my-repo/my-app/api:latest
      alwaysPullImageOnDeploy: true
```

:::tip
You can also put the full image reference in the `imageTagName` property:

```yaml
  components:
    - name: app
      image: {imageTagName}
      environmentConfig:
        - environment: qa
          imageTagName: ghcr.io/equinor/myapp/backend:qa
        - environment: dev
          imageTagName: ghcr.io/equinor/myapp/backend:dev
```
:::

## Configure Radix to use GitHub Container Registry

On the application `Configuration` page, set the secret for the private image hub to the [personal access token](./example-github-action-to-create-radix-deploy-pipeline-job.md#configuring-a-personal-access-token) you created, which needs permission to read packages. This gives Radix access to pull the packages that `radixconfig.yaml` refers to:

![PrivateImageHubSecret](./private-image-hubs.png)

## Deploy only specific components

If a Radix application has several components and you only need to deploy some of them, use the `--component` flag in Radix CLI to specify which components to deploy. You can specify the option multiple times, for example `--component api --component frontend`. Radix doesn't redeploy the other components in the environment. They keep their `commitID`, `gitTags`, environment variables, and secrets, and their replicas aren't restarted.

See the [Radix CLI deploy command](../../docs/topic-radix-cli/index.md#deploy-pipeline-job) for examples. You can also use the `component` option with the [Radix GitHub action](https://github.com/equinor/radix-github-actions) and the Radix API.

When a deploy pipeline job runs with the `--component` flag, the Radix Web Console shows which components weren't deployed on the pipeline job, deployment, and environment pages:

_Component **component1** keeps deployment commit @b57c551_

The commit (`@b57c551`) is shown only if the previous deployment of the component has a `CommitID`.

**Pipeline job**

![Deploy job with specific component](./deploy-job-with-specific-component.png)

**Deployment**

![Deployment with specific component](./deployment-with-specific-component.png)

**Environment**

![Environment with specific deployed component](./environment-with-specific-deployed-component.png)

## Example

The [example workflow](./example-github-action-to-create-radix-deploy-pipeline-job.md) shows how to deploy with both tagging strategies. It deploys `master` to `qa` with a static tag and `release` to `prod` with a dynamic tag. The example page describes each step in the workflow.