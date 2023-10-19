---
title: VolumeMounts
---

## [Main settings](../../../references/reference-radix-config/#volumemounts)

## Optional settings

_Applicable for: `blobfuse2`_

- `accessMode` - [access mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) from container to external storage:
  - `ReadOnlyMany` - (default) read-only access.
  - `ReadWriteOnce` - read-write access. Write access allowed from multiple containers, running within one node.
  - `ReadWriteMany` - read-write access. Write access allowed from multiple containers, running on different nodes. Warning: this mode is potentially destructive, it may lead to [data corruption](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/limitations.md) in some cases.
- `bindingMode` - [binding mode](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode) from container to external storage (required valid `StorageAccountKey` and `StorageAccountName` to be set in `secrets`):
  - `Immediate` - (default) volume mounted on node immediately after deployment.
  - `WaitForFirstConsumer` - volume mounted when component replica gets running.
- `skuName` - [SKU Type](https://docs.microsoft.com/en-us/rest/api/storagerp/srp_sku_types) of Azure storage. Supported types:
  - `Standard_LRS` (default)
  - `Premium_LRS`
  - `Standard_GRS`
  - `Standard_RAGRS`
- `requestsStorage` - [requested size](https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/#create-a-persistentvolumeclaim) of allocated mounted volume. Default value is set to `"1Mi"` (1 megabyte). Current version of the driver does not affect mounted volume size of type `azure-blob`

  _Options for `streaming`_
   - `blockSize` - size of each block to be cached in memory (in MB)
   - `maxBuffers` - total number of buffers to be cached in memory (in MB)
   - `bufferSize` - size of each buffer to be cached in memory (in MB)
   - `streamCache` - limit total amount of data being cached in memory to conserve memory footprint of blobfuse (in MB)
   - `maxBlocksPerFile` - maximum number of blocks to be cached in memory

   For streaming during read and write operations, blocks of data are cached in memory as
     they're read or updated. Updates are flushed to Azure Storage when a file is closed or
     when the buffer is filled with dirty blocks.
     
   More details about streaming can be found [here](https://learn.microsoft.com/en-us/azure/storage/blobs/blobfuse2-what-is#streaming)

Volume setting [ReclaimPolice](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaiming) is always set to `Retain` for type `azure-blob`.

Blob CSI driver [has certain limitations](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/limitations.md). BlobFuse2 particularly has [these limitations](https://github.com/Azure/azure-storage-fuse#un-supported-file-system-operations).

> See [this](../index.md) guide on how make use of `volumeMounts`.
