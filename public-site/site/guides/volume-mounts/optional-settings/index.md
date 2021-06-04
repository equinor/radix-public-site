---
title: VolumeMounts
layout: document
parent: ["Docs", "../../../docs.html"]
toc: true
---
## [Main settings](../../../docs/reference-radix-config/#volumemounts)

## Optional settings:
_Applicable for type: `azure-blob`_

* `accessMode` - [access mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) from container to external storage:
    * `ReadOnlyMany` - (default) read-only access.
    * `ReadWriteOnce` - read-write access. Write access allowed from multiple containers, running within one node.
    * `ReadWriteMany` - read-write access. Write access allowed from multiple containers, running on different nodes. Warning: this mode is potentially destructive, it may lead to [data corruption](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/limitations.md) in some cases.
* `bindingMode` - [binding mode](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode) from container to external storage (required valid `StorageAccountKey` and `StorageAccountName` to be set in `secrets`):
    * `Immediate` - (default) volume mounted on node immediately after deployment.
    * `WaitForFirstConsumer` - volume mounted when component replica gets running.
* `skuName` - [SKU Type](https://docs.microsoft.com/en-us/rest/api/storagerp/srp_sku_types) of Azure storage. Supported types:
    * `Standard_LRS` (default)
    * `Premium_LRS`
    * `Standard_GRS`
    * `Standard_RAGRS`
* `requestsStorage` - [requested size](https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/#create-a-persistentvolumeclaim) of allocated mounted volume. Default value is set to `"1Mi"` (1 megabyte). Current version of the driver does not affect mounted volume size of type `azure-blob`
* `uid` - User ID (number) of a [mounted volume owner](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#podsecuritycontext-v1-core). It is a Group ID of a user in the running container within component replicas. Usually a user, which is a member of one or multiple [groups](https://en.wikipedia.org/wiki/Group_identifier), is specified in the `Dockerfile` for the component with command `USER`. Read [more details](https://www.radix.equinor.com/docs/topic-docker/#running-as-non-root) about specifying user within `Dockerfile`. It is recommended to use because Blobfuse driver do [not honor fsGroup securityContext settings](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/driver-parameters.md). This option can be used instead of the option `gid`.

Volume setting [ReclaimPolice](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaiming) is always set to `Retain` for type `azure-blob`.

Blob CSI driver [has certain limitations](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/limitations.md).

> See [this](index.md) guide on how make use of `volumeMounts`.
