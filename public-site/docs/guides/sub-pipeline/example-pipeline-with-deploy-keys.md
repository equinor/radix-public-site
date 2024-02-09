---
title: "Sub-pipeline example: Pipeline with GitHub deploy keys"
---

# Sub-pipeline with GitHub deploy keys

* In the Radix application repository create a folder `tekton`. This folder need to be in the configuration branch and in the same folder, where `radixconfig.yaml` file is located (by default it is a root of the repository).
* The sub-pipeline in this example runs one task with two steps.
* Create a file `test-github.yaml` for the task `test-github`. This task has two steps "git-clone" and a step "list-contents".

:::tip
Mount a volume named `$(radix.git-deploy-key)` where you need you ssh credentials.
:::

File `test-github.yaml`

```yaml
apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: test-github
spec:
  stepTemplate:
    image: alpine/git
    volumeMounts:
      - name: source-volume
        mountPath: /var/source
    securityContext:
      runAsUser: 65534 # nobody

  steps:
    - name: git-clone
      volumeMounts:
        - name: $(radix.git-deploy-key) # &lt;-- This volume is created by Radix and available where you mount it.
          mountPath: /.ssh
      command:
        - git
        - clone
        - git@github.com:Equinor-Playground/rihag-edc23-radix-1.git
        - /var/source/branch

    - name: list-contents
      script: |
        #!/usr/bin/env sh
        ls -la /var/source/branch

  volumes:
    - name: source-volume
      emptyDir: { }

```

* Create a file `pipeline.yaml`. Add a task in the `tasks` list: give it a name (it can be any name, unique within this sub-pipeline), in the property `taskRef` ("reference to a task") put the value from the property `metadata.name` of the task, created above:

```yaml
apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: test-pipeline
spec:
  tasks:
    - name: test-github
      taskRef:
        name: test-github

```

* File structure can be like this:

```sh
/
├── tekton/
│   ├── pipeline.yaml
│   └── test-github.yaml
└── radixconfig.yaml
```

## Details:
  * The userid `65534` is mapped to the user `nobody` in the image `alpine/git`, with the home folder set to `/`
  * The volume referenced by `$(radix.git-deploy-key)` is mounted read-only and both files, `id_rsa` and `known_hosts` have permission level `444`, owned by `root:root`. 
    ```shell
    total 4
    drwxrwxrwt    3 root     root           120 Nov 16 09:06 .
    drwxr-sr-x    1 git      git           4096 Nov 16 09:06 ..
    drwxr-xr-x    2 root     root            80 Nov 16 09:06 ..2023_11_16_09_06_55.2062090024
    lrwxrwxrwx    1 root     root            32 Nov 16 09:06 ..data -&gt; ..2023_11_16_09_06_55.2062090024
    lrwxrwxrwx    1 root     root            13 Nov 16 09:06 id_rsa -&gt; ..data/id_rsa
    lrwxrwxrwx    1 root     root            18 Nov 16 09:06 known_hosts -&gt; ..data/known_hosts
    ```
    Note that the permissions listed are wrong, and the underlaying data have limited permissions.
