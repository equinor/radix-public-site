---
title: Configuring Jobs
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

## Job Manager

The Job Manager, aka "job-scheduler", is a web API service, that you use to create, delete and monitor the state of jobs.
Radix creates one job-scheduler per job defined in [`radixconfig.yaml`](../../references/reference-radix-config/#jobs). A job-scheduler will listen to the port defined by `schedulerPort` and host name equal to the `name` of the job. The job-scheduler API can only be accessed by components running in the same environment, and it is not exposed to the Internet. No authentication is required.

The job-scheduler exposes the following methods for managing jobs

### Single job

- `POST /api/v1/jobs` Create a new job using the Docker image that Radix built for the job. Job-specific arguments can be sent in the request body

```json
{
  "payload": "Sk9CX1BBUkFNMTogeHl6Cg==",
  "timeLimitSeconds": 120,
  "backoffLimit": 10,
  "resources": {
    "limits": {
      "memory": "32Mi",
      "cpu": "300m"
    },
    "requests": {
      "memory": "16Mi",
      "cpu": "150m"
    }
  },
  "node": {
    "gpu": "gpu1, gpu2, gpu3",
    "gpuCount": "6"
  }
}
```

> `payload`, `timeLimitSeconds`, `backoffLimit`, `resources` and `node` are all optional fields and any of them can be omitted in the request.

- `GET /api/v1/jobs` Get states (with names and statuses) for all jobs
- `GET /api/v1/jobs/{jobName}` Get state for a named job
- `DELETE /api/v1/jobs/{jobName}` Delete a named job
- `POST /api/v1/jobs/{jobName}/stop` Stop a named job

### Batch of jobs

- `POST /api/v1/batches` Create a new batch of single jobs, using the Docker image, that Radix built for the job component. Job-specific arguments can be sent in the request body, specified individually for each item in `JobScheduleDescriptions`

```json
{
  "jobScheduleDescriptions": [
    {
      "payload": "{'data':'value1'}"
    },
    {
      "payload": "{'data':'value2'}"
    },
    {
      "payload": "{'data':'value3'}"
    }
  ]
}
```

> `payload`, `timeLimitSeconds`, `resources` and `node` are all optional fields and any of them can be omitted in the request.

- `GET /api/v1/batches` Get states (with names and statuses) for all batches
- `GET /api/v1/batches/{batchName}` Get state for a named batch and statuses of its jobs
- `DELETE /api/v1/batches/{batchName}` Delete a named batch
- `POST /api/v1/batches/{batchName}/stop` Stop a named batch
- `POST /api/v1/batches/{batchName}/jobs/{jobName}/stop` Stop a named job of a batch

## Starting a new job

The example configuration at the top has component named `backend` and two jobs, `compute` and `etl`. Radix creates two job-schedulers, one for each of the two jobs. The job-scheduler for `compute` listens to `http://compute:8000`, and job-scheduler for `etl` listens to `http://etl:9000`.

To start a new single job, send a `POST` request to `http://compute:8000/api/v1/jobs` with request body set to

```json
{
  "payload": "{\"x\": 10, \"y\": 20}"
}
```

The job-scheduler creates a new job and mounts the payload from the request body to a file named `payload` in the directory `/compute/args`.
Once the job has been created successfully, the `job-scheduler` responds to `backend` with a job state object

```json
{
  "name": "batch-compute-20230220101417-idwsxncs-rkwaibwe",
  "started": "",
  "ended": "",
  "status": "Running"
}
```

- `name` is the unique name for the job. This is the value to be used in the `GET /api/v1/jobs/{jobName}` and `DELETE /api/v1/jobs/{jobName}` methods. It is also the host name to connect to running job's container, with its exposed port, e.g. `http://batch-compute-20230220100755-xkoxce5g-mll3kxxh:3000`
- `started` is the date and time the job was started. It is represented in RFC3339 form and is in UTC.
- `ended` is the date and time the job successfully ended. Also represented in RFC3339 form and is in UTC. This value is only set for `Successful` jobs.
- `status` is the current status of the job container. Possible values are `Running`, `Successful` and `Failed`. Status is `Failed` if the container exits with a non-zero exit code, and `Successful` if the exit code is zero.

## Getting the status of all existing jobs

Get a list of all single jobs with their states by sending a `GET` request to `http://compute:8000/api/v1/jobs`. The response is an array of job state objects, similar to the response received when creating a new job. Jobs that have been started within a batch are not included in this list

```json
[
  {
    "name": "batch-compute-20230220100755-xkoxce5g-mll3kxxh",
    "started": "2021-04-07T09:08:37Z",
    "ended": "2021-04-07T09:08:45Z",
    "status": "Succeeded"
  },
  {
    "name": "batch-compute-20230220101417-idwsxncs-rkwaibwe",
    "started": "2021-04-07T10:55:56Z",
    "ended": "",
    "status": "Failed"
  }
]
```

To get state for a specific job (single or one within a batch), e.g. `batch-compute-20230220100755-xkoxce5g-mll3kxxh`, send a `GET` request to `http://compute:8000/api/v1/jobs/batch-compute-20230220100755-xkoxce5g-mll3kxxh`. The response is a single job state object

```json
{
  "name": "batch-compute-20230220100755-xkoxce5g-mll3kxxh",
  "started": "2021-04-07T09:08:37Z",
  "ended": "2021-04-07T09:08:45Z",
  "status": "Succeeded"
}
```

## Deleting an existing job

The job list in the example above has a job named `batch-compute-20230220101417-idwsxncs-rkwaibwe`. To delete it, send a `DELETE` request to `http://compute:8000/api/v1/jobs/batch-compute-20230220101417-idwsxncs-rkwaibwe`. A successful deletion will respond with result object. Only single job can be deleted with this method

```json
{
  "status": "Success",
  "message": "job batch-compute-20230220101417-idwsxncs-rkwaibwe successfully deleted",
  "code": 200
}
```

## Stop a job

The job list in the example above has a job named `batch-compute-20230220100755-xkoxce5g-mll3kxxh`. To stop it, send a `POST` request to `http://compute:8000/api/v1/jobs/batch-compute-20230220100755-xkoxce5g-mll3kxxh/stop`. A successful stop will respond with result object. Only single job can be stopped with this method. Stop of a job automatically deletes corresponding Kubernetes job and its replica, as well as its log. The job will get the status "Stopped".

```json
{
  "status": "Success",
  "message": "job batch-compute-20230220100755-xkoxce5g-mll3kxxh successfully stopped",
  "code": 200
}
```

```json
{
  "status": "Success",
  "message": "job batch-compute-20230220101417-idwsxncs-rkwaibwe successfully stopped",
  "code": 200
}
```

## Starting a new batch of jobs

To start a new batch of jobs, send a `POST` request to `http://compute:8000/api/v1/batches` with request body set to

```json
{
  "jobScheduleDescriptions": [
    {
      "payload": "{\"x\": 10, \"y\": 20}"
    },
    {
      "payload": "{\"x\": 20, \"y\": 30}"
    }
  ]
}
```

Jobs can have `jobId`

```json
{
  "jobScheduleDescriptions": [
    {
      "jobId": "job-1",
      "payload": "{\"x\": 10, \"y\": 20}"
    },
    {
      "jobId": "job-2",
      "payload": "{\"x\": 20, \"y\": 30}"
    }
  ]
}
```

Default parameters for jobs can be defined within `DefaultRadixJobComponentConfig`. These parameters can be overridden for each job individually in `JobScheduleDescriptions`

```json
{
  "defaultRadixJobComponentConfig": {
    "timeLimitSeconds": 200,
    "backoffLimit": 5,
    "resources": {
      "limits": {
        "memory": "200Mi",
        "cpu": "200m"
      },
      "requests": {
        "memory": "100Mi",
        "cpu": "100m"
      }
    }
  },
  "jobScheduleDescriptions": [
    {
      "payload": "{'data':'value1'}",
      "timeLimitSeconds": 120,
      "backoffLimit": 2,
      "resources": {
        "limits": {
          "memory": "32Mi",
          "cpu": "300m"
        },
        "requests": {
          "memory": "16Mi",
          "cpu": "150m"
        }
      },
      "node": {
        "gpu": "gpu1, gpu2, gpu3",
        "gpuCount": "6"
      }
    },
    {
      "payload": "{'data':'value2'}"
    },
    {
      "payload": "{'data':'value3'}",
      "timeLimitSeconds": 300,
      "backoffLimit": 10,
      "node": {
        "gpu": "gpu3",
        "gpuCount": "1"
      }
    }
  ]
}
```

The job-scheduler creates a new batch, which will create single jobs for each item in the `JobScheduleDescriptions`.
Once the batch has been created, the `job-scheduler` responds to `backend` with a batch state object

```json
{
  "batchName": "batch-compute-20220302170647-6ytkltvk",
  "name": "batch-compute-20220302170647-6ytkltvk-tlugvgs",
  "created": "2022-03-02T17:06:47+01:00",
  "status": "Running"
}
```

- `batchName` is the unique name for the batch. This is the value to be used in the `GET /api/v1/batches/{batchName}` and `DELETE /api/v1/batches/{batchName}` methods.
- `started` is the date and time the batch was started. The value is represented in RFC3339 form and is in UTC.
- `ended` is the date and time the batch successfully ended (empty when not completed). The value is represented in RFC3339 form and is in UTC. This value is only set for `Successful` batches. Batch is ended when all batched jobs are completed or failed.
- `status` is the current status of the batch. Possible values are `Running`, `Successful` and `Failed`. Status is `Failed` if the batch fails for any reason.

## Get a list of all batches

Get a list of all batches with their states by sending a `GET` request to `http://compute:8000/api/v1/batches`. The response is an array of batch state objects, similar to the response received when creating a new batch

```json
[
  {
    "name": "batch-compute-20220302155333-hrwl53mw",
    "created": "2022-03-02T15:53:33+01:00",
    "started": "2022-03-02T15:53:33+01:00",
    "ended": "2022-03-02T15:54:00+01:00",
    "status": "Succeeded"
  },
  {
    "name": "batch-compute-20220302170647-6ytkltvk",
    "created": "2022-03-02T17:06:47+01:00",
    "started": "2022-03-02T17:06:47+01:00",
    "status": "Running"
  }
]
```

## Get a state of a batch

To get state for a specific batch, e.g. `batch-compute-20220302155333-hrwl53mw`, send a `GET` request to `http://compute:8000/api/v1/batches/batch-compute-20220302155333-hrwl53mw`. The response is a batch state object, with states of its jobs

```json
{
  "name": "batch-compute-20220302155333-hrwl53mw",
  "created": "2022-03-02T15:53:33+01:00",
  "started": "2022-03-02T15:53:33+01:00",
  "ended": "2022-03-02T15:54:00+01:00",
  "status": "Succeeded",
  "jobStatuses": [
    {
      "jobId": "job1",
      "batchName": "batch-compute-20220302155333-hrwl53mw",
      "name": "batch-compute-20220302155333-hrwl53mw-fjhcqwj7",
      "created": "2022-03-02T15:53:36+01:00",
      "started": "2022-03-02T15:53:36+01:00",
      "ended": "2022-03-02T15:53:56+01:00",
      "status": "Succeeded"
    },
    {
      "jobId": "job2",
      "batchName": "batch-compute-20220302155333-hrwl53mw",
      "name": "batch-compute-20220302155333-hrwl53mw-qjzykhrd",
      "created": "2022-03-02T15:53:39+01:00",
      "started": "2022-03-02T15:53:39+01:00",
      "ended": "2022-03-02T15:53:56+01:00",
      "status": "Succeeded"
    }
  ]
}
```

## Delete a batch

The batch list in the example above has a batch named `batch-compute-20220302155333-hrwl53mw`. To delete it, send a `DELETE` request to `http://compute:8000/api/v1/batches/batch-compute-20220302155333-hrwl53mw`. A successful deletion will respond with result object. Deleting of a batch job automatically deletes all jobs, belonging to this batch job.

```json
{
  "status": "Success",
  "message": "batch batch-compute-20220302155333-hrwl53mw successfully deleted",
  "code": 200
}
```

## Stop an existing batch

The batch list in the example above has a batch named `batch-compute-20220302155333-hrwl53mw`. To stop it, send a `POST` request to `http://compute:8000/api/v1/batches/batch-compute-20220302155333-hrwl53mw/stop`. A successful stop will respond with result object. Stop of a batch automatically deletes all batch Kubernetes jobs and their replicas, belonging to this batch job, as well as their logs. All not completed jobs will get the status "Stopped".

```json
{
  "status": "Success",
  "message": "batch batch-compute-20220302155333-hrwl53mw successfully stopped",
  "code": 200
}
```

## Stop a jobs in a batch

The batch list in the example above has a batch named `batch-compute-20220302155333-hrwl53mw` and jobs, one of whicvh has name `batch-compute-20220302155333-hrwl53mw-fjhcqwj7`. To stop this job, send a `POST` request to `http://compute:8000/api/v1/batches/batch-compute-20220302155333-hrwl53mw/jobs/batch-compute-20220302155333-hrwl53mw-fjhcqwj7/stop`. A successful stop will respond with result object. Stop of a batch job automatically deletes corresponding Kubernetes job and its replica, as well as its log. The job will get the status "Stopped".

```json
{
  "status": "Success",
  "message": "job batch-compute-20220302155333-hrwl53mw-fjhcqwj7 in the batch batch-compute-20220302155333-hrwl53mw successfully stopped",
  "code": 200
}
```