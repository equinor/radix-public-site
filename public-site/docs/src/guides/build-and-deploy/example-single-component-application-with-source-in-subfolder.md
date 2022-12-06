---
title: Example of single component application with the source in the sub-folder
---

# Example of single component application with the source in the sub-folder

A single component application can have source code in the sub-folder of the GitHub repository. The `Dockerfile` also need to be in this sub-folder. 

Example:
#### GitHub repository
``` 
├── app
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

Source folder of the component can be deeper in the folder hierarchy. `Dockerfile` need to be in this folder, defined in the `src`.

Example for `src: source/app` or `src: ./source/app`:
#### GitHub repository
```Github 
├── source
│   └──app
│      ├── server.js
│      └── Dockerfile
└── radixconfig.yaml
```
