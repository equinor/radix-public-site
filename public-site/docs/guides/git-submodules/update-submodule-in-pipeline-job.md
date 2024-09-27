---
title: Update Git submodules in a pipeline job
---

# Update Git submodules in a pipeline job

[Submodules](/guides/git-submodules/index.md) are mapped to a Git repository within a folder. This is an example of a Radix app with a submodule, located in the external private or internal Git repository.

## Radix application repository structure
```sh
/
├── app
├── .gitmodules 
├── Dockerfile
└── radixconfig.yaml
```
* `app` - a "virtual" folder, referenced to a submodule
* `.gitmodules` - a file, describing the reference to a submodule:
    
    ```
    [submodule "app"]
        path = app
        url = git@github.com:organisation-name/submodule-repository-name.git
    ```
## Submodule repository structure
```sh
/
├── server.js
```
Repository content will be cloned to the Radix application cloned repository within the folder, specified in the `.gitmodules` property `path` (in this example in the folder `app`).
## Radix config file
radixconfig.yaml
```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: your-radix-app-name
spec:
  build:
    useBuildKit: true
    secrets:
      - SSH_KEY
  environments:
    - name: dev
      build:
        from: main
  components:
    - name: server
      ports:
        - name: http
          port: 8080
      publicPort: http
```
This Radix application has a build secret `SSH_KEY` and it uses build-kit to be built. 
## Dockerfile
```Dockerfile
FROM docker.io/alpine AS builder

RUN apk update && apk add git openssh-client
RUN mkdir -p /root/.ssh && ssh-keyscan github.com > /root/.ssh/known_hosts

WORKDIR /app
COPY . .

WORKDIR /root/.ssh
RUN --mount=type=secret,id=SSH_KEY,dst=id_rsa \
cd /app && git submodule update --init --remote --merge --recursive --verbose

FROM docker.io/node:alpine

WORKDIR /app
COPY --from=builder /app .

WORKDIR /app/app
USER 1001
EXPOSE 8080
CMD ["node", "server.js"]
```
The build secret `SSH_KEY`, specified in the `radixconfig.yaml` should contain a private key (in PEM format), which will be mounted within the file `/root/.ssh/id_rsa` (which is used by default by Git CLI).
This Dockerfile has two stages - the first (with an alias `builder`) is to update submodules, the second with a runtime to run the code.  
If an option `--remote` is not specified - submodule will be cloned with a version referenced in the current commit of the Radix application repository, not the latest version of the submodule repository.

:::info Hint
The default file name with a private key can be changed with one of following options:
* `env GIT_SSH_COMMAND='ssh -i /path/to/your/private_key' submodule update --init --recursive`
* `git -c core.sshCommand="ssh -i /path/to/your/private_key" submodule update --init --recursive`
:::
## Prepare keys
* Generate private and public keys. The key format need to be PEM, do not set passphrase (hit the Enter on the request "Enter passphrase" and "Enter same passphrase again"):
    ```shell
    ssh-keygen -t rsa -b 4096 -m PEM -f private-key-file
    ```
* Get generated keys with commands `cat` (Linux, MacOS, Windows PowerShell), `type` (Windows Terminal) or with an editor:
  * the private key will be copy-pasted to the SSH_KEY build secret on the next step
    ```shell
    cat private-key-file
    ```
  * the public key need to be copy-pasted to a new deploy-key in the submodule's GitHub repository: `Repository/Settings/Deploy keys/Add deploy key`. `Allow write access` is not needed. 
    ```shell
    cat private-key-file.pem`
    ```
## Register and deploy Radix application
* Register a Radix application in the Radix cluster
* Create a first pipeline job `build-deploy`
* This job will fail due to a build secret `SSH_KEY` is not populated. This can be fixed within the Radix console, "Configuration" page of the application, the section "Build secrets" - click on the secret name `SSH_KEY` and copy-paste the private key from the previous step
* Create a new `build-deploy` pipeline job - when it is completed. Navigate to the job step `Building server-dev component`, ensure that log does not have an error on the step:
  ```shell
  [1/2] STEP 7/7: RUN --mount=type=secret,id=SSH_KEY,dst=id_rsa cd /app && git submodule update --init --remote --merge --recursive --verbose
  ```
* The application should be up and running