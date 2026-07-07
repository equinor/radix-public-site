---
title: Build Secrets
---

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

## Development and troubleshooting

For verification that secrets are used as expected, Docker image can be built and run locally. Environment variable `DOCKER_BUILDKIT=1` is set for the command in case if the build ToolKit is not set [by default](https://docs.docker.com/build/buildkit/#getting-started) for the local Docker engine:

- Create a `Dockerfile`, which uses a secret (see an example above)  
- Create a local file, containing a secret: `/some-path/secret1.txt`
- Build a Docker image with an option `--secret`, referring to this file path and the secret name, used in the Dockerfile

  ```bash
  DOCKER_BUILDKIT=1 docker build . --secret id=SECRET1,src=/some-path/secret1.txt -t some-image-name
  ```

  - To see full build log and avoid cached layers, add options `--progress=plain --no-cache`
  - To easy run the built image, add a target image name `-t some-image-name`

  ```bash
  DOCKER_BUILDKIT=1 docker build . --secret id=SECRET1,src=/some-path/secret1.txt -t some-image-name --progress=plain --no-cache
  ```

- Optionally, run the built image to verify that secrets used as expected

  ```bash
  docker run -it some-image-name
  ```

- Multiple build secrets can be added as multiple `RUN --mount` options (and `docker build` options `--secrets`). Different `dst` files can be used

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

- Files, created by a `RUN --mount` options are available only for commands, executed in that particular `RUN`, not in following `RUN` commands or within Docker container, running with this image.

- If a file, specified in the `dst` option already exists, it will be overridden in the `RUN`, where the `--mount` option use it, but it will have original content in further layers

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

- Secrets can contain multi-line text, for example - configuration files
