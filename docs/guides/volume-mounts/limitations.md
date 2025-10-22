---
title: Limitations / Known Issues
---

## Block Cache

- Concurrent write operations to the same file from multiple handles in the same replica, or from different replicas, may lead to data corruption.
- In write operations, data is persisted to the Azure storage account only when close, sync or flush is called.
- Cached data blocks are not refreshed when the file size remains unchanged after a write operation by another process.

## File Cache

- Ensure that [Attribute Cache](./index.md#attribute-cache) is disabled when using file cache, as an issue/bug with the driver prevents eviction of cached data when the file is opened more frequently than the defined `timeout`.