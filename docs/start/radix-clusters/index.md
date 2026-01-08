---
title: Radix clusters
---
# The Radix clusters

Your application(s) will run in a *Kubernetes cluster*. Radix currently have three clusters: **Platform (North Europe)**, **Platform 2 (West Europe)** and **Playground**. Use Playground for testing Radix and see if it's a good fit for your needs. When your project and team are happy with Radix, you should register your application to one of the **Platform** clusters, which provides [specific guarantees](../uptime/index.md).

| Cluster                      | Azure Region | DNS Zone                     |                      Radix API (Swagger UI)                    |
| ---------------------------- | ------------ | ---------------------------- | :-----------------------------------------------------: |
| **Platform (North Europe)**     | North Europe    |  radix.equinor.com      |  [Link](https://api.radix.equinor.com/swaggerui/)       |
| **Platform 2 (West Europe)**    | West Europe     | c2.radix.equinor.com    |  [Link](https://api.c2.radix.equinor.com/swaggerui/)     |
| **Platform 3 (Sweden Central)** | Sweden Central  | c2.radix.equinor.com    |  [Link](https://api.c3.radix.equinor.com/swaggerui/)     |
| **Playground**                  | North Europe    | playground.radix.equinor.com | [Link](https://api.playground.radix.equinor.com/swaggerui/) |


:::info Moving applications between clusters
Currently, there is no automated process of moving an application between clusters. To move an application, you must manually register it in the new cluster. We have provided a suggested checklist below.
:::

### Move an Application between Radix Clusters

#### Register the Application

- [ ] Create the application in the target Radix cluster using radix-cli or Radix Web Console
- [ ] Ensure the radixconfig.yaml is correct and uploaded

#### Run Initial Build/Deploy Pipeline

- [ ] Trigger a CI/CD pipeline to build and deploy all environments (dev, QA, prod)
- [ ] Validate that images are built and components are available in Web Console

#### Update Workload Identity

- [ ] Configure App Registration or Managed Identity for the new cluster
- [ ] Update workload identity settings in Azure AD

#### Update Environment Variables & Secrets

- [ ] Recreate secrets in the Web Console (Radix does not migrate secrets automatically)
- [ ] Validate all environment variables match the old cluster setup

#### Update OAuth Configuration

- [ ] Adjust redirect URIs in App Registration for the new cluster endpoints
- [ ] Test authentication flows

#### Configure Private Links

- [ ] Set up new Private Endpoints for services that require secure connectivity
- [ ] Validate DNS resolution and connectivity

#### Set Up External DNS & Certificates

- [ ] Configure new External DNS records for the application
- [ ] Configure the automated certificate option

#### Update Firewall Settings

- [ ] Add new cluster IP ranges to any firewall rules
- [ ] Remove old cluster IPs once migration is complete

#### Test Everything

- [ ] Validate application functionality in all environments
- [ ] Check logs, integrations, and external dependencies

#### Switch Traffic & Decommission Old Cluster

- [ ] Update DNS or routing to point to the app in the new cluster
- [ ] Monitor for errors during cutover
- [ ] Remove the app from the old cluster once stable