# Radix example: injecting environment variables in a Single-Page-Application
**This is application files that should be reviewed as an example on how to inject environment variables into a single page application _at runtime_. Have a look and include what you need in your app.**

**We will not guarantee that this configuration is up to date**

This is a simple application that demonstrates how you can inject environment variables into a Single page Application (SPA) _at runtime_. Using environment variables in SPAs is something that frequently causes problems for users in Radix. This is because how environment variables are used is counter-intuitive.

The example is made using VITE, which is a popular framework for single page applications. The basic files have been scaffolded using the command `npm create vite@latest -- --template react`. We have then made amendments as described below.

The goal of this application is to create a radix application that
1. Shows "Local" when running in local development
2. Shows "Dev" when deployed to the `dev` envieonment of radix
3. Shows "Prod" when _promoted_ to the `prod` environment

In order to do this, we must use _runtime_ environment variables (and not e.g. build secrets).

### Common mistakes when wanting to use environment variables with a SPA
1. Trying to inject them _naively_ at runtime. This is an easy mistake to make, since it works during local development. During local development, (e.g.) Vite will read enivronment variables (and the content of `.env` files), and inject those variables into your code via `import.meta.env.VITE_ENVIRONMENT_VARIABLE` [(ref)](https://vite.dev/guide/env-and-mode). However, when deploying to a server, Vite reads those same variables during _build_. Since you typically want different variables for different environments, this will then fail you.
2. Treating the variables as secrets. The variables you inject will be served to your user. You should not use environment variables in your SPA in order to preserve secrets.
3. (In the context of radix) Trying to inject them as build variables. Build variables in radix are only passed to sub-pipelines. They will not be available while building the docker image of your component.

### Step-by-step guide
We will start by 'naively' injecting the environment variables. Edit `App.tsx` to print the environment:
```diff
<button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
+        <p>
+          Hello from {import.meta.env.VITE_DEPLOYMENT_ENVIRONMENT}
+        </p>
```
(and make sure to help your editor out by adding the definitions for the env varibales to vite-env.d.ts)
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEPLOYMENT_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

```
You can now specify `VITE_DEPLOYMENT_ENVIRONMENT` in your development environment (e.g. using `.env.local`), and things will work.

Having made something that works locally, we next set up a standard SPA build: We create a Dockerfile that first builds the app, and then serves it using nginx:

```dockerfile
# Dockerfile
FROM node:18-alpine3.16 AS build

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

# install app dependencies
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY --chown=101 --from=build /app/dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

USER 101

EXPOSE 8001
```

We next configure the environment variable in our radixconfig:
```yaml
#radixconfig.yaml
...
      environmentConfig:
        - environment: prod
          variables:
            VITE_DEPLOYMENT_ENVIRONMENT: "prod"
        - environment: test
          variables:
            VITE_DEPLOYMENT_ENVIRONMENT: "test"
```
As discussed, earlier, this does not work since the `VITE_*` variables have already been subsituted during the _build step_ of our app, while the environment variable only gets injected _at runtime_. 
To work around this, we need to rework our app so we can inject the environment variables. We will do this in accordance with [this step-by-step guide](https://medium.com/quadcode-life/vite-nginx-and-environment-variables-for-a-static-website-at-runtime-f3d0b2995fc7). Note that this is one of _many_ variations on what you can do to get the environment variables working.

We first create a single file called `environmentVariables.ts` in `src`. We populate it with the following content:
```typescript
// src/environmentVariables.ts
const envVars = {
  deploymentEnvironment: "${VITE_DEPLOYMENT_ENVIRONMENT}",
};
  
export function envVariables() {
  return {
    // In our production setup, ${VITE_DEPLOYMENT_ENVIRONMENT} will (should) be replaced from envVars via envsubst.
    // For local development, envsubst does not run (since we are not using nginx, but the Vite development server)
    // So we instead make use of the VITE_* env variables.
    deploymentEnvironment: !envVars.deploymentEnvironment.includes("{VITE_DEPLOYMENT_ENVIRONMENT}")
      ? envVars.deploymentEnvironment
      : import.meta.env.VITE_DEPLOYMENT_ENVIRONMENT as string,
  };
}
```
We will inject our environment variables into this file. Note that we are deliberately exporting a _function_ for our environment variables, rather than a plain object. This is to prevent the build step from optimizing away our injection target.

Next, we amend `App.tsx` to make use of our environment variables:
```diff
import './App.css'

+ import { envVariables } from './environmentVariables';

function App() {
...
-          Hello from {import.meta.env.VITE_DEPLOYMENT_ENVIRONMENT}
+          Hello from {envVariables().deploymentEnvironment}

```

We update vite.config.ts to have a predictable name for the environment variable injection file:
```diff
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
+  build: {
+    rollupOptions: {
+        output: {
+            format: 'es',
+            globals: {
+                react: 'React',
+                'react-dom': 'ReactDOM',
+            },
+            manualChunks(id) {
+                if (/environmentVariables.ts/.test(id)) {
+                    return 'environmentVariables'
+                }
+            },
+        },
+    }
+  }
})
```

Having done this, we can create an entry point file to inject the environment variables into the file `100-inject-envvars.sh`:
```shell
#!/usr/bin/env sh
#

envFile=$(ls -t /usr/share/nginx/html/assets/environmentVariables*.js | head -n1)
envsubst < "$envFile" > /tmp/envFile
cp /tmp/envFile "$envFile"
rm /tmp/envFile
```

We make sure that this file runs by copying it into the _special folder_ `/docker-entrypoint.d/`

```diff
# Dockerfile
...

+ COPY ./100-inject-envvars.sh /docker-entrypoint.d/100-inject-envvars.sh
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
...
```

Finally, we amend the nginx.conf to disable caching of the environment file, so that users will get updated variables if we need to change the environment of a deployment:

```diff
server {

  listen 8001;

  
  location ~* .(?:css|js)$ {
    root /usr/share/nginx/html;
    expires 1y;
    add_header Cache-Control "public";
+    location ~* environmentVariables.*.js$ {
+      add_header "Cache-Control" "no-store, no-cache, must-revalidate";
+    }
  }

  location / {
    root   /usr/share/nginx/html;
    index  index.html index.htm;
    try_files $uri $uri/ /index.html;

    location =/index.html {
      add_header "Cache-Control" "no-store, no-cache, must-revalidate" ;
    }
  }

  error_page   500 502 503 504  /50x.html;

  location = /50x.html {
    root   /usr/share/nginx/html;
  }

  gzip on;
  gzip_types      text/plain application/xml application/javascript application/x-javascript text/javascript text/xml text/css;
  gzip_proxied    no-cache no-store private expired auth;
  gzip_min_length 1000;

}
```