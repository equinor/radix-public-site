---
title: Sub-pipeline
---

# Sub-pipeline

In the [Radix pipeline](../../docs/topic-concepts/#pipeline), optionally a sub-pipeline can be run. It is run after build components step (if components need to be built) or after Prepare pipeline step.  This sub-pipeline is based on the [Tekton CI/CD framework](https://tekton.dev/docs/getting-started/).

## Configure sub-pipeline
Sub-pipeline is configured with a pipeline.yaml file and task yaml-files.

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

Within the Radix pipeline step "Prepare pipeline", if there is a file with a pipeline:
* the pipeline is loaded
* all task, referenced in this pipeline are loaded from yaml files, located next to the pipeline file
* if during load of pipeline or tasks and error occurred - the step "Prepare pipeline" and entire Radix pipeline job is considered failed. An error can be caused:
  * invalid format in the pipeline or task files
  * missing list of tasks in a pipeline
  * missing task, referenced in a pipeline
  * missing steps in a task
Within the Radix pipeline step "Run sub-pipeline", if the pipeline was loaded withing the step "Prepare pipeline":
* the pipeline is run
* if any step of any task is failed - the pipeline gets status "failed", the step "Run sub-pipeline" and entire Radix pipeline job is considered failed

Follow the [Tekton documentation](https://tekton.dev/docs/) to configure a pipeline and its tasks, particularly [Pipeline](https://tekton.dev/docs/pipelines/pipelines/) and [task](https://tekton.dev/docs/pipelines/tasks/) documentation. 

Some hints:
* Tekton pipeline and tasks can be developed and tested [on local PC](https://tekton.dev/docs/getting-started/tasks/).
* Name of the task, file name of the task and name of the task in the pipeline task list can be different. Important only to use the same name in the task field `metadata.name` and in the pipeline field `taskRef.name`. In the example below it is name `build-image`:

  _File_ `pipeline.yaml`:
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
  _File_ `build-image-task.yaml`:
    ```yaml
    apiVersion: tekton.dev/v1beta1
    kind: Task
    metadata:
      name: build-image
    spec:
      steps:
        ...
    ```
* It is not important in which order to put the tasks in the pipeline - tasks can run in parallel or in a sequences, defined by fields [runAfter](https://tekton.dev/docs/pipelines/pipelines/#using-the-runafter-field), [conditions](https://tekton.dev/docs/pipelines/pipelines/#guard-task-execution-using-conditions), [from](https://tekton.dev/docs/pipelines/pipelines/#using-the-from-field).
* All tasks, referenced in the field `runAfter` should complete to start this task
* Task:
  * Pipeline task runs in own Kubernetes pod (replica)
  * Task step runs in own container of its task pod.
  * Task step [can be configured individually](https://tekton.dev/docs/pipelines/tasks/#defining-steps): which container image and how many resources to use, how proceed [with an error](https://tekton.dev/docs/pipelines/tasks/#specifying-onerror-for-a-step), specify a [timeout](https://tekton.dev/docs/pipelines/tasks/#specifying-a-timeout), if the task runs script - is it [bash](https://tekton.dev/docs/pipelines/tasks/#running-scripts-within-steps) or [PowerShell script](https://tekton.dev/docs/pipelines/tasks/#windows-scripts), etc.

Examples:
* [Simple pipeline](./example-simple-pipeline.md)
* [Pipeline with multiple tasks](./example-pipeline-with-multiple-tasks.md)
* [Pipeline with multiple task steps](./example-pipeline-with-multiple-task-steps.md)
