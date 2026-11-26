---
title: Example of single component application with the source in the sub-folder
---

# Example of single component application with the source in the sub-folder

A single component application can have source code in the sub-folder of the GitHub repository. By default, Radix looks for the `Dockerfile` in this sub-folder. To use a `Dockerfile` from another location, set [`dockerfileName`](../../radix-config/index.md#dockerfilename) to a path relative to `src`, or to an absolute path from the repository root, like `/docker/Dockerfile`.

Example:

#### GitHub repository

```sh
/
├── app/
│   ├── server.js
│   └── Dockerfile
└── radixconfig.yaml
```

#### Dockerfile

```dockerfile
FROM node:alpine
WORKDIR /app
COPY . .
USER 1000
CMD ["node", "server.js"]
```

#### radixconfig.yaml

```yaml
kind: RadixApplication
metadata:
  name: radix-app-123
spec:
  environments:
    - name: dev
      build:
        from: main
  components:
    - name: web
      src: ./app
      ports:
        - name: http
          port: 8080
      publicPort: http
```

The path `./app` in the `src` refers to the sub-folder `app` of the repository. Equivalent can be `src: app`.

Source folder of the component can be deeper in the folder hierarchy. Radix looks for the `Dockerfile` in the folder defined in `src`, unless you set `dockerfileName`.

Example for `src: source/app` or `src: ./source/app`:

#### GitHub repository

```sh
/
├── source/
│   └──app/
│      ├── server.js
│      └── Dockerfile
└── radixconfig.yaml
```
