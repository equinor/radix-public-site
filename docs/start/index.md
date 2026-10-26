---
title: What is Radix
displayed_sidebar: gettingStartedSidebar
---

# What is Radix

Radix is a Platform-as-a-Service ("PaaS", if you like buzzwords). It builds, deploys, and monitors applications, automating the boring stuff and letting developers focus on code. Applications run in  ☁️ the cloud as 🐳 Docker containers, in environments that you define.

:::warning Warning
Radix does **not** automatically authenticate users or control what they can access. If your application has a [public port](../radix-config/index.md#publicport), it can be accessed from **all** public IP addresses, unless you configure protection. Your team is responsible for authenticating users (confirming who they are) and deciding what they can see or do. Radix provides a configurable authentication component, but it doesn’t secure your application automatically. Follow your organization’s information management guidelines, and read the [authentication guide](https://www.radix.equinor.com/guides/authentication/) to learn more.
:::

You can use Radix just to run code, but the main functionality is to integrate with a code repository so that it can continuously build, test, and deploy applications. For instance, Radix can react to a `git push` event, automatically start a new build, and push it to the `test` environment, ready to be tested by users.

:::tip
To help improve Radix poke around in our **open sourced** repositories. We track **issues and feature requests** in the [radix](https://github.com/equinor/radix-internal/issues) repo. Please log those! 🙂
:::

## Hosting/Infrastructure

In Radix we advocate [Infrastructure as code](https://en.wikipedia.org/wiki/Infrastructure_as_code) and more specifically declarative infrastructure. This is done through the 📖 [`radixconfig.yaml`](../radix-config/index.md) file where you define how you would like your application to be hosted.

Radix is built on top of Kubernetes ☸️ hosted on Azure as a service (AKS). Knowledge around Kubernetes is NOT required for using Radix. However thoughts from Kubernetes has influenced Radix, so it can be a good with some basic understanding of what it is. VMware has a 5min video on [youtube](https://www.youtube.com/watch?v=PH-2FfFD2PU), or for those more interested we can recommend [Introduction to Kubernetes](https://training.linuxfoundation.org/resources/free-courses/introduction-to-kubernetes/) course by linuxfoundation.

:::tip Fun fact ☝️
Kubernetes originates from the Greek language, meaning helmsman or pilot. You'll sometimes see Kubernetes referred to as K8s, 8 for the number of letters between the K and S.
:::

## CI / CD

Radix provide a simple way to automatically build and deploy (continuous integration/continuous deployment ♾️ - [ci/cd](https://en.wikipedia.org/wiki/CI/CD)  your application based on the 📖 [`radixconfig.yaml`](../radix-config/index.md) file already mentioned. Alternatively, you can opt for using only the CD part of Radix. Teams that have a need for more advanced CI feature can use other CI tools and [deploy into Radix](../guides/deploy-only/index.md).

## Monitoring

Radix also provides monitoring for applications. There are default 📈 metrics (e.g. request latency, failure rate), but you can also output custom metrics from your code. Track things that are important for your application: uploaded file size, number of results found, or user preferences. Radix collects and monitors the data.

General information around [monitoring in Radix](../guides/monitoring/index.md) in Radix guides. When you work with an application, link to a basic monitoring dashboard is available on your apps first page.
