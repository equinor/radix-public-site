---
title: Example of multiple components application with the source in the root
---

# Example of multiple components application with the source in the root

A multiple components application can have source code in the root of the GitHub repository. `Dockerfile`-s of these components also need to be in the root, having different names. 

Example:
#### GitHub repository
``` 
├── frontend.js
├── backend.js
├── Dockerfile.frontend
├── Dockerfile.backend
└── radixconfig.yaml
```
The root of the repository contains files, belonging to all components. These files need to be selectively copied into the docker image by Dockerfile command `COPY`.

#### Dockerfile.frontend for the frontend
```dockerfile
FROM node:alpine
WORKDIR /app
COPY ./frontend.js .
USER 1000
CMD ["node", "frontend.js"]
```
Copy only files, belonging to the frontend. 

#### Dockerfile.backend for the backend
```dockerfile
FROM node:alpine
WORKDIR /app
COPY ./backend.js .
USER 1000
CMD ["node", "backend.js"]
```
Copy only files, belonging to the backend.

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
    - name: web-app
      dockerfileName: Dockerfile.frontend
      ports:
        - name: http
          port: 8080
      publicPort: http
    - name: api
      dockerfileName: Dockerfile.backend
      ports:
        - name: http
          port: 8080
```
The `dockerfileName` of the `web-app` component refers to the docker file `Dockerfile.frontend` of the repository.

The `dockerfileName` of the `api` component refers to the docker file `Dockerfile.backend` of the repository.

For some or all components source folders can be deeper in the folder hierarchy. `Dockerfile`-s need to be in these component folders, defined in the `src`.

Example:
#### GitHub repository
```Github 
├── backend.js
├── source
│   ├── frontend
│   │   ├── frontend
│   │   ├── app.js
│   │   └── Dockerfile.frontend
│   └── cache
│       ├── cache-app.js
│       └── Dockerfile
├── Dockerfile.backend
└── radixconfig.yaml
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
    - name: web-app
      src: ./source/frontend
      dockerfileName: Dockerfile.frontend
      ports:
        - name: http
          port: 8080
      publicPort: http
    - name: api
      dockerfileName: Dockerfile.backend
      ports:
        - name: http
          port: 8080
    - name: cache
      src: ./source/cache
      ports:
        - name: http
          port: 8080
```
In the example above:
* only components `web-app` and `cache` have an option `src`, as their source is located in sub-folders. 
* only components `web-app` and `api` have an option `dockerfileName`, as their docker files have names, different from the default name `Dockerfile`.