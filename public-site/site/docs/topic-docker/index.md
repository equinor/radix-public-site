---
title: Docker & containers
layout: document
parent: ["Docs", "../../docs.html"]
toc: true
---

For a general understanding of what Docker and Container is, have a look at [What is a Container](https://www.docker.com/resources/what-container) or a more in-depth presentation from th Stavanger [playground](https://github.com/equinor/playground-stavanger/tree/master/docker-basic).

[Katacoda](https://www.katacoda.com/) offers free courses where you can work with Docker directly in the browser, without having to install it locally. Other resources could be the official [Docker documentation](https://docs.docker.com/).

# Best-practice `Dockerfile`

The official Docker documentation has a set of [best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) when it comes to creating `Dockerfile`s. This is often related to optimizing build, push and pull speed and creating small and secure images.

## Limit image size

Many of the best practices are connected to creating small images either through using the "correct" BASE image or through Multistage builds.

Small images will be faster to build, push and pull then bigger images. It will have less frameworks dependencies, and therefore smaller risk of security vulnerabilities and bugs. Google cloud platform have a great video on why and how to create small images - [link](https://www.youtube.com/watch?v=wGz_cbtCiEA&list=PLIivdWyY5sqL3xfXz5xJvwzFW_tlQB_GB&index=2), or you can check the [official doc](https://docs.docker.com/develop/develop-images/multistage-build/).

Try to find a guide for the technology stack you work on, to optimize your container further.

## Layers

Docker build speed can be reduced by understanding caching of layers. In short, each line in the Dockerfile can be seen as a layer for the finished image. Docker caches these layers and, if there are no changes, can reuse the cached version when building several times. See [digging-into-docker-layers](https://medium.com/@jessgreb01/digging-into-docker-layers-c22f948ed612) for more information.

## Security


### Running as non root

Application hosted on Radix must run with non-root privileges in container, policy enabled in Radix platform will disallow containers running with root privileges. Here's how you can run change a Docker container to run as a non-root user.

```yaml
FROM golang:alpine

WORKDIR /src

COPY . /src

# Add a new group "radix-non-root-group" with group id 1000 
RUN groupadd -g 1000 radix-non-root-group

# Add a new user "radix-non-root-user" with user id 1000 and include in the above group
RUN useradd -u 1000 -g radix-non-root-group radix-non-root-user

USER 1000
ENTRYPOINT ["/src/entrypoint.sh"]
```

The ID of the group and user can be anything in the range 1-65535. 

`groupadd` command follows the syntax `groupadd -g <GROUP_ID> <GROUP-NAME>`

`useradd` command follows the syntax `useradd -u <USER_ID> -g <GROUP_NAME> <USER_NAME>`



 **USER <USER_ID>** command specifies which user to run as, this **must** be the ID of the user, not the name. This will ensure that Kubernetes can verify that the container is running as a non-root user.

> You may experience error messages regarding user already exists. In these cases you can select to use another ID or use the ID of the existing user. 


> There are many great articles on securing docker images. See [this](https://www.wintellect.com/security-best-practices-for-docker-images/) list for best practices.

# Radix specific

## Testing

Automatic testing of an application can be done as a build stage inside the container. This will then be run as one of the steps when radix build the image. The [`Dockerfile`](https://github.com/equinor/radix-example-scenario-docker-multistage-with-test/blob/master/Dockerfile) used in the Radix workhops provides a good example.
