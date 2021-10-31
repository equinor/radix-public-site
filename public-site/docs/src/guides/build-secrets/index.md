---
title: Docker Build secrets
---

# Build secrets

[Build secrets](../../references/reference-radix-config/#secrets)  are passed base-64 encoded, they need to be decoded before use and it should be done in same `RUN` as a command, which uses this secret

```dockerfile
FROM alpine

#an argument, passed to `docker build` with `--build-arg` option
ARG SECRET1

#decode `SECRET1` argument and assign it to `BUILD_ARG` variable for further commands in this `RUN`
RUN BUILD_ARG=$(echo $SECRET1|base64 -d) && \
#instead of `echo` - use real command with $BUILD_ARG argument
    echo $BUILD_ARG && \
#this is for validation purpose only
    echo "BUILD_ARG contains $BUILD_ARG"
```

In the example above - the actual command can be used instead of `echo` command. However `echo` is useful during development to validate what values have been passed via the `--build-arg` option to the `docker build` command (this is how [build secrets](../../references/reference-radix-config/#secrets) from `radixconfig` are passed in Radix during the build pipeline). Use `docker build` arguments `--progress=plain --no-cache` for such validation on development computer

```sh
docker build . --build-arg SECRET1=$(echo "some-build-arg"|base64) --progress=plain --no-cache
```

> Note! An `ARG` instruction _goes out of scope_ at the end of the build stage where it was defined. To use an `ARG` in multiple stages, each stage must include the `ARG` instruction ([docs](https://docs.docker.com/engine/reference/builder/#arg)):


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
