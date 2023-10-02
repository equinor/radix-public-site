---
title: Logs
---

# Logs

Application logs can help you understand what is happening inside your application. The logs are particularly useful for debugging problems and monitoring activity.

Log entries written to the `stdout` and `stderr` streams are stored for 30 days and can be accessed through Radix Web Console or Radix CLI. 

## Radix Web Console

Radix Web Console provides access to logs for running `pipeline jobs`, `components` and `jobs`. 

### Components

To view the current log for running replicas, click on a replica `name` in the `Replicas` list. The log page shows the latest 1000 entries and refreshes every five seconds. To download the entire log, click the `Download` button.

![Replica list](component-active-replicas.png)
![Replica container log](component-replica-log.png)

When a pipeline job succeeds and deploy a new version of your application, or when you restart a component, Radix creates new replicas with new names. The old replicas are removed once the new replicas are running. Containers behave in a similar manner; if the container for an active replica crashes or is killed, Kubernetes will start a new container, and the previous container's log will no longer be available in the replica's log page.

`Replica Logs` lists all replicas and containers, both active and historical, for the component from the last 30 days. Replicas and containers in this list is sorted descending by their creation date, and containers are grouped within their respective replicas.

You can download the log for all containers belonging to a replica _[1]_, or for a specific container _[2]_ within the replica.

![Replica log](replica-log.png)


### Jobs

### Pipeline jobs

You can view the log for each step in a pipeline job by clicking on the step name. For completed steps (succeeded or failed), the log will be unavailable when the underlying container is deleted by Kubernetes.

![Job steps](job-steps.png)
![Step log](step-log.png)



## Radix CLI

