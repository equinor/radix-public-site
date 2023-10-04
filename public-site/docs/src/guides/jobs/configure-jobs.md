---
title: Configuring Jobs
prev: .
next: job-manager-and-job-api
---

# Configuring Jobs

Jobs are configured in [`radixconfig.yaml`](../../references/reference-radix-config/#jobs), similar to how components are configured.

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
      notifications:
        webhook: http://api:8080/monitor-batch-status
      resources:
        requests:
          memory: "256Mi"
          cpu: "400m"
        limits:
          memory: "384Mi"
          cpu: "500m"
      node:
        gpu: nvidia-k80
        gpuCount: 2
```

They share many of the same configuration options with a few exceptions.

A job does not have `publicPort`, `ingressConfiguration`, `replicas`, `horizontalScaling` and `alwaysPullImageOnDeploy`

- `publicPort` and `ingressConfiguration` controls exposure of component to the Internet. Jobs cannot be exposed to the Internet, so these options are not applicable.
- `replicas` and `hortizontalScaling` controls how many containers of a Docker image a component should run. A job has always one replica.
- `alwaysPullImageOnDeploy` is used by Radix to restart components that use static Docker image tags, and pulling the newest image if the SHA has changed. Jobs will always pull and check the SHA of the cached image with the SHA of the source image.

Jobs have three extra configuration options; `schedulerPort`, `payload` and `timeLimitSeconds`

- `schedulerPort` (required) defines the port of job-scheduler's endpoint.
- `payload` (optional) defines the directory in the job container where the payload received by the job-scheduler is mounted.
- `resources` (optional) defines cpu and memory requested for a job.
- `node` (optional) defines gpu node requested for a job.
- `timeLimitSeconds` (optional) defines maximum running time for a job.
- `backoffLimit` (optional) defines the number of times a job will be restarted if its container exits in error.
- `notifications.webhook` (optional) the Radix application component or job component endpoint, where Radix batch events will be posted when any of its job-component's running jobs or batches changes states.

### schedulerPort

In the [`radixconfig.yaml`](../../references/reference-radix-config/#schedulerport) example above, two jobs are defined: `compute` and `etl`.

`compute` has `schedulerPort` set to 8000, and Radix will create a job-scheduler service named compute that listens for HTTP requests on port 8000. The URL for the compute job-scheduler is `http://compute:8000`

The job-scheduler for the `etl` job listens for HTTP requests on port 9000, and the URL is `http://etl:9000`

### payload

Arguments required by a job is sent in the request body to the job-scheduler as a JSON document with an element named `payload`.
The content of the payload is then mounted in the job container as a file named `payload` in the directory specified in `payload.path` in [`radixconfig.yaml`](../../references/reference-radix-config/#payload).
The data type of the `payload` value is string, and it can therefore contain any type of data (text, json, binary) as long as you encode it as a string, e.g. base64, when sending it to the job-scheduler, and decoding it when reading it from the mounted file inside the job container. The max size of the payload is 1MB.

The compute job in the example above has `payload.path` set to `/compute/args`. Any payload, send to the compute job-scheduler, will available inside the job container in the file `/compute/args/payload`

### resources

The resource requirement for a job can be sent in the request body to the job scheduler as a JSON document with an element named `resources`.
The content of the resources will be used to set the resource definition for the job [`radixconfig.yaml`](../../references/reference-radix-config/#resources-common).
The data type of the `resources` is of type `ResourceRequirements` an requires this specific format.

The etl job in the example above has `resource` configured.

### node

The node requirerement for a job can be sent in the request body to the job scheduler as a JSON document with an element named `node`.
The content of the node will be used to set the node definition for the job [`radixconfig.yaml`](../../references/reference-radix-config/#node).
The data type of the `node` is of type `RadixNode` an requires this specific format.

The etl job in the example above has `node` configured.

### timeLimitSeconds

The maximum running time for a job can be sent in the request body to the job scheduler as a JSON document with an element named `timeLimitSeconds`.

The etl job in the example above has `timeLimitSeconds` configured in its [`radixconfig.yaml`](../../references/reference-radix-config/#timelimitseconds). If a new job is sent to the job scheduler without an element `timeLimitSeconds`, it will default to the value specified in radixconfig.yaml. If no value is specified in radixconfig.yaml, it will default to 43200 (12 hours).

### backoffLimit

The maximum number of restarts if the job fails can be sent in the request body to the job scheduler as a JSON document with an element named `backoffLimit`.

The etl job in the example above has `backoffLimit` configured in its [`radixconfig.yaml`](../../references/reference-radix-config/#backofflimit). If a new job is sent to the job scheduler without an element `backoffLimit`, it will default to the value specified in radixconfig.yaml.
