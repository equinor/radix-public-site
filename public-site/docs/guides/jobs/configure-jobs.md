---
title: Configuring Jobs
prev: .
next: job-manager-and-job-api
---

## Job configuration

Jobs are configured in [`radixconfig.yaml`](/radix-config/index.md#jobs), similar to how components are configured.

```yaml
spec:
  environments:
    - name: dev
    - name: prod
  components:
    - name: backend
      ...
  jobs:
    - name: compute
      src: compute
      schedulerPort: 8000
      payload:
        path: "/compute/args"
      ports:
        - name: http
          port: 3000
    - name: etl
      src: etl
      schedulerPort: 9000
      timeLimitSeconds: 100
      backoffLimit: 5
      failurePolicy:
        rules:
          - action: FailJob
            onExitCodes:
              operator: In
              values: [42]
      notifications:
        webhook: http://api:8080/monitor-batch-status
      resources:
        requests:
          memory: "256Mi"
          cpu: "400m"
        limits:
          cpu: "500m"
      node:
        gpu: nvidia-k80
        gpuCount: 2
      batchStatusRules:
        - condition: Any
          operator: In
          jobStatuses:
            - Failed
          batchStatus: Failed
```