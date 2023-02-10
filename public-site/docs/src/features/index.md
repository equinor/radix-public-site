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

[Radix config](../references/reference-radix-config/#dnsappalias)

## External alias (byo DNS certificate)

[Guide](../guides/external-alias/) - [Radix config](../references/reference-radix-config/#dnsexternalalias)

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


## Job scheduler


## Job batches


## Jobs


## Kubernetes Cluster node autoscaling


## Monorepo


## Monitoring and metrics


## Sub-pipelines (Tekton)


## Pipeline status badges


## Private container image repositories


## Probes, monitoring container liveness


## Resource request and limits


## Rolling updates


## Runtime secrets


## Git Submodules


## Volume mounts


## Vulnerability scanning


## Web console (dashboard)



