---
title: Releases
---

# Radix Releases

## 2021

### 16.06.2021 Pipeline job status badges

We have added support for generating badges that shows the status of the latest Radix pipeline job for a specific job type, environment and application.
A common place to add a status badge is in the README.md file of your repository, but it can be added to any web page you'd like.  

Read more here <https://www.radix.equinor.com/guides/pipeline-badge/>

### 07.06.2021 Support for ClientCertificate authentication

We have added support for ClientCertificates, which can be configured on a component or a specific environment.  

Read more here <https://www.radix.equinor.com/docs/reference-radix-config/#clientcertificate>

### 19.04.2021 Running on-demand jobs in Radix

A job is an on-demand and short lived container/process that performs a set of tasks, e.g. a ML training job or an ETL job, and exits when it is done.
The duration of a job can span from seconds to hours, depending on what tasks it performs, but it is expected to exit when it has completed the work.
Multiple jobs can be created and running simultaneously.  

CPU, GPU and memory resources requested by a job are reserved when it starts, and released when it exits. This will help reduce the total cost for an application since cost is only calculated for running containers.  

You define jobs in the radixconfig.yaml file in your repo, similar to how you define components.  

Jobs are started and monitored through a job-scheduler web API, created by Radix for each job defined in radixconfig.yaml
The OpenAPI/Swagger definition for the job-scheduler can be downloaded here, and you can use <https://github.com/OpenAPITools/openapi-generator> to generate clients for your preferred language.  

Read more about jobs here <https://www.radix.equinor.com/guides/configure-jobs/>

### 22.03.2021 Regenerate webhook secret and deploy key

To support the lifecycle managment of application, it is now possible to update the webhook secret and the deploy key for the integration from Radix to the GitHub repo.  

To get a brand new secret and key use the "Regenerate deploy key and webhook secret" button in the application configuration area in the Radix Web Console.

### 13.01.2021 - Radix Web Console - Indication of outdated image

You will now be alerted at the application page if there is anything wrong with the running components on your application. A warning icon will now be present on the environment card on the application page if any of the active components are failing.  

The icon is a small exclamation mark next to the component name. To get more information on what is wrong you can hover over the icon. There is also a new warning label stating 'Outdated image' on the environments page under 'Active components'.  
This label will appear when your running component is using an old image and typically happens when the latest deployment causes the new component to be unable to start, or the readiness probe is unable to reach it.  

> Note: In the transition right after a deployment, the Outdated image  label will appear. Once the new replicas have started this will be replaced with the Ok  label.  

### 12.01.2021 - Radix Web Console - Events available

Kubernetes events related to application environments now are displayed in the environment page, below Previous deployments.  

These events can be helpful when diagnosing application issues, e.g. recurring crashes/restarts or incorrect port configurations.  

Events are sorted descending by the time the event occurred. There are two types of events; Normal and Warning.  

- Normal events are informational messages related to resources in the application environment, e.g. creating, starting, stopping and deleting containers, pulling images, syncing ingresses etc.
Warning events are logged when there is a problem with a resource in the application environment,
eg. backoff (container crashing/restarting), readiness probe failure (container not listening on defined port), missing secrets etc.  
- Warnings are usually related to issues with containers running in pods.
If/when the cause of a pod related warning is resolved, e.g. the readiness probe receives a response on the defined port or a crashed container restarts, the warning will be flagged as Resolved. Warnings that reference pods from an old deployment will be flagged as Obsolete.
See the attached image for an example of Warning events with Resolved and Obsolete state.
Events older than one hour are delete from the list. A Warning event will remain in the list as long as it is not Resolved or Obsolete.

## 2020

### 16.12.2020 - Support for mounting external storage in app containers

We have added support for mounting Blob Containers from Azure Storage Accounts to applications hosted in Radix.
The current implementation uses the Blobfuse FlexVolume Driver.  
This driver will most likely be replaced by the Blob CSI Driver, which was in preview when development started.
Blob storage is available in both Radix Playground and Radix Platform.  

[External storage configuration](../../guides/volume-mounts/)