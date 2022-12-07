---
title: Example of multiple Radix applications with the source in the same GitHub repository
---

# Example of multiple Radix applications with the source in the same GitHub repository

A multiple Radix applications can have source code the same GitHub repository. Their components can use different or common sub-folders. `Dockerfile`-s of these components also need to be in their sub-folders. 

Example:
#### GitHub repository with applications, which can use common sources
``` 
├── frontend-app1
│   ├── app.js
│   └── Dockerfile
├── frontend-app2
│   ├── app.js
│   └── Dockerfile
├── backend
│   ├── server.js
│   └── Dockerfile
├── common
│   ├── proxy
│   │   ├── proxy.js
│   │   └── Dockerfile
│   └── cache
│       ├── cache.js
│       └── Dockerfile
├── Dockerfile.app1
├── Dockerfile.app2
├── radixconfig-app1.yaml
└── radixconfig-app2.yaml
```
#### radixconfig-app1.yaml
```yaml
kind: RadixApplication
metadata:
  name: radix-app1
spec:
  environments:
    - name: dev
      build:
        from: main
  components:
    - name: web-app
      src: ./frontend-app1
      ports:
        - name: http
          port: 8080
      publicPort: http
    - name: api
      src: ./backend
      ports:
        - name: http
          port: 8080
    - name: proxy
      src: ./proxy
      ports:
        - name: http
          port: 8000
```
#### radixconfig-app2.yaml
```yaml
kind: RadixApplication
metadata:
  name: radix-app2
spec:
  environments:
    - name: dev
      build:
        from: main
  components:
    - name: web-app
      src: ./frontend-app2
      ports:
        - name: http
          port: 8080
      publicPort: http
    - name: api
      src: ./backend
      ports:
        - name: http
          port: 8080
    - name: cache
      src: ./cache
      ports:
        - name: http
          port: 8001
```

Source code of applications can be located in own sub-folders. If docker files are also located in these folders, then they cannot share common sources, because docker file cannot refer to folders on the higher folder hierarchy level.  
#### GitHub repository with applications, located in their own sub-folders
``` 
├── docs
├── source
│   ├── app1
│   │   ├── frontend
│   │   │   ├── app.js
│   │   │   └── Dockerfile
│   │   └── backend
│   │       ├── server.js
│   │       └── Dockerfile
│   └── app2
│       ├── frontend
│       │   ├── app.js
│       │   └── Dockerfile
│       └── backend
│           ├── server.js
│           └── Dockerfile
├── radixconfig-app1.yaml
└── radixconfig-app2.yaml
```
