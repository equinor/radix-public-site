---
title: Radix clusters
---
# The Radix clusters

Your application(s) will run in a *Kubernetes cluster*. Radix currently have three clusters: **Platform (North Europe)**, **Platform 2 (West Europe)** and **Playground**. Use Playground for testing Radix and see if it's a good fit for your needs. When your project and team are happy with Radix, you should register your application to one of the **Platform** clusters, which provides [specific guarantees](/docs/topic-uptime/).

| Cluster                      | Azure Region | DNS Zone                     | Web Console                                          | Radix API (Swagger UI)                                      |
| ---------------------------- | -------------| ---------------------------- | :--------------------------------------------------: | :---------------------------------------------------------: |
| **Platform (North Europe)**  | North Europe | radix.equinor.com            | [Link](https://console.radix.equinor.com)            | [Link](https://api.radix.equinor.com/swaggerui/)            |
| **Platform 2 (West Europe)** | West Europe  | c2.radix.equinor.com         | [Link](https://console.c2.radix.equinor.com)         | [Link](https://api.c2.radix.equinor.com/swaggerui/)         |
| **Playground**               | North Europe | playground.radix.equinor.com | [Link](https://console.playground.radix.equinor.com) | [Link](https://api.playground.radix.equinor.com/swaggerui/) |


:::info Moving applications between clusters

Currently, there is no automated process of moving an application between clusters. To move an application, you must manually register it in the new cluster, run pipeline jobs to deploy the application, and reconfigure any secrets, workload identities, external DNS entries etc.

:::