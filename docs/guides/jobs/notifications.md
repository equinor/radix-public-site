---
title: Notifications
prev: job-manager-and-job-api
next: environment-variables
---

## Notifications

When job and batch status needs to be monitored, their statuses can be [pulled](job-manager-and-job-api.md#get-a-state-of-a-batch). Another option is to use job component [notifications](/radix-config/index.md#notifications), posted to one of Radix application components.

The URL to the Radix application component or job component endpoint can be specified in the `webhook` option in the `notifications` section in the [radixconfig.yaml](/radix-config/index.md). This is an endpoint where a Radix batch events will be posted when any of the running jobs or batches for this job component changes states. Notification about changes are sent by a `POST` method with an `application/json` `ContentType` with a [Radix batch event format](#radix-batch-event), which extends the [Radix batch status](./job-manager-and-job-api.md#get-a-state-of-a-batch) format with fields
* `name` - internal name of the batch or a single job. In both cases the name begins with `batch-`
* `batchId` - optional string value to identify a batch.
* `created`, `started`, `ended` - timestamp of corresponding batch live cycle event
* `status` - status of a batch or a single job
* `updated` - timestamp when a status was updated
* `event`:
  * `Create` - this event is sent when a new Radix batch or job is created.
  * `Update` - this event is sent when an existing Radix batch or one of its jobs, including single job, has changed state.
  * `Delete` - this event is sent when an existing Radix batch or job is deleted.
* `batchType`:
  * `job` - single job
  * `batch` - batch of jobs
* `jobStatuses` - list of statuses of only changed jobs. This list can be empty when the common properties are changed (e.g. only `started`, `status`). 

Fields in the `jobStatus` list items:
* `jobId` - optional name, specified for the job within `JobDescription`
* `batchName` - name of a batch for job in a batch. It is not provided for single jobs.
* `podStatuses` - list of status and attributes of one or several job pods (replicas). If the job's replica failed and job-component has [backoffLimit](/radix-config/index.md#backofflimit) greater then `0`, `podStatus` contains `exitCode` and `reason` for failed pods. `podIndex` gives an order of pod statuses (starting from `0`)
  * In the `podStatuses` replica attribute `image` should be the same for all pods, but `imageId` _can_ be different, if this image was updated within a period of different pods starts.


`notifications` and `webhook` can be specified on a job component configuration level and/or on `environmentConfig` level. Property in the `environmentConfig` will override those on the component level, if present.

:::tip
* Only a Radix application component or job component name and their ports can be used in the webhook URL
* Only private ports of the specified component can be used, public ports cannot be used for this purpose.
```yaml
  components:
    - name: frontend
      src: frontend
      ports:
        - name: http
          port: 8001
        - name: job-monitoring
          port: 8002
      publicPort: http
  jobs:
    - name: compute
      schedulerPort: 8080
      notifications:
        webhook: http://frontend:8002

```
:::

## Radix batch event
```json
{
  "name": "batch-compute-20220302155333-hrwl53mw",
  "batchId": "random-batch-id-123",
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
