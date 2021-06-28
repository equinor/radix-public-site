---
title: Docker, Build secrets
layout: document
parent: ['Guides', '../../guides.html']
toc: true
---

# Build secrets

[Build secrets](../../docs/reference-radix-config/#secrets)  are passed base-64 encoded, they need to be decoded before use and it should be done in same `RUN` as a command, which uses this secret:

```dockerfile
FROM alpine

#argument, passed to `docker build` with `--build-arg` option
ARG SECRET1

#decode `SECRET1` argument and assign it to `BUILD_ARG` variable for further commands in this `RUN`
RUN BUILD_ARG=$(echo $SECRET1|base64 -d) && \
#instead of `echo` - use real command with $BUILD_ARG argument
    echo $BUILD_ARG && \
#this is for validation purpose only
    echo "BUILD_ARG contains $BUILD_ARG"
```
In the example above - actual command can be used instead of `echo` command. However `echo` is useful during development to validate what values have been passed via `--build-arg` option to the `docker build` command (this is how [build secrets](../../docs/reference-radix-config/#secrets) from `radixconfig` are passed in Radix during build pipeline). Use `docker build` arguments `--progress=plain --no-cache` for such validation on development PC:
```shell
docker build . --build-arg SECRET1=$(echo "some-build-arg"|base64) --progress=plain --no-cache
```
