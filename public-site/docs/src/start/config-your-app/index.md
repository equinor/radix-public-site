---
title: Configuring your app
---

> Visual learner? Check out the [Introduction to Radix video](https://web.microsoftstream.com/video/fa523b5c-3509-4e11-97b0-868ae499f603) 🎥

In this guide we'll set up an application in Radix. Here's what we need:

- A GitHub repository for our code (only GitHub is supported at the moment)
- A [`radixconfig.yaml`](../../references/reference-radix-config/) file that defines the running environments. By default, it is in the root directory of our repository.
- At least one `Dockerfile` that builds and serves our application. We can have several of these files: one per component, in separate directories (e.g. a "front-end" component and a "back-end" component).

We will go over these points below.

## The repository

All of our **components must be in the same repository**. A component is code that has its own build and deployment process: for instance a "front end" served by Nginx and a "back end" running on Node.js would be two components. Components are built in parallel from the same repository and deployed together into an environment. There is currently no concept of a multi-repository application.

The way we use branches and tags in our repository depends on what type of workflow we use. You can read more about the choices available in the [workflows](../workflows/) section — but let's continue with setting up for now.

## The `radixconfig.yaml` file

A [`radixconfig.yaml`](../../references/reference-radix-config/) file that defines the running environments, which specifies how our application is built and deployed. By default, it is in the root directory of our repository.

> Radix only reads `radixconfig.yaml` from the branch we set as the `Config Branch` in the application registration form. If the file is changed in other branches, those changes will be ignored. The `Config Branch` must be mapped to an environment in `radixconfig.yaml`

If you are unfamiliar with YAML, it is fine to write the configuration as JSON instead — just keep the same filename.

Here is a simple example of the file:

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: myapp
spec:
  environments:
    - name: dev
      build:
        from: master
    - name: prod
  components:
    - name: main
      src: "."
      publicPort: http
      ports:
       - name: http
         port: 8080
```

The same, but as JSON:

```json
{
  "apiVersion": "radix.equinor.com/v1",
  "kind": "RadixApplication",
  "metadata": { "name": "myapp" },
  "spec": {
    "environments": [
      { "name": "dev", "build": { "from": "master" } },
      { "name": "prod" }
    ],
    "components": [
      {
        "name": "frontend",
        "src": ".",
        "publicPort": "http",
        "ports": [
          { "name": "http", "port": 8080 }
        ]
      }
    ]
  }
}
```

A breakdown of the configuration above:

- Our application is called `myapp`
- There are two environments, `dev` and `prod`, and only one component, `frontend`
- Commits to the `master` branch will trigger a build and deployment of the application to the `dev` environment. We can use this behavior to build a [workflow](../workflows/)
- Radix will look for the `Dockerfile` for the `frontend` component in the root directory of the repository
- Once `frontend` is built, it will be exposed on the internet on port 8080 on each environment it is deployed to (in `dev`, for instance, it will have a domain name like `main-myapp-dev.playground.radix.equinor.com` (on the Playground cluster) or `main-myapp-dev.radix.equinor.com` (on the Platform cluster))

The full syntax of `radixconfig.yaml` is explained in [Radix Config reference](../../references/reference-radix-config/).

## A `Dockerfile` per component

Each component in Radix is built into a Docker image. Images for all components are deployed as containers running in an environment. To do this, Radix requires a `Dockerfile` for each component.

If we organize our repository with this structure, for instance:

```sh
/
├─ fe/
│  ├─ Dockerfile
│  └─ *frontend component code*
│
├─ be/
│  ├─ Dockerfile
│  └─ *backend component code*
│
└─ radixconfig.yaml
```

In [`radixconfig.yaml`](../../references/reference-radix-config/#components) we can define the following components:

```yaml
components:
  - name: frontend
    src: "./fe"
  - name: backend
    src: "./be"
```

Note the `src` property for each component: this is the path to the directory containing the `Dockerfile` for that component. Radix will try to build the image within that directory.

The `Dockerfile` should define - it is strongly recommended, when applicable - a **multi-stage build** in order to speed up the builds and make the resulting image as small as possible  also to avoid running debug versions of the code and servers. Python images usually run as is, but there is a "distroless" image like [these](https://github.com/GoogleContainerTools/distroless#docker) - we did not try them though.This means that we can decouple the build and deployment concerns. Here is an example for a simple Node.js single-page application:

```docker
FROM node:carbon-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.20-alpine
WORKDIR /app
COPY --from=builder /app/build /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER 101
```

Note how the first section uses a large image (`node`) which has the dependencies needed to build the component. In the second stage, the built files are copied into a small image (`nginx`) to serve them without all the build dependencies.


