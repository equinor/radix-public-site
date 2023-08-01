---
title: Environment variables
---

# Environment variables in jobs

In addition to [variables defined in `radixconfig.yaml`](../../references/reference-radix-config/#variables), Radix will automatically set the following variables

- `RADIX_JOB_NAME`: The instance name of the job (e.g. "batch-compute-20230220101417-idwsxncs-rkwaibwe")
- `RADIX_APP`: The name of the Radix application
- `RADIX_CLUSTERNAME`: The canonical name of the Radix cluster (e.g. "prod-8")
- `RADIX_CLUSTER_TYPE`: The type of cluster ("production", "playground", "development")
- `RADIX_COMPONENT`: Name of the current component
- `RADIX_CONTAINER_REGISTRY`: Container image registry where component images are downloaded from
- `RADIX_DNS_ZONE`: Cluster DNS zone (e.g. _`radix.equinor.com`_)
- `RADIX_ENVIRONMENT`: The application's current environment
- `RADIX_GIT_COMMIT_HASH`: Git commit hash of source code from which current deployment was built. Only applicable for deployments with one or more container images built by Radix pipeline.
- `RADIX_GIT_TAGS`: Space-separated list of git tags which point to `$RADIX_GIT_COMMIT_HASH` at the time of container image build.
- `RADIX_PORTS`: Space-separated list of open ports, enclosed in parentheses. E.g. (8888) and (8888 8889)
- `RADIX_PORT_NAMES`: List of open ports (names; only if set)
