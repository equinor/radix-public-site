---
title: Build Secrets
---

# Build secrets
* [With an option `useBuildKit: false`](./#build-secrets-without-buildkit)
* [With an option `useBuildKit: true`](./#build-secrets-with-buildkit)


## Build secrets without BuildKit  
With an option `spec.build.useBuildKit: false`, to ensure that multiline build secrets are handled correct by the build, **all** [Build secrets](/radix-config/index.md#secrets) are passed as `ARG`-s during container build, base-64 encoded (they need to be decoded before use).

```dockerfile
FROM alpine

#an argument, passed to `docker build` with `--build-arg` option
ARG SECRET1

#decode `SECRET1` argument and assign it to `BUILD_ARG` variable for further commands in this `RUN`
RUN BUILD_ARG=$(echo $SECRET1|base64 -d) && \
#instead of `echo...|wc` - use real command with $BUILD_ARG argument
    echo $BUILD_ARG|wc -m
```

In the example above - the actual command can be used instead of `echo` command. However `echo` is useful during development to validate what values have been passed via the `--build-arg` option to the `docker build` command (this is how [build secrets](/radix-config/index.md#secrets) from `radixconfig` are passed in Radix during the build pipeline). Use `docker build` arguments `--progress=plain --no-cache` for such validation on development computer

```sh
docker build . --build-arg SECRET1=$(echo "some-build-arg"|base64) --progress=plain --no-cache
```

:::tip
Note! An `ARG` instruction _goes out of scope_ at the end of the build stage where it was defined. To use an `ARG` in multiple stages, each stage must include the `ARG` instruction ([docs](https://docs.docker.com/engine/reference/builder/#arg)):
:::

```dockerfile
# Use SDK image (first stage)
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env
#an argument, passed to `docker build` with `--build-arg` option
ARG SECRET1
#.....

# Build runtime image (second stage)
FROM mcr.microsoft.com/dotnet/aspnet:5.0
#repeate the argument, passed to `docker build` with `--build-arg` option
ARG SECRET1
#.....
```
## Build secrets with BuildKit  
With an option `spec.build.useBuildKit: true`, build secrets are not available as `ARG`-s during container build. [Build secrets](/radix-config/index.md#secrets) can be mounted as files within the `RUN` directive. BuildKit is an improved backend to replace the legacy builder. Read [more](https://docs.docker.com/build/buildkit/).

:::tip
Docker build workflow has some differences for the command `docker build`, for example how [ARG](https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact) with BuildKit [persists across build stages](https://github.com/moby/buildkit/issues/1977).
:::

Mount a secret with secret name as `id:SECRET1` argument and assign its to `BUILD_ARG`, reading it from the file in the folder `/run/secrets`, where it is mounted with a file name same as the secret's name

Syntax: `RUN --mount=type=secret,id=SECRET_NAME,dst=DESTINATION_PATH COMMAND`, where:
- `SECRET_NAME` is a name of a build secret, defined in the radixconfig.yaml `spec.build.secrets` option.
- `COMMAND` is a single or multiple commands (separated by &&, semicolon or space), which can use the file with a secret.
- `DESTINATION_PATH` is an optional path to a folder, where file with a secret will be created. Default is `/run/secrets`, if not specified.
```dockerfile
FROM alpine

#one secret in the specified destination file and folder /abc/my-secrets/secret-1.txt
RUN --mount=type=secret,id=SECRET1,dst=/abc/my-secrets/secret-1.txt export BUILD_ARG=$(cat /abc/my-secrets/secret-1.txt) && \
    #instead of `echo...|wc` - use real command with $BUILD_ARG argument
    echo $BUILD_ARG|wc -m 

#one secret in the default destination file and folder /run/secrets and a file with a name, the same as the secret name
RUN --mount=type=secret,id=SECRET1 export BUILD_ARG=$(cat /run/secrets/SECRET1) && \
    #instead of `echo...|wc` - use real command with $BUILD_ARG argument
    echo $BUILD_ARG|wc -m 
```

### Development and troubleshooting
For verification that secrets are used as expected, Docker image can be built and run locally. Environment variable `DOCKER_BUILDKIT=1` is set for the command in case if the build ToolKit is not set [by default](https://docs.docker.com/build/buildkit/#getting-started) for the local Docker engine:
* Create a `Dockerfile`, which uses a secret (see an example above)  
* Create a local file, containing a secret: `/some-path/secret1.txt`
* Build a Docker image with an option `--secret`, referring to this file path and the secret name, used in the Dockerfile 
  ```bash
  DOCKER_BUILDKIT=1 docker build . --secret id=SECRET1,src=/some-path/secret1.txt -t some-image-name
  ```
  * To see full build log and avoid cached layers, add options `--progress=plain --no-cache`
  * To easy run the built image, add a target image name `-t some-image-name`
  ```bash
  DOCKER_BUILDKIT=1 docker build . --secret id=SECRET1,src=/some-path/secret1.txt -t some-image-name --progress=plain --no-cache
  ```
* Optionally, run the built image to verify that secrets used as expected
  ```bash
  docker run -it some-image-name
  ```
* Multiple build secrets can be added as multiple `RUN --mount` options (and `docker build` options `--secrets`). Different `dst` files can be used
  ```dockerfile
  FROM alpine
  
  #one secret in the specified destination file and folder /abc/my-secrets/secret-1.txt
  #newer echo secrets in real code
  RUN --mount=type=secret,id=SECRET1,dst=/abc/my-secrets/secret-1.txt \
      --mount=type=secret,id=DB_PASSWORD,dst=/config/db-pass.txt \
      export BUILD_ARG=$(cat /abc/my-secrets/secret-1.txt) && \
      export DB_PASS=$(cat /config/db-pass.txt) && \
      #instead of `echo...|wc` - use real command with $BUILD_ARG env-var
      echo $BUILD_ARG|wc -m && \
      #instead of `echo...|wc` - use real command with $DB_PASS env-var
      echo $DB_PASS|wc -m
  ```
  Run it locally
  ```bash
  DOCKER_BUILDKIT=1 docker build . --secret id=SECRET1,src=/some-path/secret1.txt --secret id=DB_PASSWORD,src=/maybe-another-path/db_password.txt -t some-image-name --progress=plain --no-cache
  ```
* Files, created by a `RUN --mount` options are available only for commands, executed in that particular `RUN`, not in following `RUN` commands or within Docker container, running with this image.
* If a file, specified in the `dst` option already exists, it will be overridden in the `RUN`, where the `--mount` option use it, but it will have original content in further layers
    ```dockerfile
    FROM alpine
    #put some original text to a file /abc/db_server.txt
    RUN mkdir -p /abc && echo "default-server-name">/abc/db_server.txt
    #verify the file contents a text "default-server-name"
    RUN cat /abc/db_server.txt
    #get secret value to the same file and veryfy it contains a value from the secret, overriding the original text
    RUN --mount=type=secret,id=SECRET1,dst=/abc/db_server.txt cat /abc/db_server.txt
    #verify the file again contents text "default-server-name"
    RUN cat /abc/db_server.txt
    ```
* Secrets can contain multi-line text, for example - configuration files
* With an option `spec.build.useBuildKit: true` components are built not in the Azure ACR task, but within the Radix Kubernetes cluster. Such pipeline job can encounter some performance difference, which will be monitored and tuned.
