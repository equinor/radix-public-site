---
title: Sub-pipeline
---

# Sub-pipeline

In the [Radix pipeline](../../docs/topic-concepts/#pipeline), optionally a sub-pipeline can be run. It is run after "Build components step" (if components need to be built) or after "Prepare pipeline" step.  This sub-pipeline is based on the [Tekton CI/CD framework](https://tekton.dev/docs/getting-started/).

## Configure sub-pipeline
Sub-pipeline is configured with file `pipeline.yaml` and task yaml-files.

### Pipeline and task files 
* Default folder for sub-pipeline is `tekton`, next to the file `radixconfig.yaml`. 
* Default name for the pipeline is `pipeline.yaml`.
* Files with pipeline task configurations should be located next to the file `pipeline.yaml`.

Example: a pipeline `pipeline.yaml` references to tasks in files `clone.yaml`, `build.yaml`, `migration.yaml`

```
├── component1
├── component2
├── tekton
│   ├── pipeline.yaml
│   ├── clone.yaml
│   ├── build.yaml
│   └── migration.yaml
└── radixconfig.yaml
```

Within the Radix pipeline step "Prepare pipeline", in case when there is a file with a pipeline:
* the pipeline is loaded
* all task, referenced in this pipeline are loaded from yaml-files, located next to the pipeline file
* if an error occurred during loading of the pipeline or its tasks, the step "Prepare pipeline" and entire Radix pipeline job is considered failed. The error can be caused by:
  * an invalid format of a pipeline or tasks files
  * an empty list of tasks in a pipeline
  * a missing task, referenced in a pipeline
  * empty step list in a task
Within the Radix pipeline step "Run sub-pipeline", if the pipeline was loaded withing the step "Prepare pipeline":
* the pipeline is run
* if any step of any task is failed - the pipeline gets status "failed", the step "Run sub-pipeline" and entire Radix pipeline job gets the status "failed"

Follow the [Tekton documentation](https://tekton.dev/docs/) to configure a pipeline and its tasks, particularly [Pipeline](https://tekton.dev/docs/pipelines/pipelines/) and [task](https://tekton.dev/docs/pipelines/tasks/) documentation. 

Some hints:
* Tekton pipeline and tasks can be developed and tested on PC within [local Kubernetes cluster](https://tekton.dev/docs/getting-started/tasks/).
* Name of a task, file name of a task and a name of a task in the pipeline task list - all can be different. It is important only to use the same name in the task field `metadata.name` and in the pipeline field `taskRef.name`. In the example below it is name `build-image`:

* File `pipeline.yaml`:
    ```yaml
    apiVersion: tekton.dev/v1beta1
    kind: Pipeline
    metadata:
      name: pipeline
    spec:
      tasks:
        - name: some-build-task
          taskRef:
            name: build-image
    ```
  File `build-image-task.yaml`:
    ```yaml
    apiVersion: tekton.dev/v1beta1
    kind: Task
    metadata:
      name: build-image
    spec:
      steps:
        ...
    ```
* It is not important in which order to put tasks in the pipeline - tasks can run in parallel or in sequences, defined by fields [runAfter](https://tekton.dev/docs/pipelines/pipelines/#using-the-runafter-field), [conditions](https://tekton.dev/docs/pipelines/pipelines/#guard-task-execution-using-conditions), [from](https://tekton.dev/docs/pipelines/pipelines/#using-the-from-field).
* If a task has a field `runAfter` - it will be started on;yy when all tasks, referenced in the field `runAfter` are complete.
* Task details:
  * Each pipeline task runs in its own Kubernetes pod (replica).
  * Task step runs in its own container of this task's pod.
  * Task step [can be configured individually](https://tekton.dev/docs/pipelines/tasks/#defining-steps): which container image and how many resources to use, how proceed [on an error](https://tekton.dev/docs/pipelines/tasks/#specifying-onerror-for-a-step), specify a [timeout](https://tekton.dev/docs/pipelines/tasks/#specifying-a-timeout), if the task runs script - is it [bash](https://tekton.dev/docs/pipelines/tasks/#running-scripts-within-steps) or [PowerShell](https://tekton.dev/docs/pipelines/tasks/#windows-scripts) script, etc.

## Examples:
* [Simple pipeline](./example-simple-pipeline.md)
* [Pipeline with multiple tasks](./example-pipeline-with-multiple-tasks.md)
* [Pipeline with multiple task steps](./example-pipeline-with-multiple-task-steps.md)
* [Pipeline with build environment variables](./example-pipeline-with-env-vars.md)
* [Pipeline with build environment variables for environments](./example-pipeline-with-env-vars-for-envs.md)
