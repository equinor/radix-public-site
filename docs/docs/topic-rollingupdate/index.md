---
title: Rolling updates
---

# Rolling updates

Radix aims to support zero downtime application re-deployment by utilising Kubernetes' [rolling update](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/) and [readiness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/) features.

Rolling updates allow applications to be incrementally updated by specifying the following two parameters.

- Maximum number of pods that can be unavailable during an application update (currently set by Radix to 25% of the number of requested replicas)
- Maximum number of new pods that can be created during an application update (currently set by Radix to 25% of the number of requested replicas)

By using rolling updates, Radix makes sure that old pods are not deleted before new pods are created and in ready state.

## Readiness probe

Rolling updates ensure that the application is always available at pod level. However, as soon as new pods are in ready state, request traffic will be automatically re-routed to the new pods and the old pods are deleted. An issue that typically arises in this scenario is that the actual applications that run inside the containers in the new pods are not ready to receive traffic yet (e.g. still being bootstrapped), and thus, causing a short downtime.

Radix uses readiness probe to minimize this downtime as close to zero as possible, where TCP socket is utilized. Kubernetes will attempt to open a TCP socket to the application container on the port specified in `radixconfig.yaml` file according to the following two parameters.

:::tip
The probe will be used only when a Radix application component has at leas one port specified in the `radixconfig.yaml`
:::

- Initial delay seconds where Kubernetes will wait before performing the first probe after the container has started (currently set by Radix to 5 seconds)
- Period seconds interval where Kubernetes will perform the probes after the initial probe (currently set by Radix to 10 seconds)

## Pod lifecycle and Graceful termination

Your process receives the `SIGTERM` signal 30 seconds before being terminated. When you receive this signal, stop processing work and exit as soon as possible. This helps Kubernetes roll out new versions of your code without unnecessary delay.

By waiting a few seconds after `SIGTERM` is received before you stop accepting new requests, you can avoid terminating your clients' connections and requests mid-flight.

When a pod (replica) is scheduled for removal, its IP address is first removed from Kubernetes service discovery, and then a `SIGTERM` is sent. If the process is still running after 30 seconds, Kubernetes terminates it.

Our reverse proxy (currently Istio and Envoy) stops routing traffic to the pod as soon as possible after its address is removed, but this can take a few seconds when the cluster is under heavy load.
