---
title: Notifications
prev: job-manager-and-job-api
next: environment-variables
---

## Job notifications

When job and bach status need to be monitored, their statuses can be [pulled](./#get-a-state-of-a-batch). Another option is to use job component [notifications](../../references/reference-radix-config/#notifications), posted to one of Radix application components.

URL to the Radix application component or job component endpoint can be specified in the option `webhook`, in the section `notifications` of the [radixconfig.yaml](../../references/reference-radix-config/). It is an endpoint, where a Radix batch event will be posted, when any of running job or batch states of this job component are changed. Notification about changes are sent by a `POST` method with an `application/json` `ContentType` with a [Radix batch event format](#radix-batch-event), which extends the [Radix batch status](./job-manager-and-job-api/#get-a-state-of-a-batch) format with a field `event`:
* `Create` - the event is sent, when a new Radix batch or single job is created
* `Update` - the event is sent, when an existing Radix batch or one of its jobs, including single job, has changed their state
* `Delete` - the event is sent, when an existing Radix batch or a single job are deleted

`notifications` and `webhook` can be specified on a job component configuration level and/or on `environmentConfig` level. Property in the `environmentConfig` will override those on the component level, if present.

::: tip
* Only a Radix application component or job component name and their ports can be used in the webhook URL
* Only private port of the specified component can be used. If this component has only public port - a second port need to be added for this purpose
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
