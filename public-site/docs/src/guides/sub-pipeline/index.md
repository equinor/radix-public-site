---
title: Sub-pipeline
---

# Sub-pipeline

In the [Radix pipeline](../../docs/topic-concepts/#pipeline), optionally a sub-pipeline can be run. It is run after "Build components step" (if components need to be built) or after "Prepare pipeline" step.  This sub-pipeline is based on the [Tekton CI/CD framework](https://tekton.dev/docs/getting-started/).

> Note on nomenclature! The content in this guide concerns a [Tekton pipeline](https://tekton.dev/docs/getting-started/) which is defined as a *pipeline within* a parent [Radix pipeline](../../docs/topic-concepts/#pipeline). In the context of the Radix platform, a Tekton pipeline is referred to as a *sub-pipeline* or *Tekton pipeline*, while the parent Radix pipeline is referred to as a *pipeline* or *Radix pipeline*.

## Configure sub-pipeline
Sub-pipeline is configured with file `pipeline.yaml`. This file will in turn have references to one or several other YAML-files which define *tasks* for the sub-pipeline.

### Pipeline and task files 
* Default folder for sub-pipeline is `tekton`, next to the file `radixconfig.yaml`. 
* Default name for the sub-pipeline is `pipeline.yaml`.
* Files with sub-pipeline task configurations should be located next to the file `pipeline.yaml`.

Example: a sub-pipeline `pipeline.yaml` refers to tasks in files `clone.yaml`, `build.yaml`, `migration.yaml`

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

Suppose an app has a sub-pipeline defined, like the example above. Within the Radix pipeline step "Prepare pipeline", the following logic will be executed:
1. the sub-pipeline defined in `pipeline.yaml` is loaded
2. task files referred to inside the `pipeline.yaml` file are loaded, which are `clone.yaml`, `build.yaml` and `migration.yaml`
3. if an error occurred during loading of the sub-pipeline or its tasks, the step "Prepare pipeline" and entire Radix pipeline job is considered failed
4. the sub-pipeline is run
5. if any step of any task is failed - the pipeline gets status "failed", the step "Run sub-pipeline" and entire Radix pipeline job gets the status "failed"

Errors in stage (3) can be caused by:
  * an invalid format of a sub-pipeline or tasks files
  * an empty list of tasks in a sub-pipeline
  * a missing task, referenced in a sub-pipeline
  * empty step list in a task

Follow the [Tekton documentation](https://tekton.dev/docs/) to configure a sub-pipeline and its tasks, particularly [Tekton pipeline](https://tekton.dev/docs/pipelines/pipelines/) and [task](https://tekton.dev/docs/pipelines/tasks/) documentation. 

Some hints:
* Tekton pipeline and tasks can be developed and tested on PC within [local Kubernetes cluster](https://tekton.dev/docs/getting-started/tasks/).
* Name of a task, file name of a task and a name of a task in the Tekton pipeline task list - all can be different. It is important only to use the same name in the task field `metadata.name` and in the Tekton pipeline field `taskRef.name`. In the example below it is name `build-image`:

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
* It is not important in which order to put tasks in the sub-pipeline - tasks can run in parallel or in sequences, defined by fields [runAfter](https://tekton.dev/docs/pipelines/pipelines/#using-the-runafter-field), [conditions](https://tekton.dev/docs/pipelines/pipelines/#guard-task-execution-using-conditions), [from](https://tekton.dev/docs/pipelines/pipelines/#using-the-from-field).
* If a task has a field `runAfter` - it will be started on;yy when all tasks, referenced in the field `runAfter` are complete.
* Task details:
  * Each sub-pipeline task runs in its own Kubernetes pod (replica).
  * Task step runs in its own container of this task's pod.
  * Task step [can be configured individually](https://tekton.dev/docs/pipelines/tasks/#defining-steps): which container image and how many resources to use, how to proceed [on an error](https://tekton.dev/docs/pipelines/tasks/#specifying-onerror-for-a-step), specify a [timeout](https://tekton.dev/docs/pipelines/tasks/#specifying-a-timeout), if the task runs script - is it [bash](https://tekton.dev/docs/pipelines/tasks/#running-scripts-within-steps) or [PowerShell](https://tekton.dev/docs/pipelines/tasks/#windows-scripts) script, etc.
  * When task step uses `script` - it would be recommended to finish this script with the `no-op` command: put `:` (column) on the last new line of the script. It will help to avoid some irrelevant errors (line in the example below - task run raises an error, when there is no environment variables with "DB" in names). Or just put a command like `echo ""`
    ```yaml
    spec:
      steps:
      - image: alpine
        name: show-db-env-vars
        script: |
          #!/usr/bin/env sh
          printenv|grep "DB"
          :
    ```

## Examples:
* [Simple pipeline](./example-simple-pipeline.md)
* [Pipeline with multiple tasks](./example-pipeline-with-multiple-tasks.md)
* [Pipeline with multiple task steps](./example-pipeline-with-multiple-task-steps.md)
* [Pipeline with build environment variables](./example-pipeline-with-env-vars.md)
* [Pipeline with build environment variables for environments](./example-pipeline-with-env-vars-for-envs.md)
