---
title: Example of single component application with the source in the root
---

# Example of single component application with the source in the root

A single component application can have source code in the root of the GitHub repository. The `Dockerfile` also need to be in the root repository. 

Example:
#### GitHub repository
``` 
├── server.js
├── Dockerfile
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
      src: .
      ports:
        - name: http
          port: 8080
      publicPort: http
```
The path `.` in the `src`  refers to the root of the repository, in such case this option can be omitted. 