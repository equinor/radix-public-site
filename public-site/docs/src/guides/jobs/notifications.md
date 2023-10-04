---
title: Notifications
prev: job-manager-and-job-api
next: environment-variables
---

## Job notifications

When job and batch status needs to be monitored, their statuses can be [pulled](./#get-a-state-of-a-batch). Another option is to use job component [notifications](../../references/reference-radix-config/#notifications), posted to one of Radix application components.

The URL to the Radix application component or job component endpoint can be specified in the `webhook` option in the `notifications` section in the [radixconfig.yaml](../../references/reference-radix-config/). This is an endpoint where a Radix batch events will be posted when any of the running jobs or batches for this job component changes states. Notification about changes are sent by a `POST` method with an `application/json` `ContentType` with a [Radix batch event format](#radix-batch-event), which extends the [Radix batch status](./job-manager-and-job-api/#get-a-state-of-a-batch) format with a field `event`:
* `Create` - this event is sent when a new Radix batch or job is created.
* `Update` - this event is sent when an existing Radix batch or one of its jobs, including single job, has changed state.
* `Delete` - this event is sent when an existing Radix batch or job is deleted.

`notifications` and `webhook` can be specified on a job component configuration level and/or on `environmentConfig` level. Property in the `environmentConfig` will override those on the component level, if present.

::: tip
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

### Radix batch event
```json
{
  "name": "batch-compute-20220302155333-hrwl53mw",
  "created": "2022-03-02T15:53:33+01:00",
  "started": "2022-03-02T15:53:33+01:00",
  "ended": "2022-03-02T15:54:00+01:00",
  "status": "Succeeded",
  "event": "Update",
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
      "status": "Running"
    }
  ]
}
```
