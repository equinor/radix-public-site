---
title: Docker, Containers
---

# Overview

Even if your not using Radix, it is recommended that you learn how to use Docker for containerization, and use it for hosting. It has many benefits when utilizing cloud.

[What is a container](https://www.youtube.com/watch?v=EnJ7qX9fkcU) and [Benefits of containers](https://www.youtube.com/watch?v=cCTLjAdIQho) are both good videos to explain what and why containers.  

[Best practice](https://radix.equinor.com/docs/topic-docker/) contains references to other relevant resources.

::: details Example
```docker
FROM nginxinc/nginx-unprivileged:1-alpine

# Use root to install
# switch to nonroot user after building
# the container
USER root
RUN apk update
RUN apk upgrade
RUN apk add --update npm

WORKDIR /

# frontend-nginx.conf - refers to this directory when serving

RUN mkdir /app

WORKDIR /app

COPY ./ .

RUN npm i
RUN npm run build

RUN mv ./build /site

WORKDIR /app

# Delete all src files
# after build, as they are not needed for runtime
RUN rm -Rf /app

RUN addgroup --gid 1001 appgroup
RUN adduser --uid 1001 --gid 1001 appuser
# nginx
COPY frontend-nginx.conf /etc/nginx/conf.d/default.conf

# Give 1001 user rights to the directory of files
RUN chown -R 1001:1001 /app

# Change user (nonroot)
USER 1001

EXPOSE 8001

CMD ["npm", "run", "prod"]
```
:::