---
title: Job Manager and job API
prev: configure-jobs
next: notifications
---

## Job Manager and job API

The Job Manager, aka "job-scheduler", is a web API service, that you use to create, delete and monitor the state of jobs.
Radix creates one job-scheduler per job defined in [`radixconfig.yaml`](/radix-config/index.md#jobs). A job-scheduler will listen to the port defined by `schedulerPort` and host name equal to the `name` of the job. The job-scheduler API can only be accessed by components running in the same environment, and it is not exposed to the Internet. No authentication is required.

The Job Manager exposes the following methods for managing jobs:
- `GET /api/v1/jobs` Get states (with names and statuses) for all jobs
- `GET /api/v1/jobs/{jobName}` Get state for a named job
- `DELETE /api/v1/jobs/{jobName}` Delete a named job
- `POST /api/v1/jobs/{jobName}/stop` Stop a named job


... and the following methods for managing batches:
- `GET /api/v1/batches` Get states (with names and statuses) for all batches
- `GET /api/v1/batches/{batchName}` Get state for a named batch and statuses of its jobs
- `DELETE /api/v1/batches/{batchName}` Delete a named batch
- `POST /api/v1/batches/{batchName}/stop` Stop a named batch
- `POST /api/v1/batches/{batchName}/jobs/{jobName}/stop` Stop a named job of a batch

## Create a single job

- `POST /api/v1/jobs` Create a new job using the Docker image that Radix built for the job. Job-specific arguments can be sent in the request body

```json
{
  "payload": "Sk9CX1BBUkFNMTogeHl6Cg==",
  "jobId": "my-job-1",
  "imageTagName": "1.0.0",
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

 `payload`, `jobId`, `imageTagName`, `timeLimitSeconds`, `backoffLimit`, `resources` and `node` are all optional fields and any of them can be omitted in the request.

`imageTagName` field allows to alter specific job image tag. In order to use it, the `{imageTagName}` need to be set as described in the [`radixconfig.yaml`](/radix-config/index.md#imagetagname)

## Create a batch of jobs

- `POST /api/v1/batches` Create a new batch of single jobs, using the Docker image, that Radix built for the job component. Job-specific arguments can be sent in the request body, specified individually for each item in `jobScheduleDescriptions` with default values defined in `defaultRadixJobComponentConfig`.

```json
{
  "defaultRadixJobComponentConfig": {
    "imageTagName": "1.0.0",
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
      },
      "node": {
        "gpu": "gpu1",
        "gpuCount": "2"
      }
    }
  },
  "jobScheduleDescriptions": [
    {
      "payload": "{'data':'value1'}",
      "jobId": "my-job-1",
      "imageTagName": "1.0.0",
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
    },
    {
      "payload": "{'data':'value2'}",
      "jobId": "my-job-2",
      ...
    },
    {
      "payload": "{'data':'value3'}",
      ...
    }
  ]
}
```

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
- `ended` is the date and time the job successfully ended. Also represented in RFC3339 form and is in UTC. This value is only set for `Succeeded` jobs.
- `status` is the current status of the job. Possible values are  `Waiting`, `Stopping`, `Stopped`, `Active`, `Running`, `Succeeded`, `Failed`, `DeadlineExceeded`. `Active` status means that the job has a replica created, but this replica is not ready (due to such reasons as volume mount is not ready, or it is a problem to schedule replica on a node because not enough memory available, etc.), this status can remain forever. Status `Failed` if the job's replica container exits with a non-zero exit code, and `Succeeded` if the exit code is zero.

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

### Job ID 
Jobs can have `jobId` - it is an optional string, where any value can be put. Radix does not process it. It can exist in a `jobScheduleDescription` for a single job or in batch jobs  
If the `jobId` is specified, it will be returned in the job's status, and it will be shown in the Radix console in the job list.

#### Job ID in a single job
```json
{
  "jobId": "my-job",
  "payload": "{\"x\": 10, \"y\": 20}"
}
```

#### Job ID in the batch jobs
```json
{
  "jobScheduleDescriptions": [
    {
      "jobId": "my-job-1",
      "payload": "{\"x\": 10, \"y\": 20}"
    },
    {
      "jobId": "my-job-2",
      "payload": "{\"x\": 20, \"y\": 30}"
    }
  ]
}
```

Default parameters for jobs can be defined within `DefaultRadixJobComponentConfig`. These parameters can be overridden for each job individually in `JobScheduleDescriptions`

```json
{
  "defaultRadixJobComponentConfig": {
    "imageTagName": "1.0.0",
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
      "payload": "{'data':'value2'}",
      "imageTagName": "2.0.0"
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
- `ended` is the date and time the batch successfully ended (empty when not completed). The value is represented in RFC3339 form and is in UTC. This value is only set for `Succeeded` batches. Batch is ended when all batched jobs are completed or failed.
- `status` is the current status of the batch. Possible values are `Running`, `Succeeded` and `Failed`. Status is `Failed` if the batch fails for any reason.

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

To get state for a specific batch, e.g. `batch-compute-20220302155333-hrwl53mw`, send a `GET` request to `http://compute:8000/api/v1/batches/batch-compute-20220302155333-hrwl53mw`. The response is a batch state object, with states of its jobs and their replicas (pods) statuses.

```json
{
  "name": "batch-compute-20220302155333-hrwl53mw",
  "created": "2022-03-02T15:53:33+01:00",
  "started": "2022-03-02T15:53:33+01:00",
  "ended": "2022-03-02T15:54:00+01:00",
  "status": "Succeeded",
  "updated": "2022-03-02T15:54:00+01:00",
  "jobStatuses": [
    {
      "jobId": "job1",
      "batchName": "batch-compute-20220302155333-hrwl53mw",
      "name": "batch-compute-20220302155333-hrwl53mw-fjhcqwj7",
      "created": "2022-03-02T15:53:36+01:00",
      "started": "2022-03-02T15:53:36+01:00",
      "ended": "2022-03-02T15:53:56+01:00",
      "status": "Succeeded",
      "updated": "2022-03-02T15:53:56+01:00",
      "podStatuses": [
        {
          "name": "batch-compute-20220302155333-hrwl53mw-fjhcqwj7-5sfnl",
          "created": "2022-03-02T15:53:36Z",
          "startTime": "2022-03-02T15:53:36Z",
          "endTime": "2022-03-02T15:53:56Z",
          "containerStarted": "2022-03-02T15:53:36Z",
          "replicaStatus": {
            "status": "Succeeded"
          },
          "image": "radixprod.azurecr.io/radix-app-dev-compute:6k8vv",
          "imageId": "radixprod.azurecr.io/radix-app-dev-compute@sha256:1f9ce890db8eb89ae0369995f76676a58af2a82129fc0babe080a5daca86a44e",
          "exitCode": 0,
          "reason": "Completed"
        }
      ]
    },
    {
      "jobId": "job2",
      "batchName": "batch-compute-20220302155333-hrwl53mw",
      "name": "batch-compute-20220302155333-hrwl53mw-qjzykhrd",
      "created": "2022-03-02T15:53:39+01:00",
      "started": "2022-03-02T15:53:39+01:00",
      "ended": "2022-03-02T15:53:56+01:00",
      "status": "Succeeded",
      "updated": "2022-03-02T15:53:56+01:00",
      "podStatuses": [
        {
          "name": "batch-compute-20220302155333-hrwl53mw-qjzykhrd-5sfnl",
          "created": "2022-03-02T15:53:39Z",
          "startTime": "2022-03-02T15:53:40Z",
          "endTime": "2022-03-02T15:53:56Z",
          "containerStarted": "2022-03-02T15:53:40Z",
          "replicaStatus": {
            "status": "Succeeded"
          },
          "image": "radixprod.azurecr.io/radix-app-dev-compute:6k8vv",
          "imageId": "radixprod.azurecr.io/radix-app-dev-compute@sha256:1f9ce890db8eb89ae0369995f76676a58af2a82129fc0babe080a5daca86a44e",
          "exitCode": 0,
          "reason": "Completed"
        }
      ]
    }
  ]
}
```

If the job's replica failed and job-component has [backoffLimit](/radix-config/index.md#backofflimit) greater then `0`, `podStatus` contains `exitCode` and `reason` for failed pods. `podIndex` gives an order of pod statuses (starting from `0`)

```json
{
  "name": "batch-compute-20220302155333-hrwl53mw",
  "created": "2022-03-02T15:53:33+01:00",
  "started": "2022-03-02T15:53:33+01:00",
  "ended": "2022-03-02T15:53:48+01:00",
  "status": "Failed",
  "updated": "2022-03-02T15:53:48+01:00",
  "jobStatuses": [
    {
      "jobId": "job1",
      "batchName": "batch-compute-20220302155333-hrwl53mw",
      "name": "batch-compute-20220302155333-hrwl53mw-fjhcqwj7",
      "created": "2022-03-02T15:53:36+01:00",
      "started": "2022-03-02T15:53:36+01:00",
      "ended": "2022-03-02T15:53:56+01:00",
      "status": "Failed",
      "message": "Job has reached the specified backoff limit",
      "updated": "2022-03-02T15:53:56+01:00",
      "podStatuses": [
        {
          "name": "batch-compute-20220302155333-hrwl53mw-fjhcqwj7-wbn9q",
          "created": "2022-03-02T15:53:36Z",
          "startTime": "2022-03-02T15:53:36Z",
          "endTime": "2022-03-02T15:53:40Z",
          "containerStarted": "2022-03-02T15:53:36Z",
          "replicaStatus": {
            "status": "Failed"
          },
          "image": "radixprod.azurecr.io/radix-app-dev-compute:6k8vv",
          "imageId": "radixprod.azurecr.io/radix-app-dev-compute@sha256:1f9ce890db8eb89ae0369995f76676a58af2a82129fc0babe080a5daca86a44e",
          "exitCode": 1,
          "reason": "Error"
        },
        {
          "name": "batch-compute-20220302155333-hrwl53mw-fjhcqwj7-859xq",
          "created": "2022-03-02T15:53:40Z",
          "startTime": "2022-03-02T15:53:42Z",
          "endTime": "2022-03-02T15:53:48Z",
          "containerStarted": "2022-03-02T15:53:42Z",
          "replicaStatus": {
            "status": "Failed"
          },
          "image": "radixprod.azurecr.io/radix-app-dev-compute:6k8vv",
          "imageId": "radixprod.azurecr.io/radix-app-dev-compute@sha256:1f9ce890db8eb89ae0369995f76676a58af2a82129fc0babe080a5daca86a44e",
          "podIndex": 1,
          "exitCode": 1,
          "reason": "Error"
        }
      ]
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