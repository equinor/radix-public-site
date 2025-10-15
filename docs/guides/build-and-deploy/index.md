---
title: Build and Deploy
---

# Build and Deploy

The `build-deploy` pipeline job builds and deploys container images from Dockerfiles for components and jobs that do not have the [`image`](../../radix-config/index.md#image) property set in [`radixconfig.yaml`](../../radix-config/index.md). The path to the Dockerfile, and the Dockerfile's [build context](https://docs.docker.com/build/concepts/context/), is defined by the [`src`](../../radix-config/index.md#src) and [`dockerfileName`](../../radix-config/index.md#dockerfilename) options for each component/job.

Radix detemines which [`environments`](../../radix-config/index.md#environments) to build and deploy by comparing the **branch** or **tag** arguments specified for the pipeline job with the [`build`](../../radix-config/index.md#build-environment) configuration for each environment.

An optional argument **commitID** can be specified to control which commit to build. The pipeline job will fail if the commit is not an ancestor of the specified branch. If commitID is omitted, Radix will build the latest commit of the branch.

When **commitID** is specified for the pipeline job, Radix will run a `git diff` between this commit ID, and the commit ID of the active deployment for each environment. The list of changed files from the `git diff` are compared with the [`src`](../../radix-config/index.md#src) path for each component/job to determine if a build is required, by checking if [`src`](../../radix-config/index.md#src) is parent of any of the changed files. The corresponding image from the active deployment is reused if no match is found. The exception is when [`radixconfig.yaml`](../../radix-config/index.md) or [`build secrets`](../../radix-config/index.md#secrets-build-secrets) have changed since last deployment, which will force a build of all components and jobs. If no changes are detected, and no [`sub-pipelines`](../sub-pipeline/) are configured, the pipeline job is stopped with status `StoppedNoChanges`.

**commitID** is always specified when a pipline job is triggered from a `Github Webhook`, and can optionally be specified when using [`Radix CLI`](../../docs/topic-radix-cli/index.md#build-and-deploy-pipeline-job) with the `--commitID` flag. Pipeline jobs triggered from `Radix Web Console` will not set this value, causing all components and jobs to be built.  

By default, the container image is built and deployed for `amd64` CPU architecture, but can be configured to use `arm64` in the [`runtime`](../../radix-config/index.md#runtime-detailed) section in [`radixconfig.yaml`](../../radix-config/index.md). Building `arm64` requires [`useBuildKit`](../../radix-config/index.md#usebuildkit) to be enabled.

The log from the `Orchestrating pipeline` step prints decisions made by Radix whether to build new images, reuse images from current deployment, or use images from [`image`](../../radix-config/index.md#image) property in [`radixconfig.yaml`](../../radix-config/index.md).

#### Log examples

Component `server` was changed, and a new container image is built. `compute` and `compute2` are unchanged, and images from active deployment are used. Image for `redis` is configured in `image` property in `radixconfig`:
```
time="2023-11-13T14:44:31Z" level=info msg="Component image source in environments:"
time="2023-11-13T14:44:31Z" level=info msg="  qa:"
time="2023-11-13T14:44:31Z" level=info msg="    - server (arch: amd64) from build"
time="2023-11-13T14:44:31Z" level=info msg="    - redis from image in radixconfig"
time="2023-11-13T14:44:31Z" level=info msg="    - compute from active deployment"
time="2023-11-13T14:44:31Z" level=info msg="    - compute2 from active deployment"
```

Changed `radixconfig`, requiring all components to be built:
```
time="2023-11-13T14:42:56Z" level=info msg="RadixApplication updated since last deployment to environment qa"
time="2023-11-13T14:42:56Z" level=info msg="Component image source in environments:"
time="2023-11-13T14:42:56Z" level=info msg="  qa:"
time="2023-11-13T14:42:56Z" level=info msg="    - server (arch: amd64) from build"
time="2023-11-13T14:42:56Z" level=info msg="    - redis from image in radixconfig"
time="2023-11-13T14:42:56Z" level=info msg="    - compute (arch: amd64) from build"
time="2023-11-13T14:42:56Z" level=info msg="    - compute2 (arch: amd64) from build"
```

Changed `build secret` values, requiring all components to be built:
```
time="2023-11-13T14:37:44Z" level=info msg="Build secrets updated since last deployment to environment dev"
time="2023-11-13T14:37:44Z" level=info msg="Component image source in environments:"
time="2023-11-13T14:37:44Z" level=info msg="  qa:"
time="2023-11-13T14:37:44Z" level=info msg="    - server (arch: amd64) from build"
time="2023-11-13T14:37:44Z" level=info msg="    - redis from image in radixconfig"
time="2023-11-13T14:37:44Z" level=info msg="    - compute (arch: amd64) from build"
time="2023-11-13T14:37:44Z" level=info msg="    - compute2 (arch: amd64) from build"
```

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