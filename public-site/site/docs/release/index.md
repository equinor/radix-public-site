---
title: Releases
layout: document
parent: ['Community', '../../community.html']
toc: true
---

# Radix Releases

## 2021

### 13.01.2021 - Radix Web Console - Indication of outdated image

You will now be alerted at the application page if there is anything wrong with the running components on your application. A warning icon will now be present on the environment card on the application page if any of the active components are failing. 
The icon is a small exclamation mark next to the component name. To get more information on what is wrong you can hover over the icon.
There is also a new warning label stating 'Outdated image' on the environments page under 'Active components'. 
This label will appear when your running component is using an old image and typically happens when the latest deployment causes the new component to be unable to start, or the readiness probe is unable to reach it.  
` Note: In the transition right after a deployment, the Outdated image  label will appear. Once the new replicas have started this will be replaced with the Ok  label.`

### 12.01.2021 - Radix Web Console - Events available

Kubernetes events related to application environments now are displayed in the environment page, below Previous deployments.  
These events can be helpful when diagnosing application issues, e.g. recurring crashes/restarts or incorrect port configurations.  
Events are sorted descending by the time the event occurred.  
There are two types of events; Normal and Warning.  
- Normal events are informational messages related to resources in the application environment, e.g. creating, starting, stopping and deleting containers, pulling images, syncing ingresses etc.
Warning events are logged when there is a problem with a resource in the application environment,
eg. backoff (container crashing/restarting), readiness probe failure (container not listening on defined port), missing secrets etc.
- Warnings are usually related to issues with containers running in pods.
If/when the cause of a pod related warning is resolved, e.g. the readiness probe receives a response on the defined port or a crashed container restarts, the warning will be flagged as Resolved. Warnings that reference pods from an old deployment will be flagged as Obsolete.
See the attached image for an example of Warning events with Resolved and Obsolete state.
Events older than one hour are delete from the list. A Warning event will remain in the list as long as it is not Resolved or Obsolete.

[External storage configuration](../../guides/volume-mounts/)


## 2020

### 16.12.2020 - Support for mounting external storage in app containers

We have added support for mounting Blob Containers from Azure Storage Accounts to applications hosted in Radix.
The current implementation uses the Blobfuse FlexVolume Driver.  
This driver will most likely be replaced by the Blob CSI Driver, which was in preview when development started.
Blob storage is available in both Radix Playground and Production.  

Configure external storage guide
