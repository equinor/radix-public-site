---
title: "Sub-pipeline example: Pipeline with build secrets"
---

# Sub-pipeline example: Pipeline with build secrets

[Source code](https://github.com/equinor/radix-sub-pipeline-example/tree/pipeline-example-with-secrets) for this example.

* In the Radix application repository create a folder `tekton`. This folder need to be on the root level of the repository, in the configuration branch (same as `radixconfig.yaml`) 
* The sub-pipeline in this example runs one task. 
* Create a file `use-secrets-task.yaml` for the task `use-secrets`. This task has one step "show-secrets", which runs in the container with Alpine Linux. 
  * The step runs a script with one commands, showing secrets, mapped to step's container environment variables and files.
  * The task step has description of environment variable `DB_SERVER_NAME` in the field `env`, which will be created in the step's container. These environment variable gets value from the secret `DB_SERVER`, referencing to them via `secretKeyRef` with `$(radix.build-secrets)` and a secret name:
  ```yaml
  env:
    - name: DB_SERVER_NAME
      valueFrom:
        secretKeyRef:
          name: $(radix.build-secrets)
          key: DB_SERVER
  ```
  * The task step also has description of mapping from the build secret and environment variables in the field `envFrom`, which will create in the step's container environment variables for each secret entry in the build secret. These environment variables can get optional prefix to their names, specified in the field `prefix` (e.g. `BUILD_SECRET_` in this example, so for the secret `DB_SERVER` the environment variable will be `BUILD_SECRET_DB_SERVER`). Reference to the build secrets are defined with a field `secretRef.name` and with `$(radix.build-secrets)` as a secret name:
  ```yaml
  envFrom:
    - secretRef:
        name: $(radix.build-secrets)
      prefix: BUILD_SECRET_
  ```
  * The task `spec` also contains a field `volumes`. In this example volumes are mapped to build secrets with particular secret entries, split to two volumes and separate `items` in volumes. Build secrets are referred as `$(radix.build-secrets)` in a field `secret.secretName` of each of volumes.
    * Volume `volume-with-password` maps the build secret `DB_PASSWORD` to a file `password.txt`
    * Volume `volume-cert` maps the build secrets `CERT_PRIV_KEY` and `CERT_PUB_KEY` to files `priv/cert.key` and `priv/cert.pub` correspondingly. Folder `priv` in the `path` will be a sub-folder withing the `mountPath` of `volumeMounts` in task's steps:
  
    ```yaml
    volumes:
      - name: volume-with-password  #a volume, which can be shared between task steps
        secret:
          secretName: $(radix.build-secrets)
          items:
            - key: DB_PASSWORD
              path: password.txt
      - name: volume-cert
        secret:
          secretName: $(radix.build-secrets)
          items:
            - key: CERT_PRIV_KEY
              path: priv/cert.key
            - key: CERT_PUB_KEY
              path: priv/cert.pub
    ```

File `use-secrets-task.yaml`
```yaml
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: use-secrets
spec:
  steps:
    - name: show-secrets
      image: alpine
      env:
        - name: DB_SERVER_NAME
          valueFrom:
            secretKeyRef:
              name: $(radix.build-secrets)
              key: DB_SERVER
      envFrom:
        - secretRef:
            name: $(radix.build-secrets)
          prefix: BUILD_SECRET_
      script: |
        echo "--- Print environment variables, with names containing 'DB_'"
        printenv | grep "DB_"

        echo "--- Print folders: /var/*-volume"
          ls /var/*-volume

        echo "--- Print file: /var/pass-volume/password.txt"
          cat /var/pass-volume/password.txt

        echo "--- Print file: /var/cert-volume/priv/cert.key"
          cat /var/cert-volume/priv/cert.key|head -n 3

        echo "--- Print file: /var/cert-volume/priv/cert.pub"
          cat /var/cert-volume/priv/cert.pub|head -n 3
        :
      volumeMounts:
        - name: volume-with-password
          mountPath: /var/pass-volume      #mount this volume to a folder "/var/task-volume"
        - name: volume-cert
          mountPath: /var/cert-volume      #mount this volume to a folder "/var/cert-volume"
  volumes:
    - name: volume-with-password           #a volume, which can be shared between task steps
      secret:
        secretName: $(radix.build-secrets) #map Radix build secrets to a volume
        items:
          - key: DB_PASSWORD               #map this secret to a file "password.txt"
            path: password.txt
    - name: volume-cert                    #a volume, which can be shared between task steps
      secret:
        secretName: $(radix.build-secrets) #map Radix build secrets to a volume
        items:
          - key: CERT_PRIV_KEY             #map this secret to a file "priv/cert.key"
            path: priv/cert.key
          - key: CERT_PUB_KEY              #map this secret to a file "priv/cert.pub"
            path: priv/cert.pub
```
* Create a file `pipeline.yaml`. Add a task in the `tasks` list: give it a name (it can be any name, unique within this sub-pipeline), in the property `taskRef` ("reference to a task") put the value from the property `metadata.name` of the task, created above:
```yaml
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: pipeline-example-with-secrets
spec:
  tasks:
    - name: use-secrets-for-db      #name of the task "use-secrets" in this pipeline
      taskRef:
        name: use-secrets    #task name
```
* File structure can be like this:
```
├── tekton
│   ├── pipeline.yaml
│   └── use-secrets-task.yaml
└── radixconfig.yaml
```
* In the file `radixconfig.yaml` add a field `build` with sub-field `secrets`, as described in the `radixconfig.yaml` [reference](../../references/reference-radix-config/index.md#build). Values of these secrets will be passed to the sub-pipeline task with build secret reference `$(radix.build-secrets)`: 
```yaml
spec:
  build:
    secrets:
      - DB_SERVER
      - DB_PASSWORD
      - CERT_PRIV_KEY
      - CERT_PUB_KEY
      - DB_USER
```
* This sub-pipeline runs the task `use-secrets-for-db` (which reference to the task `use-secrets` described in the file `use-secrets-task.yaml`), which has one step, as described above. This step run a script, which prints environment variables and files with values of mapped build secrets. Note `:` (column) - this is no-op shell command, added for more stable behaviour of the script (as explained in [Sub-pipeline hints](./index.md#hints)).
```shell
#!/usr/bin/env sh
echo "--- Print environment variables, with names containing 'DB_'"
printenv | grep "DB_"

echo "--- Print folders: /var/*-volume"
ls /var/*-volume

echo "--- Print file: /var/pass-volume/password.txt"
cat /var/pass-volume/password.txt

echo "--- Print file: /var/cert-volume/priv/cert.key"
cat /var/cert-volume/priv/cert.key|head -n 3

echo "--- Print file: /var/cert-volume/priv/cert.pub"
cat /var/cert-volume/priv/cert.pub|head -n 3
```
> First line of the script is [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)). It is recommended to use for consistent script behaviour. It can refer to a default shell `sh` or to a specific shell, existing in the step's image distribution, like `bash` for Ubuntu:
> ```bash
> #!/usr/bin/env bash
> ```

* Commit changes in the repository. Look at the details of a started Radix pipeline job (if the Radix app is connected to the GitHub WebHook, otherwise - start a job manually). 
* If build secrets were just added - the build will fail. Navigate to the "Configuration" page of the Radix application, fill in secrets in the section "Build secrets". In the page "Pipeline jobs" create a new job. 
* Navigate to the Radix pipeline step "Run pipeline", when it is running or completed: the pipelines overview page shows a table with a list of sub-pipelines - in this example it is one sub-pipeline "pipeline-example-with-secrets", running for an environment "dev", and the sub-pipeline status.
 ![Sub-pipeline list](./example-pipeline-with-secrets-pipelines.jpg "Sub-pipeline list")
* Navigate to the sub-pipeline (click on its name in the table row)
* The sub-pipeline overview page shows a table with a list of this sub-pipeline's tasks - in this example it is one task "use-secrets-for-db", and the task status.
  ![Sub-pipeline tasks](./example-pipeline-with-secrets-tasks.jpg "Sub-pipeline tasks")
* Navigate to the task (click on its name in the table row)
* The sub-pipeline task overview page shows a table with a list of this task's steps - in this example it is one step "show-secrets", the step status and log.
  ![Sub-pipeline task steps](./example-pipeline-with-secrets-task-step.jpg "Sub-pipeline steps")

* The log shows environment variables and file contents of the step container (output depend on the entered build secret contents):
```bash
--- Print environment variables, with names containing 'DB_'
BUILD_SECRET_DB_USER=TestUser17
DB_SERVER_NAME=ProdSqlServer
BUILD_SECRET_DB_PASSWORD=Pa$Svv0rD
BUILD_SECRET_DB_SERVER=ProdSqlServer
--- Print folders: /var/*-volume
/var/cert-volume:
priv

/var/pass-volume:
password.txt
--- Print file: /var/pass-volume/password.txt
Pa$Svv0rD--- Print file: /var/cert-volume/priv/cert.key
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEAs7dxa8hioDVwVZLsK9z5844iS7uzVBPQKE8bScMNCDMHUoE+MG5u
--- Print file: /var/cert-volume/priv/cert.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCxwy/9qEaNGcJeheeNuTQZrAmePuoHu2eC9gqfu7Og55e0n51n2rJjrQ2zLD5FbJEriAQfxGSW/jAnxClZJn66iahxujsBiGfaJeaLFdji4w7n5486LeKmo+4M6MnX5zU2F3A+DQ4THU4yEn+SHttRWX2UDdBhGM+ZXvMvPv/zVC17H7/no0W5wOB+SyFqmDTZY+dJQS68HsSxNt4BgRq94RJvCh/h62yzPztP+hbQ60
```
