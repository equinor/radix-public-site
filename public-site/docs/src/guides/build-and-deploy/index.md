---
title: Build and deploy
---

# Build and deploy


::: tip TL;DR
- Pipeline jobs created manually from `Radix Web Console` or `Radix CLI` will always build all components and jobs.
- For pipeline jobs created from a `Github webhook`, Radix will only build components and jobs that affected by the changes, and reuse images from the active deployment for unchanged components/jobs.
- When Radix detects that `radixconfig.yaml` is modified, all components and jobs are built.
- When values for `build secrets` defined in radixconfig.yaml, are updated, the next pipeline job will build all components and jobs.
:::

The [`build-deploy`](../../start/workflows/) pipeline builds and deploys container images from Dockerfiles for components and jobs that do not have the [`image`](../../references/reference-radix-config/#image) property set in [`radixconfig.yaml`](../../references/reference-radix-config). The name and path of the Dockerfile for each component and job is defined in the [`dockerfileName`](../../references/reference-radix-config/#dockerfilename) and [`src`](../../references/reference-radix-config/#src) properties.

A `build-deploy` pipeline job can be created manually from [`Radix Web Console`](https://console.radix.equinor.com/) or [`Radix CLI`](../../docs/topic-radix-cli/), or automatically when code is pushed to the application's Github repository, if a [GitHub webhook](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks) is configured. Instructions on how to configure a Github webhook can be found in the `Webhook` section on the application's configuration page in Radix Web Console.

For manually created pipeline jobs, Radix will always build container images for all components and jobs. When a pipeline job is created by a Github webhook, Radix compares the commit ID from the webhook request body with the commit ID of the active deployment, to detect which directories have changed. The list of changed directories are then compared to the path of the Dockerfile for each component and job. If any of the changed directories are equal to, or a child of the Dockerfile path, a new image is built for the matching component or job. Radix will reuse the image from the current active deployment for components and jobs that have not changed.

::: tip
The path to the Dockerfile is defined by the `src` and `dockerfileName` properties. `dockerfileName` can contain path elements relative to `src`, for example `../Dockerfile` or `myfolder/Dockerfile`.

See [`dockerfileName`](../../references/reference-radix-config/#dockerfilename) and [`src`](../../references/reference-radix-config/#src) for more information.
:::

When Radix detects that `radixconfig.yaml` or `build secret` values have changed, all components and jobs are built.

If no changes are detected, and [`sub-pipeline`](../sub-pipeline/) is not configured, the pipeline job is stopped with status `Stopped no changes`.

The log from the `Orchestrating pipeline` step prints decisions made by Radix whether to build new images, reuse images from current deployment or use images from `image` property in `radixconfig`.

::: details Log examples

Component `server` was changed, and a new container image is built. `compute` and `compute2` is unchanged, and images from active deployment is used. Image for `redis` are configured in `image` property in `radixconfig`:
```
time="2023-11-13T14:44:31Z" level=info msg="Component image source in environments:"
time="2023-11-13T14:44:31Z" level=info msg="  qa:"
time="2023-11-13T14:44:31Z" level=info msg="    - server from build"
time="2023-11-13T14:44:31Z" level=info msg="    - redis from image in radixconfig"
time="2023-11-13T14:44:31Z" level=info msg="    - compute from active deployment"
time="2023-11-13T14:44:31Z" level=info msg="    - compute2 from active deployment"
```

Changed `radixconfig`, requiring all components to be built:
```
time="2023-11-13T14:42:56Z" level=info msg="RadixApplication updated since last deployment to environment qa"
time="2023-11-13T14:42:56Z" level=info msg="Component image source in environments:"
time="2023-11-13T14:42:56Z" level=info msg="  qa:"
time="2023-11-13T14:42:56Z" level=info msg="    - server from build"
time="2023-11-13T14:42:56Z" level=info msg="    - redis from image in radixconfig"
time="2023-11-13T14:42:56Z" level=info msg="    - compute from build"
time="2023-11-13T14:42:56Z" level=info msg="    - compute2 from build"
```

Changed `build secret` values, requiring all components to be built:
```
time="2023-11-13T14:37:44Z" level=info msg="Build secrets updated since last deployment to environment dev"
time="2023-11-13T14:37:44Z" level=info msg="Component image source in environments:"
time="2023-11-13T14:37:44Z" level=info msg="  qa:"
time="2023-11-13T14:37:44Z" level=info msg="    - server from build"
time="2023-11-13T14:37:44Z" level=info msg="    - redis from image in radixconfig"
time="2023-11-13T14:37:44Z" level=info msg="    - compute from build"
time="2023-11-13T14:37:44Z" level=info msg="    - compute2 from build"
```
:::

#### Example

To illustrate, consider an application with the following directory layout:

``` directory-structure
├── foo/
│   ├── images/
│   │   └── logo.jpg
│   ├── main.js
│   └── Dockerfile
├── bar/
│   ├── main.js
│   ├── README.md
│   └── Dockerfile
├── CHANGE_LOG.md
└── radixconfig.yaml
```

and corresponding radixconfig.yaml:

``` yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: myapp
spec:
  build:
    secrets:
      - SECRET1
      - SECRET2
  components:
    - name: foo
      src: /foo
    - name: bar
      src: /bar
```

Components `foo` and `bar` are configured with different directories for their Dockerfiles. We assume that an active deployment already exist, created from a `build-deploy` pipeline that built and deployed images named `foo:tag1` and `bar:tag1` for the `foo` and `bar` components respectively.

The application developer performs the following actions:
1. Pushes a new file, `/foo/images/header.jpg`, to the repository:
    - A new `build-deploy` pipeline is created by the Github webook.
    - Radix compares the commit ID received from the webhook with the commit ID of the current deployment, and detects that directory `/foo/images` has changed. This directory is a child of `/foo`, the path to the Dockerfile for component `foo`.
    - A new image, `foo:tag2`, is built for the `foo` component.
    - The `bar` component is unchanged, and Radix will reuse image `bar:tag1` from the current active deployment.
    - Once the build step is completed, the pipeline creates a new deployment where `foo` is configured to run the newly built `foo:tag2` image, and `bar` is configured to run the `bar:tag1` image from the previous deployment.
1. The `/bar/README.md` file is updated.
    - A new `build-deploy` job is created by the Github webhook.
    - Radix detects that the `/bar` directory has changed, the path to the Dockerfile for component `bar`.
    - A new image, `bar:tag3`, is built for the `bar` component.
    - The `foo` component is unchanged, and Radix will reuse image `foo:tag2`.
    - The new deployment is configured to run image `foo:tag2` for the `foo` component, and `bar:tag3` for the `bar` component.
1. The `/CHANGE_LOG.md` is updated.
    - A new `build-deploy` pipeline is triggered.
    - Radix detects that the `/` (root) directory has changed. This directory is not equal to, or a child of the path to the Dockerfiles for any components.
    - Radix aborts the pipeline with status `Stopped no changes`.
1. Files `/foo/main.js` and `/bar/main.js` are updated.
    - A new `build-deploy` pipeline is triggered.
    - Radix detects that directories `/foo` and `/bar` have changed, matching the path to the Dockerfiles for both components.
    - New images, `foo:tag4` and `bar:tag4`, are built for the components.
    - The new deployment is configured to run image `foo:tag4` for the `foo` component, and `bar:tag4` for the `bar` component.
1. The `radixconfig.yaml` is updated.
    - A new `build-deploy` pipeline is triggered.
    - Radix detects that the `/` (root) directory has changed. This directory does not match the path to the Dockerfiles for any components, but Radix detects that `radixconfig.yaml` is modified.
    - New images, `foo:tag5` and `bar:tag5`, are built for the components.
    - The new deployment is configured to run image `foo:tag5` for the `foo` component, and `bar:tag5` for the `bar` component.
1. The developer updates the value for build secret `SECRET1`.
    - At a later time, the `/CHANGE_LOG.md` is updated, and a new `build-deploy` pipeline is triggered.
    - Radix detects that the `/` (root) directory has changed, This directory does not match the path to the Dockerfiles for any components, but Radix detects that `build secrets` have changed since last deployment.
    - New images, `foo:tag6` and `bar:tag6`, are built for the components.
    - The new deployment is configured to run image `foo:tag6` for the `foo` component, and `bar:tag6` for the `bar` component.

If the Dockerfiles for the two components in the previous example are placed in the same directory, e.g. `/src`, then Radix will not be able to distinguish between them. Any change in `/src`, or any of its sub-folders, will always match both components. See example below:

``` directory-structure
├── src/
│   ├── foo/
│   │   ├── images/
│   │   │   └── logo.jpg
│   │   └── main.js
│   ├── bar/
│   │   ├── main.js
│   │   └── README.md
│   ├── foo.Dockerfile
│   └── bar.Dockerfile
├── CHANGE_LOG.md
└── radixconfig.yaml
```

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: myapp
spec:
  components:
    - name: foo
      src: src
      dockerfileName: foo.Dockerfile
    - name: bar
      src: src
      dockerfileName: bar.Dockerfile
```

#### More examples

* [One component with the source in a sub-folder](./example-single-component-application-with-source-in-subfolder.md)
* [One component with the source in the root](./example-single-component-application-with-source-in-root.md)
* [Multiple components with the code in sub-folders](./example-multiple-components-application-with-source-in-subfolders.md)
* [Multiple components in the root](./example-multiple-components-application-with-source-in-root.md)
* [Multiple Radix applications with the source in the same GitHub repository](./example-monorepo-for-multiple-applications-with-same-repository.md)