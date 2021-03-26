---
title: Docker & containers
layout: document
parent: ["Docs", "../../docs.html"]
toc: true
---

For a general understanding of what Docker and Container is, have a look at [What is a Container](https://www.docker.com/resources/what-container) or a more in-depth presentation from the Stavanger [playground](https://github.com/equinor/playground-stavanger/tree/master/docker-basic).

[Katacoda](https://www.katacoda.com/) offers free courses where you can work with Docker directly in the browser, without having to install it locally. Other resources could be the official [Docker documentation](https://docs.docker.com/).

## Security

### Running as non-root

Application hosted on Radix must be run with non-root privileges in the container. A security policy enabled in the Radix platform will prevent the application from running if it is not configured to run as non-root. Here's an sample on how you can run change a Docker container to run as a non-root user, the principle is that you create a dedicated user and group on the image and use this user to run the process.   

This is a sample on how it can be done for node based images. If your base image is a unprivileged image, you'll need to find the ID of the running user, and specify that id in your Dockerfile.  

 **USER <USER_ID>** specifies which user to run as, this **must** be the ID of the user, not the name. This will ensure that Kubernetes can verify that the container is running as a non-root user.

```yaml
FROM node:lts-alpine

WORKDIR /src

COPY . /src

# Add a new group "radix-non-root-group" with group id 1001 
RUN addgroup -S -g 1001 radix-non-root-group

# Add a new user "radix-non-root-user" with user id 1001 and include in group
RUN adduser -S -u 1001 -G radix-non-root-group radix-non-root-user

USER 1001
ENTRYPOINT ["/src/entrypoint.sh"]
```

The ID of the group and user can be anything in the range 1-65535. 

`groupadd` command follows the syntax `groupadd -S -g <GROUP_ID> <GROUP-NAME>`

`useradd` command follows the syntax `useradd -S -u <USER_ID> -g <GROUP_NAME> <USER_NAME>`

 
> If this is not configured, your deployment will not start.  

> There are many great articles on securing docker images. See [Snyk and Docker top 10 tips](https://res.cloudinary.com/snyk/image/upload/v1551798390/Docker_Image_Security_Best_Practices_.pdf) and  [this](https://www.wintellect.com/security-best-practices-for-docker-images/) list for best practices.

# Best-practice `Dockerfile`

The official Docker documentation has a set of [best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) when it comes to creating `Dockerfile`s. This is often related to optimizing build, push and pull speed and creating small and secure images.

## Limit image size

Many of the best practices are connected to creating small images either through using the "correct" BASE image or through Multistage builds.

Small images will be faster to build, push and pull then bigger images. It will have less frameworks dependencies, and therefore smaller risk of security vulnerabilities and bugs. Google cloud platform have a great video on why and how to create small images - [link](https://www.youtube.com/watch?v=wGz_cbtCiEA&list=PLIivdWyY5sqL3xfXz5xJvwzFW_tlQB_GB&index=2), or you can check the [official doc](https://docs.docker.com/develop/develop-images/multistage-build/).

Try to find a guide for the technology stack you work on, to optimize your container further.

## Layers

Docker build speed can be reduced by understanding caching of layers. In short, each line in the Dockerfile can be seen as a layer for the finished image. Docker caches these layers and, if there are no changes, can reuse the cached version when building several times. See [digging-into-docker-layers](https://medium.com/@jessgreb01/digging-into-docker-layers-c22f948ed612) for more information.


# Radix specific

## Testing

Automatic testing of an application can be done as a build stage inside the container. This will then be run as one of the steps when radix build the image. The [`Dockerfile`](https://github.com/equinor/radix-example-scenario-docker-multistage-with-test/blob/master/Dockerfile) used in the Radix workhops provides a good example.
