---
title: Azure Storage Account
---

Radix supports mounting [Azure storage account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview) blob containers with the [`blobFuse2`](../../radix-config/index.md#blobfuse2) volume type in [`radixconfig.yaml`](../../radix-config/index.md), using the [blob-csi-driver](https://github.com/kubernetes-sigs/blob-csi-driver/).

## General Settings

The only required settings in a `blobFuse2` configuration are `container` and `useAdsl`. `container` defines the name of the container in the Azure storage account to mount into `path`, and `useAdls` is a flag that defines if the storage account is [hierarchical namespace](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-namespace) enabled or not.

``` yaml
volumeMounts:
- name: myimages
    path: /mnt/files
    blobFuse2:
      container: images
      useAdls: true
```

With this minimal configuration, the **videos** container is mounted **read only** into **/mnt/files**, using [Access Keys](#access-keys) as the authentication method, and [Block](#block-cache) as `cacheMode`. The two screenshots below shows where to find container names and if hierarchical namespace is enabled or disabled.

![Azure storage account container name](azure-storage-account-container.png)

![Azure storage account hierarcical namespace](hns-enabled-storage-account.png)

`accessMode` specifies if the volume is mounted in **read-only** (default) or **read-write** mode. Valid values are:
- `ReadOnlyMany` (default) - Volume is mounted read-only.
- `ReadWriteMany` - Volume is mounted with read-write access. Warning: This option can lead to data corruption if multiple replicas write to the same file. Read [this](limitations.md) for more information.

`uid` and `gid` specifies the owning user and group for the files and directories in the mounted volume. It is optional to configure these settings, since the current version of the driver does not honor user and group ownership.

## Authentication

The **blob-csi-driver** will use access key as credentials when accessing an Azure storage account. The access key can be set manually in [Radix Web Console](https://console.radix.equinor.com/), or it can be read by the driver using [Azure workload identity](https://www.radix.equinor.com/guides/workload-identity/#configure-workload-identity-in-radix) when `useAzureIdentity` is set to `true`.

### Access Keys

When `useAzureIdentity` is omitted or set to `false`, the access key and the name of the Azure storage account must be set manually, either on the component/job page in Radix Web Console, or with [Radix CLI](../../docs/topic-radix-cli/). Component replicas will be in **Pending** state until both secrets are set.

![Set account name and key](set-account-key-and-name.png)

Values for these secrets can be found under **Access keys** in the Azure storage account.

![Get account name and key](azure-storage-account-name-and-key.png)

The name of the Azure storage account can also be specified in the `storageAccount` field in [`radixconfig.yaml`](../../radix-config/index.md), in which only the access key must be set i Radix Web Console.

``` yaml
volumeMounts:
- name: myimages
    path: /mnt/files
    blobFuse2:
      container: images
      useAdls: true
      storageAccount: mystorageaccount # replace with real storage account name
```

![Set account name only](set-account-key-only.png)

### Azure Workload Identity

When `useAzureIdentity` is set to `true`, the driver will connect to the Azure storage account using the [Azure Workload Identity](../workload-identity/#configure-workload-identity-in-radix) configured for the compopnent or job, to acquire an access key to be used when accessing data in a blob container.

For the driver to successfully acquire an access key, the service principal configured in `identity.azure.clientId` must be granted the [**Microsoft.Storage/storageAccounts/listkeys/action**](https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-data-operations-portal#use-the-account-access-key) permission on the Azure storage account.

The following `blobFuse2` settings are required, and is used by the driver when acquiring an access key.
- `storageAccount` - Name of the Azure storage account.
- `resourceGroup` - Name of the resource group for the storage account.
- `subscriptionId` - ID of the subscription for the storage account.

Example configuration:
```yaml
volumeMounts:
- name: myimages
    path: /mnt/files
    blobFuse2:
      container: images
      useAdls: true
      storageAccount: mystorageaccount # replace with real storage account name
      resourceGroup: myresourcegroup # replace with real resource group name
      subscriptionId: ffffffff-ffff-ffff-ffff-ffffffffffff # replace with real subscription ID
```

## Cache Modes

Caching improves subsequent access times, and can reduce ingress and egress traffic to the Azure storage account, which in turn can lower cost related to data transfer.

`cacheMode` defines how data should be cached:
- `Block` (default) - Improve performance for operations on large files by reading/writing blocks instead of entire files.
- `File` (default) - Cache entire files for improved subsequent access.
- `DirectIO` (default) - Disables caching.

### Block Cache

Block caching can improve access times and reduce cost related to ingress and egress traffic for the Azure storage account.

With block cache, the driver reads and writes fixed size blocks of data, defined by `blockSize` (default 4MB), instead of the entire file. Blocks are cached in a driver specific memory pool, defined by `poolSize` (default 48MB), and in the Linux kernel cache, on the node where the replica is running. The driver also automatically reads consecutive blocks, defined by `prefetchCount` (default 11), from the current position of the file. `prefetchOnOpen` controls if prefetching should start when the file is opened, or wait for the first read. Data operations are performed in parallel, defined by `parallelism` (8 threads by default).

Every time a file is opened, the driver will send a request to the Azure storage account to read attribute data (Size, Modified) for the file. If a change is detected, the driver will invalidate the cache and fetch data from the Azure storage account instead.

The driver also supports using disk a cache from data blocks. This cache has its own timeout defined by `diskTimeout`. Disk caching is disabled by default, and must be enabled by setting `diskSize` (in MB) to the desired disk cache size.

The following settings are available to fine-tune block cache. The example includes the default values:
```yaml
volumeMounts:
- name: myimages
    path: /mnt/files
    blobFuse2:
      container: images
      cacheMode: Block
      blockCache:
        blockSize: 4 # Size in MB
        poolSize: 48 # Size in MB
        prefetchCount: 11
        prefetchOnOpen: false
        parallelism: 8
        diskSize: 0 # Size in MB
        diskTimeout: 120 # Seconds
```

`blockSize` defines the size of a block to be downloaded as a unit from the Azure storage account. Increasing this value can improved the transfer rate when reading large files.

The following table lists the transfer rate when reading a 3GB file with different values of `blockSize`:
| Block Size  | Transfer Rate |
| ----------: | ------------: |
| 4           | 220 MB/s      |
| 8           | 350 MB/s      |
| 16          | 440 MB/s      |

`poolSize` defines the total size of the memory pool that the driver will use for caching data blocks. The default value is set to `blockSize` + `prefetchCount` * `blockSize`, which is the minimum allowed value. If set to a lower value, Radix will automatically adjust it at runtime.

`prefetchCount` defines how many blocks the driver will prefetch at max when sequential reads are in progress. Prefetching can be disabled by setting the value to `0`. Otherwise the value must be `11` (default) or higher. When only small parts of a large file needs to be read, it can be beneficial to disable prefetching to reduced network traffic from the Azure storage account.

Disk caching, enabled when `diskSize` is set, stores data blocks as files on disk, and is used by the driver when the requested file data is not in the memory pool or in the kernel cache. `diskTimeout` defines how long unused disk cache entries belonging to a file will be stored on disk before they are deleted.

### File Cache



### Direct IO

`DirectIO` disables caching. All operations are sent directly to the storage account.

## Attribute Cache

## Deprecated Options

The `streaming` section in `blobFuse2` is deprecated in favor of `cacheMode`. To prevent breaking changes to existing configurations, Radix will implicitly use [File](#file-cache) as `cacheMode` when `streaming.enabled` is set to `false`, and [Block](#block-cache) when `streaming.enabled` is set to `true`. The `streaming` section is ignored when `cacheMode` is set.

`streaming` will be removed in a future release, and it is therefore recommended to migrate to use `cacheMode` instead.

Replace implicit **File** cache:
```yaml
volumeMounts:
- name: myimages
    path: /mnt/files
    blobFuse2:
      <...>
      streaming:
        enabled: false
```

with:
```yaml
volumeMounts:
- name: myimages
    path: /mnt/files
    blobFuse2:
      <...>
      cacheMode: File
```

Replace implicit **Block** cache:
```yaml
volumeMounts:
- name: myimages
    path: /mnt/files
    blobFuse2:
      <...>
      streaming:
        enabled: true
```

with:
```yaml
volumeMounts:
- name: myimages
    path: /mnt/files
    blobFuse2:
      <...>
      cacheMode: Block
```