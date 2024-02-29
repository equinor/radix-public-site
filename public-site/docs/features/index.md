---
title: Features in Omnia Radix
displayed_sidebar: featuresSidebar
---

# Features in Omnia Radix

## Alerting and notification

Radix can send alerts about failing pipeline jobs, components or jobs to Slack using Incoming Webhooks.

[Guide](/docs/guides/alerting/index.md)

## Authentication

[Guide](/docs/guides/authentication/index.md) -
[Radix config reference](/docs/references/reference-radix-config/index.md#authentication)

### Client certificates

ClientCertificates, which can be configured for a component or a specific environment.

[Radix config reference](/docs/references/reference-radix-config/index.md#clientcertificate)

### OAuth service

Radix provides built-in configuration for adding OAuth2 authorization with OIDC to the component. Common `oauth2` settings can be configured at component level and/or in the component's `environmentConfig` section.

[Guide](/docs/guides/authentication/index.md#using-the-radix-oauth2-feature) -
[Radix config reference](/docs/references/reference-radix-config/index.md#oauth2)

## Azure Blob Storage CSI driver

This driver allows Kubernetes to access Azure Storage - Blobs.

[Guide](/docs/guides/volume-mounts) - [Radix config reference](/docs/references/reference-radix-config/index.md#volumemounts)

## Azure Key Vault integration

Azure Key Vault secrets, keys and certificates can be used in Radix as secrets. Once configured, they are available in replicas of Radix application as environment variables and files.

[Guide](/docs/guides/azure-key-vaults/) -
[Radix config reference](/docs/references/reference-radix-config/index.md#azurekeyvault)

Key Vault secret, keys and certificates are listed as variables in web console, including version information.

[Guide](/docs/guides/azure-key-vaults/index.md#azure-key-vault-secret-certificate-and-key-versions)

Autorotation of secrets

[Guide](/docs/guides/azure-key-vaults/index.md#autorotation-of-secrets)

## Azure Workload Identity

Some workloads (component or job replicas) running in Radix require credentials (JWT access tokens) for an Azure AD app registration or user-assigned managed identity to access Azure AD protected resources, like MS Graph, Key Vaults, Storage Accounts or Azure SQL Databases. Credentials for such workloads can be acquired using the OAuth 2.0 client credentials flow. The client credentials flow permits a workload to use its own credentials to access protected resources instead of impersonating a user. Credentials can be acquired by using either a shared secret, a certificate or with federated credentials.

[Guide](/docs/guides/workload-identity/) -
[Radix config reference](/docs/references/reference-radix-config/index.md#identity)

## Backup

Application configuration is backed up every hour using Velero and that backup is stored in the Azure Storage account.

## Auto build and/or deploy on GitHub commit

Continuous integration/deployment (CI/CD), using a GitHub Webhook, secured by a deploy key and a webhook secret.

[Doc](/docs/start/radix-concepts/index.md#continuous-integration-and-deployment) - [Guide](/docs/guides/build-and-deploy/index.md)

### Workflows

It is possible to use, for instance Git Flow or Trunk-based development. Radix gives us a couple of tools to shape our workflow: branch-environment mapping and deployment promotion.

[Doc](/docs/start/workflows/index.md)

## Build and deploy pipeline

The most used pipeline is the build and deploy pipeline, which builds the application and deploys the resulting image(s).

[Guide](/docs/guides/build-and-deploy/index.md)

## Deploy only pipeline

Another pipeline is the deploy only pipeline, which deployes a already built image.

[Guide](/docs/guides/deploy-only/index.md) - [Radix config reference](/docs/guides/deploy-only/index.md#the-radixconfigyaml-file)

### AD Service Access Token

In order to run a deploy-only pipeline job, Azure service principals Azure AD app registration or user-assigned managed identity can be used.

[Guide](/docs/guides/deploy-only/index.md#ad-service-principal-access-token)

## Promote pipeline

Promote a deployment to another or the same environment.

[Guide](/docs/guides/deployment-promotion/index.md#promote-to-another-environment)

### Rollback to any version (as part of Promote)

It is easy to rollback to an earlier version, using the promote pipeline (yes, it should have been called demote - or rollback)

[Guide](/docs/guides/deployment-promotion/index.md#promote-an-old-deploymentrollback)

## Build secrets

Named values, entered in the Radix console, passed as arguments to a Dockerfile build operation.

[Guide](/docs/guides/build-secrets/) -  [Radix config reference](/docs/references/reference-radix-config/index.md#secrets)

## Certificates, SSL certificates

Only HTTPS traffic is allowed in and out of the application. SSL certificates are automatically managed by Radix, except for custom external aliases.

[Doc](/docs/docs/topic-runtime-env/index.md#traffic) - [Radix config reference](/docs/references/reference-radix-config/index.md#clientcertificate)

### Custom certificate

Managing your own certificate is possible. Adding the certificate information to your application is done using the Radix Console

[Guide](/docs/guides/external-alias/index.md#acquire-an-equinor-tls-certificate)

## Component and/or Environment stop/start/restart

Stop, Start and Restart of a running component or all components in an environment can be done in the Web console.

[Guide](/docs/guides/component-start-stop-restart/)

## Command Line (Radix CLI)

Radix offers a command line interface - Radix CLI, which uses the command rx.

[Docs](/docs/docs/topic-radix-cli/)

## Container logs in Radix console and Radix CLI

Container logs can be accessed using Radix Web Console or Radix CLI.

[Docs](/docs/docs/topic-logs/)

## Code editor integrations - radixconfig.yaml schema validation

Enable auto-completion and schema validation for `radixconfig.yaml` in VS Code and Jetbrains IDEs.

[Guide](/docs/references/reference-code-editor-integration)

## Cost calculation

Cost calculation is based on the total time the replicas(containers) belonging to an application has been running, and how much CPU and memory the replicas requested.

[Doc](/docs/docs/topic-cost/index.md#how-is-the-cost-calculated)

## DNS aliases

Each application can have one specific component in one specific environment set as the default alias.

[Doc](/docs/start/radix-concepts/index.md#default-alias) - [Radix config reference](/docs/references/reference-radix-config/index.md#dnsappalias)

## External alias (byo DNS certificate)

It is possible to have multiple custom DNS aliases (i.e. to choose your own custom domain) for the application.

[Doc](/docs/start/radix-concepts/index.md#external-custom-alias) [Guide](/docs/guides/external-alias/) - [Radix config reference](/docs/references/reference-radix-config/index.md#dnsexternalalias)

## Egress rules

An egress configuration can define rules for outbound traffic from a Radix application.

[Guide](/docs/guides/egress-config/index.md) - [Radix config reference](/docs/references/reference-radix-config/index.md#egress)

## Enable/disable components

Components can be enabled or disabled for all or only certain environments.

[Guide](/docs/guides/enable-and-disable-components/) -
[Radix config reference](/docs/references/reference-radix-config/index.md#enabled)

## Environment(s)

[Doc](/docs/start/radix-concepts/index.md#environment)

### Environment variables

[Doc](/docs/docs/topic-runtime-env/index.md#environment-variables) - [Guide](/docs/guides/environment-variables)

### Multiple environments

[Doc](/docs/start/workflows/index.md#branches-mapped-to-different-environments)

## Horizontal autoscaling

Number of replicas can be used to horizontally scale.

[Radix config](/docs/references/reference-radix-config/index.md#horizontalscaling)

## Job manager

[Guide](/docs/guides/jobs/job-manager-and-job-api.md) - [Radix config reference](/docs/references/reference-radix-config/index.md#jobs)

## Job batches

[Guide](/docs/guides/jobs/configure-jobs.md)

## Jobs

[Guide](/docs/guides/jobs)

## Kubernetes Cluster node autoscaling

For modern application development in Kubernetes and in Radix it is preferred to create applications that scales horizontally rather than vertically.

[Guide](/docs/guides/resource-request/index.md#autoscaling)

## Monorepo

It is possible to have multiple Radix applications, using the same GitHub repository, also known as monorepo software development strategy.

[Guide](/docs/guides/monorepo)

## Monitoring and metrics

Prometheus and Grafana are the main tools provided in Radix for analytics and monitoring visualisation.

[Guide](/docs/guides/monitoring/index.md) - [Doc](/docs/docs/topic-monitoring/) - [Radix config reference](/docs/references/reference-radix-config/index.md#monitoring) and [config reference](/docs/references/reference-radix-config/index.md#monitoringconfig)

## Sub-pipelines (Tekton)

After "Build components" step (if it does not exist - after "Prepare pipeline" step), the step "Run sub-pipeline" runs optional sub-pipeline. Using the Tekton CI/CD framework.

[Doc](/docs/start/radix-concepts/index.md#sub-pipeline) [Guide](/docs/guides/sub-pipeline/) - [Tekton documentation](https://tekton.dev/docs/pipelines/pipelines/)

## Pipeline status badges

A pipeline status badge shows the status of the latest pipeline job of a specific type in a specific environment. Status is one of success, failing, stopped, pending or running.

[Guide](/docs/guides/pipeline-badge/index.md)

## Private container image repositories

When using a Deploy only strategy, a private image is often used.

[Guide](/docs/guides/deploy-only/index.md#the-radixconfigyaml-file) - [Radix config reference](/docs/references/reference-radix-config/index.md#privateimagehubs)

## Probes, monitoring container liveness

Radix uses readiness probe to minimize this downtime as close to zero as possible.

[Doc](/docs/docs/topic-rollingupdate/index.md#readiness-probe)

## Replica

A replica is a running instance of a component. As a normal process, it can write to the standard output (stdout), which is made available for inspection by Radix.

[Doc](/docs/start/radix-concepts/index.md#replica)

## Resource request and limits

`resources` is used to ensure that each container is allocated enough resources to run as it should.

[Guide](/docs/guides/resource-request/)

## Rolling updates

Radix aims to support zero downtime application re-deployment by utilising Kubernetes' rolling update and readiness probe features.

[Doc](/docs/docs/topic-rollingupdate/index.md)

## Runtime secrets

Secrets are made available to components as environment variables

[Doc](/docs/start/radix-concepts/index.md#secret)

## Git Submodules

Submodules is a native git feature which enables git repositories within other git repositories.

[Guide](/docs/guides/git-submodules/)

## Vulnerability scanning

## Web console (dashboard)
