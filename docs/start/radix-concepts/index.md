---
title: Radix concepts
---

# Radix concepts

## Zones

A zone is a Radix deployment location that maps to a specific Azure region and Kubernetes cluster. Zones let you deploy applications close to their data and users while keeping environments isolated from each other.

![Diagram of Radix zones grouped by subscription](./zones-overview.svg "Radix zones")

Radix currently provides three production zones:

- 🇮🇪 Platform 1 - North Europe
- 🇳🇱 Platform 2 - West Europe - preferred alternative
- 🇸🇪 Platform 3 - Sweden Central - preferred
  
All production zones provide the same platform capabilities, services, and operational support. Data location and networking requirements should drive your choice of zone. If your application has no regional requirements, choose Platform 3 (Sweden Central).

For guidance on selecting an Azure region, see [Azure networking general information](https://docs.omnia.equinor.com/cloud-platforms/microsoft-azure/networking/networking-general-information/).

Each Radix zone corresponds to a single cluster. Radix provisions your applications, environments, networking, and platform resources in the cluster of the zone you select. See [Radix cluster information](../radix-clusters/index.md) for cluster details, including DNS zones and console links.

:::tip
Pick the production zone where your application's data and dependent services already live. Moving an application between zones later can mean migrating infrastructure, networking, and data.
:::

### Playground

Playground is a separate Radix zone. Use it for experimentation, prototyping, and early-stage application development. It provides the same developer experience as production zones but follows a different operational model and [lifecycle policy](../uptime/index.md#automatic-cleanup-in-playground-cluster). Playground also has [limited services](../uptime/index.md#radix-playground-services).

Radix automatically removes Playground resources according to the lifecycle policy, so don't run production workloads there.

You can skip the **Configuration Item** and **Administrators** fields when you [register an application](../registering-app/index.md) in Playground; production zones require them.

### Zone specific feature availability

Most Radix features are available across all production zones, but some features are limited to specific zones while Radix tests, rolls out, or phases them out.

The table below shows current availability for each feature.

| Feature | Playground | Platform 1 | Platform 2 | Platform 3 |
| --- | --- | --- | --- | --- |
| [Configuration Item](../../docs/topic-releases/index.md#2022-11-10-configuration-item-replaces-wbs-and-owner-and-is-now-mandatory) | ❌ Optional | ✅ Required | ✅ Required | ✅ Required |
| [Administrators](../../docs/topic-releases/index.md#2022-09-01-select-radix-application-administrator-group-by-name) | ❌ Optional | ✅ Required | ✅ Required | ✅ Required |
| [Auto cleanup (lifecycle policy)](../uptime/index.md#automatic-cleanup-in-playground-cluster) | ✅ Enforced | ❌ Not enforced | ❌ Not enforced | ❌ Not enforced |
| [Certificate automation](../../radix-config/index.md#dnsexternalalias) | ❌ Unavailable | ✅ Available | ✅ Available | ✅ Available |
| [Easy Auth](https://learn.microsoft.com/en-us/azure/app-service/overview-authentication-authorization) | ✅ Available | ❌ Unavailable | ❌ Unavailable | ❌ Unavailable |

:::info Note
Feature availability changes as Radix introduces, tests, and rolls out new capabilities across zones. Always refer to this table for the current status.
:::


## Application

Applications are the highest level of objects that can be created in Radix — all other objects are contained within them.

![Diagram of application main concepts](./application-overview.png "Application overview")

An application declares all its [components](#component); this allows for them to be deployed and managed together within [environments](#environment). For instance, `front-end` and `back-end` components would in principle be part of the same application.

The components of an application don't need to share aspects like coding language, runtime, or system resources — they are just running processes. But within an application, components should in principle relate closely by communicating with each other.

The basic configuration for an application (the _application registration_) is composed of a **name**, the URL of a **GitHub repository**, and **access control** configuration (i.e. which Active Directory groups can administer the application in Radix). The remainder of the configuration is provided by the [`radixconfig.yaml`](../../radix-config/index.md).

## Environment

An environment is an isolated area where all of an application's [components](#component) run. It is meant to compartmentalise an instance of the application, and can be used to provide that instance to users.

A typical setup is to create two environments, `development` and `production` — the former can be used for testing and showcasing features under development, and the latter is the "live" application that users rely on. Any (reasonable) number of environments is allowed in Radix; you can use these in a way that best fits your development and deployment [workflow](../workflows/index.md).

Within an environment, components should address each other over the network by using just their names, instead of IP addresses or FQDNs. For instance, if you have two components, `api` and `worker` (listening on port 3000 for HTTP calls), the API can communicate with `http://worker:3000/some-endpoint`.

:::tip
If you ❤️ Kubernetes, you'll be happy to know that Radix environments are actually just [K8s namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/).
:::

Environments are targets for [deployments](#deployment); at any time an environment will contain at most one _active deployment_. When a deployment is made active, all components within the environment are shut down and new ones are started, using the images defined in the deployment.

![Diagram of active deployment within environment](./environment-deployment.png "Environment with active deployment")

Environments (not deployments) also define any [secrets](#secret) that are required by the running components. Those secrets are kept in the environment when the active deployment is changed, and applied to the new components.

## Component

A component represents a standalone process running within an [environment](#environment) in a Radix application. Components are defined in the [`radixconfig.yaml`](../../radix-config/index.md#components), but they are only instantiated by [deployments](#deployment), which specify the Docker image to use. A component can have one or more running [replicas](#replica), depending on its configuration.

:::tip
Familiar with Docker or containers? A Radix component can be thought of as Docker image, and replicas as containers running that image.
:::

If a component's [`publicPort`](../../radix-config/index.md#publicport) is defined, [endpoints](../../docs/topic-domain-names/index.md) are made available on the public Internet for each environment the component is deployed to. This allows connections via HTTPS into Radix, which are routed internally to an HTTP endpoint on the component.

Components can further be configured independently on each environment. Besides [environment variables](#environment-variable) and [secrets](#secret), a component can have different resource usage and monitoring settings.

## Job

A [job](../../guides/jobs/index.md) represents an on-demand and short lived container/process, running within an [environment](#environment), that performs a set of tasks and exits when it is done. Jobs are defined in the [`radixconfig.yaml`](../../radix-config/index.md#jobs). They share the same configuration as a component with a few exceptions; a job does not have publicPort, replicas, horizontalScaling and alwaysPullImageOnDeploy.

Jobs have three job-specific configuration options:

* [`schedulerPort`](../../radix-config/index.md#schedulerport) defines the port where the [job-scheduler](../../guides/jobs/job-manager-and-job-api.md) listens for requests. It is required unless the job is triggered only by `cron` schedules.
* [`payload`](../../radix-config/index.md#payload) is optional. When specified, its `path` defines a directory in the container where the payload, sent via the job-scheduler, is mounted.
* [`cron`](../../radix-config/index.md#cron) is optional. When specified, it defines recurring schedules that start the job automatically.

Radix creates a [job-scheduler](../../guides/jobs/job-manager-and-job-api.md) service for each job defined in [`radixconfig.yaml`](../../radix-config/index.md#jobs). The job-scheduler is a web API that you use to create, delete and monitor containers from the Docker image built or defined for the job. HTTP requests to the job-scheduler can only be sent by components running in the same application and environment.

When creating a new job, a payload with arbitrary arguments can be specified in the body of the HTTP request to the job-scheduler. The payload is a string and can therefore contain any type of data (text, json, binary) as long as you encode it as a string, e.g. base64, when sending the request to the job-scheduler, and decode it when reading it from the file in the container where the payload is mounted.

:::tip
Cron scheduled jobs do not support the payload parameter.
If passed it will simply be ignored.
:::

Multiple job containers can run simultaneously. Each container is assigned a unique name that can be used to monitor the state of the job through the job-scheduler API. This name is also the internal DNS name that you can use to communicate with a specific job if it exposes any ports, e.g. a custom metrics HTTP endpoint.

## Replica

A replica is a running instance of a [component](#component). As a normal process, it can write to the standard output (`stdout`), which is made available for inspection by Radix.

If a replica terminates unexpectedly, a new one is started so that the component will maintain the specified number of replicas running (by default, this number is one). Each replica is started with the exact same configuration.

## Environment variable

A component can use any number of environment variables; the values of these are specified per [environment](#environment) in the `radixconfig.yaml`.

Note that each component has its own set of environment variables. It's quite possible (though maybe not great practice) to have two different components in the same environment using variables with the same name (e.g. `MY_ENV_VAR`), each with different values.

In addition to the user-defined variables, a series of variables prefixed with `RADIX_*` are made available to all components. Check the [variables section](../../radix-config/index.md#variables-common) of the `radixconfig.yaml` reference for details.

## Secret

Secrets are made available to components as environment variables. Unlike [environment variables](#environment-variable), secrets are defined in each [environment](#environment), and components specify the name of the secret they require (not the value). This means that the secrets remain in their environment regardless of the specific active [deployment](#deployment).

For each environment, a secret can be **consistent** or **missing**. A missing secret will prevent the component from starting up. To populate a secret, navigate to each environment within the Web Console, where required secrets and their state are displayed.

## Continuous integration and deployment

### Pipeline Jobs

Pipeline jobs are the core of the continuous integration/deployment (CI/CD) capabilities of Radix. Pipeline jobs perform tasks, which can causes changes in an application, its environments, and components. Depending on the type of job (its [pipeline](#pipeline)), different behaviours can be expected.

Jobs consist of a series of _steps_, run either in parallel or sequentially (this is also defined by the pipeline). Each step is a stand-alone process, and its output can be inspected.

### Pipeline

A pipeline defines a type of job. There are following types of pipeline in Radix:

### The `build-deploy` pipeline

This is triggered by a commit in GitHub to a branch mapped to an environment. In turn, this causes all components to be rebuilt and a new deployment to be created in the appropriate environment.

![Diagram of the build-deploy pipeline](./pipeline-build-deploy.jpg "The build-deploy pipeline")

### The `build` pipeline

Exactly the same as the `build-deploy` pipeline, but a deployment is not created at the end of the build. Useful for testing the ability to build the code, run tests, etc.

### The `promote` pipeline

Used to duplicate an existing [deployment](#deployment) from one environment into another (or to redeploy an old deployment). You can read more about it in the [promotion guide](../../guides/deployment-promotion/index.md).

### The `apply-config` pipeline

Used to apply config without re-building or re-deploying components in environments. No Radix deployment is created. Changes in the [radixconfig.yaml](../../radix-config/index.md) are applied to the Radix application regarding changes in properties [environments](../../radix-config/index.md#environments), [build](../../radix-config/index.md#build), [dnsAlias](../../radix-config/index.md#dnsalias).

### Cleanup of pipeline Jobs

Number of pipeline jobs may accumulate in time for a Radix application, cluttering the job list. Following rules are used to clean them up when a new pipeline job is created for a Radix application:
* Pipeline jobs preserved in the job history:
  * All successful jobs for which there is a Radix deployment they created
  * Up to 5 jobs per each environment and status type (Successful, Failed, etc.)
* Pipeline jobs being removed from the job history:
  * There is no anymore a Radix deployment for a corresponding successful job
  * A job is older than 30 days

### Scanning images for security issues

After a successful deployment, and on a daily schedule, component and job images are scanned for security related issues using [Trivy](https://trivy.dev/latest/). Refer to the [Vulnerability Scanning](../../docs/topic-vulnerabilities/index.md) documentation for more information.

### Sub-pipeline

After "Build components" step (if it does not exist - after "Prepare pipeline" step), the step "Run sub-pipeline" runs optional sub-pipeline, if it is configured. Sub-pipelines are based on the [Tekton CI/CD framework](https://tekton.dev/docs/getting-started/). Please read [Configure sub-pipeline](../../guides/sub-pipeline/index.md) guide for details about sub-pipelines.

### Deployment

Deployments are created by some types of [job](#job). A deployment defines the specific image used for each [component](#component) when it runs in an [environment](#environment). Deployments thus serve to aggregate specific versions of components, and make them easy to deploy together.

[Environment variables](#environment-variable) (but not [secrets](#secret)) are also stored within a deployment.

:::tip
See [this](../../guides/deploy-only/index.md) guide on how to set up your application to only use the continuous deployment (CD) on Radix
:::
