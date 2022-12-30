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

## Backup
Application configuration is backed up every hour using Velero and that backup is stored in the Azure Storage account.

## Auto build and/or deploy on GitHub commit
Continuous integration/deployment (CI/CD), using the Webhook, and secured by deploy key

[Doc](../docs/topic-concepts/#continuous-integration-and-deployment) - [Guide](../guides/build-and-deploy/#build-and-deploy)


## Build and deploy pipeline

[Guide](../guides/build-and-deploy/#build-and-deploy)

## Deploy only pipeline

[Guide](../guides/deploy-only/#deploy-to-radix-using-other-continuous-integration-ci-tool) - [Radix config](../guides/deploy-only/#the-radixconfig-yaml-file)

### Machine User token

[Guide](..guides/deploy-only/#machine-user-token)

## Promote pipeline

### Rollback to any version (as part of Promote)


## Build secrets


## Certificates, SSL certificates


## Component stop/start/restart


## Command Line (Radix CLI)


## Container logs in Radix console and Radix CLI


## Cost calculation


## DNS aliases


## External alias (byo DNS certificate)


## Egress rules


## Enable/disable components
Components can be enabled or disabled for all or only certain environment(s).

[Guide](../guides/enable-and-disable-components/) - 
[Radix config reference](../references/reference-radix-config/#enabled)

## Environment variables


## Multiple environments


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



