---
title: Features in Omnia Radix
---

# Features in Omnia Radix

## Alerting and notification
Radix can send alerts about failing pipeline jobs, components or jobs to Slack using Incoming Webhooks.

[Guide](../guides/alerting/#alerting)
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

## Azure Blob Storage CSI driver
This driver allows Kubernetes to access Azure Storage - Blobs.

[Guide](../guides/volume-mounts) - [Radix config reference](../references/reference-radix-config/#volumemounts)
## Azure Keyvault integration
Azure Key vault secrets, keys and certificates can be used in Radix as secrets. Once configured, they are available in replicas of Radix application as environment variables and files.

[Guide](../guides/azure-key-vaults/) - 
[Radix config reference](../references/reference-radix-config/#azurekeyvault)

Keyvault secret, keys and certificates are listed as variables in web console, including version information.

[Guide](../guides/azure-key-vaults/#azure-key-vault-secret-certificate-and-key-versions)

Autorotation of secrets

[Guide](../guides/azure-key-vaults/#autorotation-of-secrets)

## Azure Federated identity credentials
Some workloads (component or job replicas) running in Radix require credentials (JWT access tokens) for an Azure AD app registration or user-assigned managed identity to access Azure AD protected resources, like MS Graph, Key Vaults, Storage Accounts or Azure SQL Databases. Credentials for such workloads can be acquired using the OAuth 2.0 client credentials flow. The client credentials flow permits a workload to use its own credentials to access protected resources instead of impersonating a user. Credentials can be acquired by using either a shared secret, a certificate or with federated credentials.

[Guide](../guides/workload-identity/) - 
[Radix config reference](../references/reference-radix-config/#identity)


## Backup
Application configuration is backed up every hour using Velero and that backup is stored in the Azure Storage account.

## Auto build and/or deploy on GitHub commit
Continuous integration/deployment (CI/CD), using a GitHub Webhook, secured by a deploy key and a webhook secret.

[Doc](../docs/topic-concepts/#continuous-integration-and-deployment) - [Guide](../guides/build-and-deploy/#build-and-deploy)

### Workflows
It is possible to use, for instance Git Flow or Trunk-based development. Radix gives us a couple of tools to shape our workflow: branch-environment mapping and deployment promotion.

[Doc](../start/workflows/#workflows)

## Build and deploy pipeline
The most used pipeline is the build and deploy pipeline, which builds the application and deploys the resulting image(s).

[Guide](../guides/build-and-deploy/#build-and-deploy)

## Deploy only pipeline
Another pipeline is the deploy only pipeline, which deployes a already built image.

[Guide](../guides/deploy-only/#deploy-to-radix-using-other-continuous-integration-ci-tool) - [Radix config reference](../guides/deploy-only/#the-radixconfig-yaml-file)

### AD Service Access Token
In order to run a deploy-only pipeline job, Azure service principals Azure AD app registration or user-assigned managed identity can be used.

[Guide](../guides/deploy-only/#ad-service-principal-access-token)
[Sample](../guides/deploy-only/example-github-action-using-ad-service-principal-access-token.html)

## Promote pipeline
Promote a deployment to another or the same environment.

[Guide](../guides/deployment-promotion/#promote-to-another-environment)

### Rollback to any version (as part of Promote)
It is easy to rollback to an earlier version, using the promote pipeline (yes, it should have been called demote - or rollback)

[Guide](../guides/deployment-promotion/#promote-an-old-deployment-rollback)
## Build secrets
Named values, entered in the Radix console, passed as arguments to a Dockerfile build operation.

[Guide](../guides/build-secrets/) -  [Radix config reference](../references/references/reference-radix-config/#secrets)

## Certificates, SSL certificates
Only HTTPS traffic is allowed in and out of the application. SSL certificates are automatically managed by Radix, except for custom external aliases.

[Doc](../docs/topic-runtime-env/#traffic) - [Radix config reference](../references/reference-radix-config/#clientcertificate)

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

[Doc](../docs/topic-concepts/#default-alias) - [Radix config reference](../references/reference-radix-config/#dnsappalias)

## External alias (byo DNS certificate)
It is possible to have multiple custom DNS aliases (i.e. to choose your own custom domain) for the application. 

[Doc](../docs/topic-concepts/#external-custom-alias) [Guide](../guides/external-alias/) - [Radix config reference](../references/reference-radix-config/#dnsexternalalias)

## Egress rules
An egress configuration can define rules for outbound traffic from a Radix application.

[Guide](../guides/egress-config/#egress) - [Radix config reference](../references/reference-radix-config/#egress)

## Enable/disable components
Components can be enabled or disabled for all or only certain environments.

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

[Guide](../guides/configure-jobs/#job-scheduler) - [Radix config reference](../references/reference-radix-config/#jobs)

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

[Guide](../guides/monitoring/#monitoring-your-app) - [Doc](../docs/topic-monitoring/) - [Radix config reference](../references/reference-radix-config/#monitoring) and [config reference](../references/reference-radix-config/#monitoringconfig)

## Sub-pipelines (Tekton)
After "Build components" step (if it does not exist - after "Prepare pipeline" step), the step "Run sub-pipeline" runs optional sub-pipeline. Using the Tekton CI/CD framework.

[Doc](../docs/topic-concepts/#sub-pipeline) [Guide](../guides/sub-pipeline/) - [Tekton documentation](https://tekton.dev/docs/pipelines/pipelines/)

## Pipeline status badges
A pipeline status badge shows the status of the latest pipeline job of a specific type in a specific environment. Status is one of success, failing, stopped, pending or running.

[Guide](../guides/pipeline-badge/#configure-pipeline-badges)
## Private container image repositories
When using a Deploy only strategy, a private image is often used.

[Guide](../guides/deploy-only/#the-radixconfig-yaml-file) - [Radix config reference](../references/reference-radix-config/#privateimagehubs)

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
Radix aims to support zero downtime application re-deployment by utilising Kubernetes' rolling update and readiness probe features.

[Doc](../docs/topic-rollingupdate/#rolling-updates)

## Runtime secrets
Secrets are made available to components as environment variables

[Doc](../docs/topic-concepts/#secret)

## Git Submodules
Submodules is a native git feature which enables git repositories within other git repositories.

[Guide](../guides/git-submodules/)

## Vulnerability scanning


## Web console (dashboard)



