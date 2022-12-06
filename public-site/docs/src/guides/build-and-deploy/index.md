---
title: Build and deploy
---

# Build and deploy

Radix CI-CD pipeline can build a Radix application from the source code, located in the [GitHub repository](../../start/requirements/#repository) and then deployed to the Radix, using the [Build and deploy](../../start/workflows/) workflow.

When a Radix application component need to be built from the source code, it need to have an option [src](../../references/reference-radix-config/#src) or [dockerfileName](../../references/reference-radix-config/#dockerfilename) in the [radixconfig.yaml](../../references/reference-radix-config). 

There are few options how the code can be located in the GitHub repository for a Radix application:
* [One component with the source in a sub-folder](./example-single-component-application-with-source-in-subfolder.md)
* [One component with the source in the root](./example-single-component-application-with-source-in-root.md)
* [Multiple components with the code in sub-folders](./example-multiple-components-application-with-source-in-subfolders.md)
* [Multiple components in the root](./example-multiple-components-application-with-source-in-root.md)

The Radix provides an option to use a [GitHub webhook](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks), registered for a Radix application GitHub repository. If this webhook is used, GitHub sends events to Radix on push of changes to this repository. These events trigger new pipeline jobs with `Build and deploy` workflow for Radix applications. These jobs build and deploy Radix components, which have an option `src` or `dockerfileName` defined in the `radixconfig.yaml`.

In addition to the source code and configuration file, there can be other files and folders, which are not part of deployments: `README.md`, `CHANGE_LOG.md` for an application, `.gitignore`, folder with documentation, etc. Changes in these files do not affect components, built by Radix from sources (if these changed files and folders are outside of locations, specified in the component `src` option). To avoid unnecessary re-deployment of a these Radix components, `Build and deploy` pipeline workflow analyses changes, committed to a repository to find out if source files were changed for these components. When such changes are detected, the Radix application is built and deployed, otherwise the pipeline job is stopped with a status `Stopped no changes`. 

Conditions when a `Build and deploy` workflow build and deploy components:
* When files are changed in the GitHub repository folder, specified for a Radix application component in the `src` option.
* When a component does not have an option `image`, and an option `src` is set as `src: .` (a root of the repository) or it is omitted (which falls down to a default value `src: .`).
* When the configuration file [radixconfig.yaml](../../references/reference-radix-config) (or the one, [specified in the Radix application config form](../monorepo/#)) is changed in the config branch.
* When there is [sub-pipeline (Tekton pipeline)](../sub-pipeline) in the repository branch, which received changes.
* When the pipeline job is triggered manually from the Radix console or by [Radix CLI](https://github.com/equinor/radix-cli)

Another reason to build and deploy Radix application only when its component source code changed is a [monorepo strategy](../monorepo/). When multiple applications use the same GitHub repository for their source code, but with different sub-folders of this repository for their components. Changes for components of one application do not re-build and re-deploy another application. 
