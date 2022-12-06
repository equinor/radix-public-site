---
title: Example of multiple components application with the source in the sub-folders
---

# Example of multiple components application with the source in the sub-folders

A multiple components application can have source code in sub-folders of the GitHub repository. `Dockerfile`-s of these components also need to be in their sub-folders. 

Example:
#### GitHub repository
``` 
├── frontend
│   ├── app.js
│   └── Dockerfile
├── backend
│   ├── server.js
│   └── Dockerfile
└── radixconfig.yaml
```
#### Dockerfile of the frontend
```dockerfile
FROM node:alpine
WORKDIR /app
COPY . .
USER 1000
CMD ["node", "app.js"]
```
#### Dockerfile of the backend
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
    - name: web-app
      src: ./frontend
      ports:
        - name: http
          port: 8080
      publicPort: http
    - name: api
      src: ./backend
      ports:
        - name: http
          port: 8080
```
The path of the `web-app` component `./frontend` in the `src` refers to the sub-folder `frontend` of the repository. Equivalent can be `src: frontend`.

The path of the `api` component `./backend` in the `src` refers to the sub-folder `backend` of the repository. Equivalent can be `src: backend`.

Source folder of components can be deeper in the folder hierarchy. `Dockerfile`-s need to be in component folders, defined in the `src`.

Example for `src: source/app/frontend` or `src: ./source/app/backend`:
#### GitHub repository
```Github 
├── source
│   └──app
│      ├── frontend
│      │   ├── app.js
│      │   └── Dockerfile
│      └── backend
│          ├── server.js
│          └── Dockerfile
└── radixconfig.yaml
```
