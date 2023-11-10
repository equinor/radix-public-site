---
title: Build and deploy
---

# Build and deploy

The [`build-deploy`](../../start/workflows/) pipeline builds and deploys Docker files for components and jobs that do not have the [`image`](../../references/reference-radix-config/#image) property set in [`radixconfig.yaml`](../../references/reference-radix-config). The location of the Docker file for each component/job is defined in the [`dockerfileName`](../../references/reference-radix-config/#dockerfilename) and [`src`](../../references/reference-radix-config/#src) properties.

A `build-deploy` pipeline job can be created manually from [`Radix Web Console`](https://console.radix.equinor.com/) or [`Radix CLI`](../../docs/topic-radix-cli/), or automatically when code is pushed to the application's Github repository if a [GitHub webhook](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks) is configured. Instructions on how to register a Github webhook is found in the `Webhook` section on application's configuration page in Radix Web Console.

For manually created pipeline jobs, Radix will always build all components and jobs, but when a pipeline job is created from a Github webhook, Radix compares the commit ID from the webhook request body with the commit ID of the active deployment to detect which directories have changed. The list of changed directories are then compared to the `src` property for each component and job, and if any directory is equal to, or a child of `src`, the component/job is built. Radix will use the image from the current active deployment for components and jobs that do not need to be built.

When Radix detects that `radixconfig.yaml` or `build secret` values have changed, all components and jobs are built, and if no changes are detected, the pipeline job is stopped with status `Stopped no changes`.

#### Example

To illustrate, consider an application with the following directory layout

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

and corresponding radixconfig.yaml

``` radixconfig.yaml
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

Components `foo` and `bar` are configured with `src` set to separate directories. We assume that an active deployment already exist, created from a `build-deploy` pipeline job that built images named `foo:tag1` and `bar:tag1` for the `foo` and `bar` components respectively.

The application developer performs the following actions:
1. A new file, `/foo/images/header.jpg`, is pushed to the repository. This triggers a new `build-deploy` pipeline job from the Github webhook. Radix compares the commit ID received from the webhook with the commit ID of the current deployment, and detects that directory `/foo/images` has changed. This directory is a child of `/foo` which is defined as `src` for the `foo` component. Radix will therefore build a new image, e.g. `foo:tag2`, for this component. The `bar` component is unchanged, and Radix will reuse the image from the current active deployment. Once the build step is completed, the pipeline job creates a new deployment where `foo` is configured to run the `foo:tag2` image and `bar` is configured to run `bar:tag1`.
1. The `/bar/README.md` file is updated, and a new `build-deploy` job is triggered from the Github webhook. Radix detects that the `/bar` directory has changed, which is the `src` of the `bar` component. Radix will therefore build a new image, e.g. `bar:tag3`, for this component, and reuse the image `foo:tag2` for the unchanged `foo` component.
1. The `/CHANGE_LOG.md` is updated, and a new `build-deploy` pipeline job is triggered. Radix detects that the `/` (root) directory has changed. This directory does is not within the `src` directory structure of any components, and Radix will abort the pipeline job with status `Stopped no changes`.
1. Files `/foo/main.js` and `/bar/main.js` are updated, and a new `build-deploy` pipeline job is triggered. Radix detects that directories `/foo` and `/bar` have changed, and builds new images, `foo:tag4` and `bar:tag4`, for both components. The new deployment is configured to use image `foo:tag4` for `foo` and `bar:tag4` for bar.
1. The `radixconfig.yaml` is updated, and a new `build-deploy` pipeline job is triggered. Radix detects that the `/` (root) directory has changed. Even though this directory does not match the `src` of any components, Radix sees that `radixconfig.yaml` was modified and will therefore build new images for all components.
1. The developer updates the value for build secret `SECRET1`. Later, the `/CHANGE_LOG.md` is updated, and a new `build-deploy` pipeline job is triggered. Radix detects that the `/` (root) directory has changed, which does match the `src` of any components, but since build secrets have changed since last deployment, Radix builds new images, `foo:tag5` and `bar:tag5`, for both components. The new deployment is configured to use image `foo:tag5` for `foo` and `bar:tag5` for bar.

The build change detection described in the previous example example would not have worked had the Docker files been placed in the same directory, e.g. `/` (root). In the next example, both of the components have `src` set to `.` (root). Any change will always match, or be a child of `src`, and Radix will therefore always build both components.

``` directory-structure
├── foo/
│   ├── images/
│   │   └── logo.jpg
│   └── main.js
├── bar/
│   ├── main.js
│   └── README.md
├── foo.Dockerfile
├── bar.Dockerfile
├── CHANGE_LOG.md
└── radixconfig.yaml
```

``` radixconfig.yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: myapp
spec:
  components:
    - name: foo
      dockerfileName: foo.Dockerfile
      src: .
    - name: bar
      dockerfileName: bar.Dockerfile
      src: .
```

#### Summary

- Pipeline jobs created manually from `Radix Web Console` or `Radix CLI` will always build all components and jobs.
- When pipeline jobs are created from a `Github webhook`, Radix will only build component/jobs that are affected by the changed directories.
- When Radix detects that `radixconfig.yaml` is modified, all components and jobs are built.
- When `build secret` values are updated, the new `build-deploy` will build all components and jobs.
