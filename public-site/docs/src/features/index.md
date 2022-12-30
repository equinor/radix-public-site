---
title: Features
---

# Features in Omnia Radix

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

## Build secrets


## Environment variables

## Enable/disable components
Components can be enabled or disabled for all or only certain environment(s).

[Guide](../guides/enable-and-disable-components/) - 
[Radix config reference](../references/reference-radix-config/#enabled)

## Component stop/start/restart


## External alias (byo DNS certificate)


## Job scheduler


## Job batches


## Jobs


## Deploy only pipeline


## Build and deploy pipeline


## Promote pipeline


## Sub-pipelines (Tekton)


## Monorepo


## Monitoring and metrics


## Resource request and limits


## Egress rules


## Git Submodules


## Pipeline status badges


## Alerting and notification


## Volume mounts


## Vulnerability scanning


## DNS aliases


## Radix cost calculation


## Rolling updates

## Radix CLI


## Radix web console (dashboard)


## Grafana monitoring, custom metrics


## Multiple environments


## Auto build and/or deploy on GitHub commit


## Private container image repositories


## Azure Federated identity credentials


## Runtime secrets


## Horizontal autoscaling


## Cluster node autoscaling


## Backup


## Rollback to any version (as part of Promote)


## Radix console and Radix CLI provided container logs


## SSL certificates


## Probes, monitoring container liveness

