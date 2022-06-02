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

Examples:
* [Simple pipeline](./pipeline-simple-example.md)
