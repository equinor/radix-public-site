---
title: The radixconfig.yaml file
layout: document
parent: ["Docs", "../../docs.html"]
toc: true
---

# Overview

In order for Radix to configure your application it needs a configuration file. This must be placed in the root of your app repository and be named `radixconfig.yaml`. The file is expected in YAML or JSON format (in either case, it must have the `.yaml` extension).

> Radix only reads `radixconfig.yaml` from the branch we set as the `Config Branch` in the application registration form. If the file is changed in other branches, those changes will be ignored. The `Config Branch` must be mapped to an environment in `radixconfig.yaml`

The basic format of the file is this; the configuration keys are explained in the Reference section below:

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata: ...
spec: ...
```

# Reference

## `name`

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: myapp
spec:
```

`name` needs to match the name given in when registering an application. Only lowercase characters are allowed. If the name supplied in the configuration contains uppercase characters, a warning will be logged and the name will be automatically converted to lowercase.

## `build`

```yaml
spec:
  build:
    secrets:
      - SECRET_1
      - SECRET_2
```

The `build` section of the spec contains configuration needed during build (CI part) of the components. In this section you can specify build secrets, which is needed when pulling from locked registries, or cloning from locked repositories.

Add the secrets to Radix config `radixconfig.yaml` in the branch defined as `Config Branch` for your application. This will trigger a new build. This build will fail as no specified build secret has been set. You will now be able to set the secret **values** in the configuration section of your app in the Radix Web Console.

To ensure that multiline build secrets are handled ok by the build, **all** build secrets are passed base-64 encoded. This means that you will need to base-64 decode them before use:

```
FROM node:10.5.0-alpine

# Install base64
RUN apk update && \
    apk add coreutils

ARG SECRET_1

RUN echo "${SECRET_1}" | base64 --decode

```

## `environments`

```yaml
spec:
  environments:
    - name: dev
      build:
        from: master
    - name: prod
      build:
        from: release
```

The `environments` section of the spec lists the environments for the application and the branch each environment will build from. If you omit the `build.from` key for the environment, no automatic builds or deployments will be created. This configuration is useful for a promotion-based [workflow](../../guides/workflows/). 

We also support wildcard branch mapping using `*` and `?`. Examples of this are:

- `feature/*`
- `feature-?`
- `hotfix/**/*`

> The `Config Branch` set in the application registration form **must** be mapped to one of the `environments`

## `components`

This is where you specify the various components for your application - it needs at least one. Each component needs a `name`; this will be used for building the Docker images (appName-componentName). Source for the component can be; a folder in the repository, a dockerfile or an image.

> Note! `image` config cannot be used in conjunction with the `src` or the `dockerfileName` config.

### `src`

```yaml
spec:
  components:
    - name: frontend
      src: frontend
      ports:
        - name: http
          port: 8080
    - name: backend
      src: backend
      ports:
        - name: http
          port: 5000
```

Specify `src` for a folder (relative to the repository root) where the `Dockerfile` of the component can be found and used for building on the platform. It needs a list of `ports` exposed by the component, which map with the ports exposed in the `Dockerfile`. An alternative to this is to use the `dockerfileName` setting of the component.

### `dockerfileName`

```yaml
spec:
  components:
    - name: frontend
      dockerfileName: frontend.Dockerfile
      ports:
        - name: http
          port: 8080
    - name: backend
      dockerfileName: backend.Dockerfile
      ports:
        - name: http
          port: 5000
```

An alternative to this is to use the `dockerfileName` setting of the component.

### `image`

An alternative configuration of a component could be to use a publicly available image, this will not trigger any build of the component. An example of such a configuration would be:

```yaml
spec:
  components:
    - name: redis
      image: redis:5.0-alpine
    - name: swagger-ui
      image: swaggerapi/swagger-ui
      ports:
        - name: http
          port: 8080
      publicPort: http
```

### `publicPort`

```yaml
spec:
  components:
    - name: frontend
      publicPort: http
```

The `publicPort` field of a component, if set to `<PORT_NAME>`, is used to make the component accessible on the internet by generating a public endpoint. Any component without `publicPort: <PORT_NAME>` can only be accessed from another component in the app. If specified, the `<PORT_NAME>` should exist in the `ports` field.

### `ingressConfiguration`

```yaml
spec:
  components:
    - name: frontend
      ingressConfiguration:
        - websocketfriendly
```

The `ingressConfiguration` field of a component will add extra configuration by [annotations](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/) to the Nginx ingress, useful for a particular scenario.

> Note that the settings affect the connections with the public component, not between a public and a private component.

- `websocketfriendly` will change connection timeout to 1 hour for the component.
- `stickysessions` will change load balancing of the ingress to route to a single replica.
- `leastconnectedlb` will ensure that connections will be routed to the replica with least amount of load

See [this](https://github.com/equinor/radix-operator/blob/b828195f1b3c718d5a48e31d0bafe0435857f5bf/charts/radix-operator/values.yaml#L58) for more information on what annotations will be put on the ingress, given the configuration.

### `alwaysPullImageOnDeploy`

```yaml
spec:
  components:
    - name: api
      image: docker.pkg.github.com/equinor/my-app/api:latest
      alwaysPullImageOnDeploy: false
```

Only relevant for teams that uses another CI tool than Radix and static tags. See [deploy-only](../../guides/deploy-only/#updating-deployments-on-static-tags) for more information.

### `secrets`

```yaml
spec:
  components:
    - name: backend
      secrets:
        - DB_PASS
```

The `secrets` key contains a list of names. Values for these can be set via the Radix Web Console (under each active component within an environment). Each secret must be set on all environments. Secrets are available in the component as environment variables; a component will not be able to start without the secret being set.

### `resources` (common)

```yaml
spec:
  components:
    - name: backend
      resources:
        requests:
          memory: "64Mi"
          cpu: "50m"
        limits:
          memory: "64Mi"
          cpu: "1000m"
```

The `resources` section specifies how much CPU and memory each component needs, that are shared among all Radix environments in a component. These common resources are overriden by environment-specific resources.

### `variables` (common)

```yaml
spec:
  components:
    - name: backend
      variables:
        DB_NAME: my-db
```

The `variables` key contains environment variable names and their values, that are shared among all Radix environments in a component. These common environment variables are overriden by environment-specific environment variables that have exactly same names.

### `environmentConfig`

The `environmentConfig` section is to set environment-specific settings for each component.

#### `replicas`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          replicas: 2
```

`replicas` can be used to [horizontally scale](https://en.wikipedia.org/wiki/Scalability#Horizontal_and_vertical_scaling) the component. If `replicas` is not set, it defaults to `1`. If `replicas` is set to `0`, the component will not be deployed (i.e. stopped).

#### `monitoring`

```yaml
spec:
  components:
    - name: frontend
      environmentConfig:
        - environment: prod
          monitoring: true
```

The `monitoring` field of a component environment config, if set to `true`, is used to expose custom application metrics in the Radix monitoring dashboards. It is expected that the component provides a `/metrics` endpoint: this will be queried periodically (every five seconds) by an instance of [Prometheus](https://prometheus.io/) running within Radix. General metrics, such as resource usage, will always be available in monitors, regardless of this being set.

#### `authentication`

```yaml
spec:
  components:
    - name: frontend
      authentication:
        clientCertificate:
          verification: "optional_no_ca"
      environmentConfig:
        - environment: dev
          authentication:
            clientCertificate:
              verification: "off"
```

The `authentication` section can be used to configure an authentication option for either an entire component or a specific environment.

> Note that the environment config will override the component config for that specific environment.

#### `clientCertificate`

```yaml
spec:
  components:
    - name: frontend
      environmentConfig:
        - environment: prod
          authentication:
            clientCertificate:
              verification: "optional_no_ca"
              passCertificateToUpstream: true
```

`clientCertificate` is a subsection of [authentication](#authentication) and may be used to configure the Nginx Client Certificate Authentication.

> Note that the Client Certificate configuration will be omitted if the component does not have a public port.

* `verification` Specifies type of verification of client certificates. Possible values are:
  * `off`: Don't request client certificates and don't do client certificate verification. (default)
  * `on`: Request a client certificate that must be signed by a certificate that is included in the secret key ca.crt of the secret specified by `nginx.ingress.kubernetes.io/auth-tls-secret: secretName`. Failed certificate verification will result in a status code 400 (Bad Request).
  * `optional`: Do optional client certificate validation against the CAs from auth-tls-secret. The request fails with status code 400 (Bad Request) when a certificate is provided that is not signed by the CA. When no or an otherwise invalid certificate is provided, the request does not fail, but instead the verification result is sent to the upstream service.
  * `optional_no_ca`: Do optional client certificate validation, but do not fail the request when the client certificate is not signed by the CAs from `auth-tls-secret`. Certificate verification result is sent to the upstream service.

* `passCertificateToUpstream` Indicates if the received certificates should be passed or not to the upstream server in the header ssl-client-cert. `verification` will have to be set to something other than `off` for the certificate to be passed upstream. Possible values are `true` or `false` (default).

> If `verification` has been set to something other than `off` or `passCertificateToUpstream` is set to `true`, a valid certificate will need to be applied in the `Radix Console` for the affected environment(s). This can be found under `Environments\[environmentName]\[componentName]\[componentName]-clientcertca` in the `Radix Console` for your application.

#### `resources`

```yaml
spec:
  components:
    - name: frontend
      environmentConfig:
        - environment: prod
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "128Mi"
              cpu: "2000m"
```

The `resources` section specifies how much CPU and memory each component needs, that are defined per Radix environment in a component. `resources` is used to ensure that each component is allocated enough resources to run as it should. `limits` describes the maximum amount of compute resources allowed. `requests` describes the minimum amount of compute resources required. If `requests` is omitted for a component it defaults to the settings in `limits`. If `limits` is omitted, its value defaults to an implementation-defined value. [More info](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/)

For shared resources across Radix environments, refer to [common resources](./#resources-common).

#### `variables`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: dev
          variables:
            DB_HOST: "db-dev"
            DB_PORT: "1234"
        - environment: prod
          variables:
            DB_HOST: "db-prod"
            DB_PORT: "9876"
```

The `variables` key contains environment variable names and their values, that are defined per Radix environment in a component. In addition to what is defined here, running containers will also have some [environment variables automatically set by Radix](../topic-runtime-env/#environment-variables).

For shared environment variables across Radix environments, refer to [common environment variables](./#variables-common).

#### `horizontalScaling`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          horizontalScaling:
            minReplicas: 2
            maxReplicas: 6
```

The `horizontalScaling` field of a component environment config is used for enabling automatic scaling of the component in the environment. This field is optional, and if set, it will override `replicas` value of the component. One exception is when the `replicas` value is set to `0` (i.e. the component is stopped), the `horizontalScaling` config will not be used.

The `horizontalScaling` field contains two sub-fields: `minReplicas` and `maxReplicas`, that specify the minimum and maximum number of replicas for a component, respectively. The value of `minReplicas` must strictly be smaller or equal to the value of `maxReplicas`.

#### `imageTagName`

The `imageTagName` allows for flexible configuration of fixed images, built outside of Radix, to be configured with separate tag for each environment.

```yaml
components:
  - name: backend
    image: docker.pkg.github.com/equinor/myapp/backend:{imageTagName}
    environmentConfig:
      - environment: qa
        imageTagName: master-latest
      - environment: prod
        imageTagName: release-39f1a082
```

> See [this](../../guides/deploy-only/) guide on how make use of `imageTagName` in a deploy-only scenario.

### `volumeMounts`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          volumeMounts:
            - type: azure-blob
              name: volume-name
              storage: container-name
              path: /path/in/container/to/mount/to
```

The `volumeMounts` field configures volume mounts within the running component.

#### `volumeMounts` settings: 
* `name` - the name of the volume. Unique within `volumeMounts` list of a component
* `type` - type of storage. Supported types: 
  * `azure-blob` - mount a container from blob in [Azure storage account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview). Uses [CSI Azure blob storage driver](https://github.com/kubernetes-sigs/blob-csi-driver). Replaces obsolete type `blob` for Flex Volume obsolete driver.

_Applicable for type: `azure-blob`_
* `storage` - name of the blob container.
* `path` - the folder inside the running container, where the external storage is mounted.
* `gid` - Group ID (number) of a [mounted volume owner](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#podsecuritycontext-v1-core). It is a Group ID of a user in the running container within component replicas. Usually a user, which is a member of one or multiple [groups](https://en.wikipedia.org/wiki/Group_identifier), is specified in the `Dockerfile` for the component with command `USER`. Read [more details](https://www.radix.equinor.com/docs/topic-docker/#running-as-non-root) about specifying user within `Dockerfile`. It is recommended to use because Blobfuse driver do [not honor fsGroup securityContext settings](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/driver-parameters.md).  

There are [optional settings](../../guides/volume-mounts/optional-settings/) to fine tune volumes.

Access to the Azure storage need to be set in `secrets` for the component.

> See [this](../../guides/volume-mounts/) guide on how make use of `volumeMounts`.

#### `runAsNonRoot`

To accomodate a temporary way of managing which component and which environment will be run as non-root, this configuration option can be used. 

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          runAsNonRoot: false
        - environment: qa
          runAsNonRoot: true
```

The `runAsNonRoot` field of a component environment config is used to determine if the component should run as root in the environment.  

> See [this](../topic-docker/#running-as-non-root) on how to correctly configure your Dockerfile for running as non-root in Radix.

## `jobs`

This is where you specify the various [jobs](../../guides/configure-jobs) for your application.

### `src`

```yaml
spec:
  jobs:
    - name: compute
      src: compute
      schedulerPort: 8000
    - name: etl
      src: etl
      schedulerPort: 8000
```

See [src](#src) for a component for more information.

### `dockerfileName`

```yaml
spec:
  jobs:
    - name: compute
      dockerfileName: compute.Dockerfile
      schedulerPort: 8000
```

See [dockerfileName](#dockerfilename) for a component for more information.

### `image`

```yaml
spec:
  jobs:
    - name: compute
      image: privaterepodeleteme.azurecr.io/compute:latest
      schedulerPort: 8000
```

See [image](#image) for a component for more information.

### `schedulerPort`

```yaml
spec:
  jobs:
    - name: compute
      schedulerPort: 8000
```

The port number that the [job-scheduler](../../guides/configure-jobs/#job-scheduler) will listen to for HTTP requests to manage jobs. schedulerPort is a **required** field.

### `payload`

```yaml
spec:
  jobs:
    - name: compute
      schedulerPort: 8000
      payload:
        path: /compute/args
```

Job specific arguments must be sent in the request body to the [job-scheduler](../../guides/configure-jobs/#job-scheduler) as a JSON document with an element named `payload` and a value of type string.
The content of the payload is then mounted into the job container as a file named `payload` in the directory specified in the `payload.path`.
In the example above, a payload sent to the job-scheduler will be mounted as file `/compute/args/payload`

### `resources`

```yaml
spec:
  jobs:
    - name: compute
      resources:
        requests:
          memory: "256Mi"
          cpu: "400m"
        limits:
          memory: "384Mi"
          cpu: "600m"
```

See [resources](#resources-common) for more information.

### `secrets`

```yaml
spec:
  jobs:
    - name: compute
      schedulerPort: 8000
      secrets:
        - DB_PASS
```

See [secrets](#secrets) for a component for more information.

### `resources` (common)

```yaml
spec:
  jobs:
    - name: compute
      schedulerPort: 8000
      resources:
        requests:
          memory: "6Gi"
          cpu: "1000m"
        limits:
          memory: "12Gi"
          cpu: "2000m"
```

See [resources](#resources-common) for a component for more information.

### `variables` (common)

```yaml
spec:
  jobs:
    - name: compute
      schedulerPort: 8000
      variables:
        DB_NAME: my-db
```

See [variables](#variables-common) for a component for more information.

### `environmentConfig`

The `environmentConfig` section is to set environment-specific settings for each job.

#### `monitoring`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          monitoring: true
```

See [monitoring](#monitoring) for a component for more information.

#### `resources`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          resources:
            requests:
              memory: "6Gi"
              cpu: "1000m"
            limits:
              memory: "12Gi"
              cpu: "2000m"
```

See [resources](#resources) for a component for more information.

#### `variables`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: dev
          variables:
            DB_HOST: "db-dev"
            DB_PORT: "1234"
        - environment: prod
          variables:
            DB_HOST: "db-prod"
            DB_PORT: "9876"
```

See [variables](#variables) for a component for more information.

#### `imageTagName`

```yaml
jobs:
  - name: compute
    image: docker.pkg.github.com/equinor/myapp/compute:{imageTagName}
    environmentConfig:
      - environment: qa
        imageTagName: master-latest
      - environment: prod
        imageTagName: release-39f1a082
```

See [imageTagName](#imagetagname) for a component for more information.

#### `volumeMounts`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          volumeMounts:
            - type: azure-blob
              name: volume-name
              container: container-name
              path: /path/in/container/to/mount/to
```

See [volumeMounts](#volumemounts) for a component for more information.

#### `runAsNonRoot`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          runAsNonRoot: false
        - environment: qa
          runAsNonRoot: true
```

See [runAsNonRoot](#runasnonroot) for a component for more information.

## `dnsAppAlias`

```yaml
spec:
  dnsAppAlias:
    environment: prod
    component: frontend
```

As a convenience for nicer URLs, `dnsAppAlias` creates a DNS alias in the form of `<app-name>.app.radix.equinor.com` for the specified environment and component.

In the example above, the component **frontend** hosted in environment **prod** will be accessible from `myapp.app.radix.equinor.com`, in addition to the default endpoint provided for the frontend component, `frontend-myapp-prod.<clustername>.radix.equinor.com`.

## `dnsExternalAlias`

```yaml
spec:
  dnsExternalAlias:
    - alias: some.alias.com
      environment: prod
      component: frontend
    - alias: another.alias.com
      environment: prod
      component: frontend
```

It is possible to have multiple custom DNS aliases (i.e. to choose your own custom domains) for the application. The `dnsExternalAlias` needs to point to a component marked as public. It can be any domain name, which can in turn be used for public URLs to access the application — as long as the application developer provides a valid certificate for the alias. 

If public component is a `proxy` (like `oauth-proxy` in [this example](https://github.com/equinor/radix-example-oauth-proxy)), which is used as a public component, routing requests to `frontend` component - `dnsExternAlias.component` should point to this `proxy` component.   

In the example above, the component **frontend** hosted in environment **prod** will be accessible from both `some.alias.com` and `another.alias.com`, as long as the correct certificate has been set.

Once the configuration is set in `radixconfig.yaml`, two secrets for every external alias will be automatically created for the component: one for the TLS certificate, and one for the private key used to create the certificate.

There is a [detailed guide](../../guides/external-alias/) on how to set up external aliases.

## `privateImageHubs`

```yaml
spec:
  components:
    - name: webserver
      image: privaterepodeleteme.azurecr.io/nginx:latest
  privateImageHubs:
    privaterepodeleteme.azurecr.io:
      username: 23452345-3d71-44a7-8476-50e8b281abbc
      email: radix@statoilsrm.onmicrosoft.com
    privaterepodeleteme2.azurecr.io:
      username: 23423424-3d71-44a7-8476-50e8b281abb2
      email: radix@statoilsrm.onmicrosoft.com
```

It is possible to pull images from private image hubs during deployment for an application. This means that you can add a reference to a private image hub in radixconfig.yaml file using the `image:` tag. See example above. A `password` for these must be set via the Radix Web Console (under Configuration -> Private image hubs).

To get more information on how to connect to a private Azure container registry (ACR), see the following [guide](https://thorsten-hans.com/how-to-use-private-azure-container-registry-with-kubernetes). The chapter `Provisioning an Azure Container Registry` provide information on how to get service principle `username` and `password`. It is also possible to create a Service Principle in Azure AD, and then manually grant it access to your ACR.

> See [guide](../../guides/deploy-only/) on how make use of `privateImageHubs` in a deploy-only scenario.

## `node`

`node` section describes settings of [Kubernetes node](https://kubernetes.io/docs/concepts/architecture/nodes/) on which Radix application components or jobs are scheduled to run.

### `gpu`

```yaml
spec:
  components:
    - name: server
      ports:
        - name: http
          port: 3000
      node:
        gpu: nvidia-v100, -nvidia-k80
        gpuCount: 4
  jobs:
    - name: dev
      node:
        gpu: nvidia-k80
        gpuCount: 2
```

When a component should run on a Kubernetes node with a GPU card on it, this can be specified in the `gpu` key of the `node` section. 
```yaml
  node:
    gpu: nvidia-v100, nvidia-p100
```
Put one or multiple (comma separated) GPU types, which is currently supported by Radix Kubernetes cluster and which fits to component logic, which requires GPU.
Currently available nodes with GPUs:
* `nvidia-v100`, 1 GPU

```yaml
  node:
    gpu: nvidia-v100, -nvidia-k80
```
When particular type of GPUs do not fit to component's logic - prefix GPU type with _minus_ `-`, component will not be scheduled on nodes with such GPU types. 
```yaml
  node:
    gpu: nvidia-v100
    gpuCount: 4
```
When the component required multiple GPUs available on a node - put required minimum GPU count in the `gpuCount` key (default value is `1`). 

When `gpuCount` is specified, but `gpu` key is not set - component will be running on a node with any type of available GPU, which has required amount of GPUs. 
```yaml
  node:
    gpuCount: 4
```
# Example `radixconfig.yaml` file

This example showcases all options; in many cases the defaults will be a good choice instead.

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: myapp
spec:
  build:
    secrets:
      - SECRET_1
      - SECRET_2
  environments:
    - name: dev
      build:
        from: master
    - name: prod
  components:
    - name: frontend
      src: frontend
      ports:
        - name: http
          port: 8000
      publicPort: http
      authentication:
        clientCertificate:
          verification: "optional_no_ca"
      environmentConfig:
        - environment: prod
          monitoring: true
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "128Mi"
              cpu: "200m"
          authentication:
            clientCertificate:
              passCertificateToUpstream: true
        - environment: dev
          monitoring: false
          resources:
            requests:
              memory: "128Mi"
              cpu: "200m"
            limits:
              memory: "256Mi"
              cpu: "400m"
          authentication:
            clientCertificate:
              verification: "off"
              passCertificateToUpstream: false
    - name: backend
      src: backend
      ports:
        - name: http
          port: 5000
      environmentConfig:
        - environment: dev
          variables:
            DB_HOST: "db-dev"
            DB_PORT: "1234"
        - environment: prod
          replicas: 2
          variables:
            DB_HOST: "db-prod"
            DB_PORT: "9876"
      secrets:
        - DB_PASS
  jobs:
    - name: compute
      schedulerPort: 8000
      ports:
        - name: http
          port: 9000
      payload:
        path: /compute/args
      resources:
        requests:
          memory: "256Mi"
          cpu: "400m"
        limits:
          memory: "384Mi"
          cpu: "600m"
      variables:
        DB_NAME: "compute-db"
      secrets:
        - DB_USER
        - DB_PASS
      environmentConfig:
        - environment: dev
          variables:
            DB_HOST: "db-dev"
            DB_PORT: "1234"
        - environment: dev
          monitoring: true
          variables:
            DB_HOST: "db-prod"
            DB_PORT: "1234"
  dnsAppAlias:
    environment: prod
    component: frontend
  dnsExternalAlias:
    - alias: some.alias.com
      environment: prod
      component: frontend
    - alias: another.alias.com
      environment: prod
      component: frontend
```
