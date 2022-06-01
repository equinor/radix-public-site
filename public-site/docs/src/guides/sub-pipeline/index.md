---
title: Custom sub-pipeline
---

# Custom sub-pipeline

After build components step of the [Radix pipeline](../../docs/topic-concepts/#pipeline), optionally it can be run a custom sub-pipeline. This sub-pipeline is based on the [Tekton CI/CD framework](https://tekton.dev/docs/getting-started/). If the config branch of the Radix application repository contains configuration files for it.

## Pipeline files 
* Default folder for sub-pipeline is `tekton`, next to the file `radixconfig.yaml`. 
* Default name for the pipeline is `pipeline.yaml`.
* Files with pipeline task configurations should be located next to the file `pipeline.yaml`.

Example:

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
