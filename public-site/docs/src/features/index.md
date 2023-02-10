---
title: Features
---

# Features in Omnia Radix

## Alerting and notification


## Authentication 

[Guide](../guides/authentication/#authentication) - 
[Radix config reference](../references/reference-radix-config/#authentication)

### Client certificates
ClientCertificates, which can be configured for a component or a specific environment.

[Radix config reference](../references/reference-radix-config/#clientcertificate)

### OAuth service
Radix provides built-in configuration for adding OAuth2 authorization with OIDC to the component. Common `oauth2` settings can be configured at component level and/or in the component's `environmentConfig` section. 

[Guide](../guides/authentication/#using-the-radix-oauth2-feature) - 
[Radix config reference](../references/reference-radix-config/#oauth2)

## Azure Keyvault integration
Azure Key vault (opens new window)secrets, keys and certificates can be used in Radix as secrets. Once configured, they are available in replicas of Radix application as environment variables and files.

[Guide](../guides/azure-key-vaults/) - 
[Radix config reference](../references/reference-radix-config/#azurekeyvault)

Keyvault secret, keys and certificates are listed as variables in web console, including version information.

[Guide](../guides/azure-key-vaults/#azure-key-vault-secret-certificate-and-key-versions)

Autorotation of secrets

[Guide](../guides/azure-key-vaults/#autorotation-of-secrets)

## Azure Federated identity credentials

Some workloads (component or job replicas) running in Radix require credentials (JWT access tokens) for an Azure AD app registration or user-assigned managed identity to access Azure AD protected resources, like MS Graph, Key Vaults, Storage Accounts or Azure SQL Databases. Credentials for such workloads can be acquired using the Oauth 2.0 client credentials flow (opens new window). The client credentials flow permits a workload to use its own credentials to access protected resources instead of impersonating a user. Credentials can be acquired by using either a shared secret, a certificate or with federated credentials.

[Guide](../guides/workload-identity/) - 
[Radix config reference](../references/reference-radix-config/#identity)


## Backup
Application configuration is backed up every hour using Velero and that backup is stored in the Azure Storage account.

## Auto build and/or deploy on GitHub commit
Continuous integration/deployment (CI/CD), using the Webhook, and secured by deploy key

[Doc](../docs/topic-concepts/#continuous-integration-and-deployment) - [Guide](../guides/build-and-deploy/#build-and-deploy)

### Workflows

 It is possible to use, for instance Git Flow or Trunk-based development. Radix gives us a couple of tools to shape our workflow: branch-environment mapping and deployment promotion.

[Doc](../start/workflows/#workflows)

## Build and deploy pipeline

[Guide](../guides/build-and-deploy/#build-and-deploy)

## Deploy only pipeline

[Guide](../guides/deploy-only/#deploy-to-radix-using-other-continuous-integration-ci-tool) - [Radix config](../guides/deploy-only/#the-radixconfig-yaml-file)

### AD Service Access Token

In order to run a deploy-only pipeline job, Azure service principals Azure AD app registration or user-assigned managed identity can be used.

[Guide](../guides/deploy-only/#ad-service-principal-access-token)
[Sample](../guides/deploy-only/example-github-action-using-ad-service-principal-access-token.html)

## Promote pipeline

Promote from one environment(deployment) to another.

[Guide](../guides/deployment-promotion/#promote-to-another-environment)

### Rollback to any version (as part of Promote)

It is easy to rollback to an earlier version, using the promote pipeline (yes, it should have been called demote - or rollback)

[Guide](../guides/deployment-promotion/#promote-an-old-deployment-rollback)
## Build secrets

[Guide](../guides/build-secrets/)

## Certificates, SSL certificates

Only HTTPS traffic is allowed in and out of the application. SSL certificates are automatically managed by Radix, except for custom external aliases.

[Doc](../docs/topic-runtime-env/#traffic) - [Radix config](../references/reference-radix-config/#clientcertificate)

### Custom certificate

Managing your own certificate is possible. Adding the certificate information to your application is done using the Radix Console

[Guide](../guides/external-alias/#acquire-an-equinor-certificate)
## Component and/or Environment stop/start/restart

Stop, Start and Restart of a running component or all components in an environment can be done in the Web console.

[Guide](../guides/component-start-stop-restart/)

## Command Line (Radix CLI)

Radix offers a command line interface - Radix CLI, which uses the command rx.

[Radix CLI](https://github.com/equinor/radix-cli/blob/master/README.md)

## Container logs in Radix console and Radix CLI

To be updated

## Cost calculation

Cost calculation is based on the total time the replicas(containers) belonging to an application has been running, and how much CPU and memory the replicas requested.

[Doc](../docs/topic-cost/#how-is-the-cost-calculated)

## DNS aliases

Each application can have one specific component in one specific environment set as the default alias.

[Doc](../docs/topic-concepts/#default-alias) - [Radix config](../references/reference-radix-config/#dnsappalias)

## External alias (byo DNS certificate)

It is possible to have multiple custom DNS aliases (i.e. to choose your own custom domain) for the application. 

[Doc](../docs/topic-concepts/#external-custom-alias) [Guide](../guides/external-alias/) - [Radix config](../references/reference-radix-config/#dnsexternalalias)

## Egress rules

[Guide](../guides/egress-config/#egress) - [Radix config](../references/reference-radix-config/#egress)

## Enable/disable components
Components can be enabled or disabled for all or only certain environment(s).

[Guide](../guides/enable-and-disable-components/) - 
[Radix config reference](../references/reference-radix-config/#enabled)

## Environment(s)

[Doc](../docs/topic-concepts/#environment)

### Environment variables

[Doc](../docs/topic-runtime-env/#environment-variables) - [Guide](../guides/environment-variables)

### Multiple environments

[Doc](../start/workflows/#branches-mapped-to-different-environments)

## Horizontal autoscaling

Number of replicas can be used to horizontally scale.

[Radix config](../references/reference-radix-config/#horizontalscaling)

## Job scheduler

[Guide](../guides/configure-jobs/#job-scheduler) - [Radix config](../references/reference-radix-config/#jobs)

## Job batches

[Guide](../guides/configure-jobs/#batch-of-jobs)
## Jobs

[Guide](../guides/configure-jobs)

## Kubernetes Cluster node autoscaling

For modern application development in Kubernetes and in Radix it is preferred to create applications that scales horizontally rather than vertically.

[Guide](../guides/resource-request/#autoscaling)

## Monorepo

It is possible to have multiple Radix applications, using the same GitHub repository, also known as monorepo software development strategy.

[Guide](../guides/monorepo)

## Monitoring and metrics

Prometheus and Grafana are the main tools provided in Radix for analytics and monitoring visualisation.

[Guide](../guides/monitoring/#monitoring-your-app) - [Doc](../docs/topic-monitoring/) - [Radix config](../references/reference-radix-config/#monitoring) and [config](../references/reference-radix-config/#monitoringconfig)

## Sub-pipelines (Tekton)

After "Build components" step (if it does not exist - after "Prepare pipeline" step), the step "Run sub-pipeline" runs optional sub-pipeline

[Guide](../guides/sub-pipeline/) - [Radix config]()

## Pipeline status badges

A pipeline status badge shows the status of the latest pipeline job of a specific type in a specific environment. Status is one of success, failing, stopped, pending or running.

[Guide](../guides/pipeline-badge/#configure-pipeline-badges)
## Private container image repositories


## Probes, monitoring container liveness

Radix uses readiness probe to minimize this downtime as close to zero as possible.

[Doc](../docs/topic-rollingupdate/#readiness-probe)

## Replica

A replica is a running instance of a component. As a normal process, it can write to the standard output (stdout), which is made available for inspection by Radix.

[Doc](../docs/topic-concepts/#replica)

## Resource request and limits

`resources` is used to ensure that each container is allocated enough resources to run as it should.

[Guide](../guides/resource-request/)

## Rolling updates


## Runtime secrets

Secrets are made available to components as environment variables

[Doc](../docs/topic-concepts/#secret)

## Git Submodules


## Volume mounts



## Vulnerability scanning


## Web console (dashboard)



