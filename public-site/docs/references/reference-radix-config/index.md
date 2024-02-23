---
title: The radixconfig.yaml file
sidebarDepth: 3
---

# Overview

In order for Radix to configure your application it needs a configuration file. By default, it is expected to be located in the root of the application repository, has a name `radixconfig.yaml` and be in YAML or JSON format - in either case, it must have the `.yaml` or `.yml` extension (the name and extension should be exactly same as for the file in the GitHub repository). The name of the file and its location in the repository can be different. It can also be changed later on the Radix web-console configuration page for the application. Read more in the [monorepo](/docs/guides/monorepo) guide.

&gt; Radix only reads `radixconfig.yaml` from the branch, set as the `Config Branch` in the application registration form. If the file is changed in other branches, those changes will be ignored. The `Config Branch` must be mapped to an environment in the configuration file.

The basic format of the file is this; the configuration keys are explained in the Reference section below:

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata: ...
spec: ...
```

:::tip
You can enable auto completion and validation for `radixconfig.yaml` in your code editor. Read more about it [here](../reference-code-editor-integration/).
:::

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
    useBuildKit: true
    useBuildCache: true
    secrets:
      - SECRET_1
      - SECRET_2
    variables:
      VAR1: val1    
      CONNECTION_STRING: "Provider=MySQLProv;Data Source=mydb;"
```

The `build` section of the spec contains configuration needed during build (CI part) of the components. In this section you can specify build secrets, which is needed when pulling from locked registries, or cloning from locked repositories.

### `useBuildKit`
`useBuildKit` - (optional, default `false`) build a component with Docker BuildKit. Read  [more](/docs/guides/build-secrets/#build-secrets-with-buildkit) in the guide.

:::tip
When the option `useBuildKit` is set to `true`, Radix will use [buildah](https://www.redhat.com/en/topics/containers/what-is-buildah) to build the components. Buildah requires the `Dockerfile` instruction `FROM` to have a repository prefixing the docker image name.
Otherwise, there will be an error during the docker image build:
&gt; Error: creating build container: short-name resolution enforced but cannot prompt without a TTY

Example: instead of `FROM alpine` use `FROM docker.io/alpine`, as this `alpine` image is located in the [Docker Hub](https://hub.docker.com/) repository.
:::

### `useBuildCache`
`useBuildCache` - (optional, defaults to `true`) pushes all layers to cache, and uses it in future builds when possible. Requires `useBuildKit` to be enabled. Internally we set `--cache-to`, `--cache-from` and `--layers` in Buildah. Read more at [Buildahs Documentation](https://github.com/containers/buildah/blob/main/docs/buildah-build.1.md)

:::tip
Make sure you never store secrets or confidential information in any intermitent layer, multistage image, or in your final container image.
:::

### `secrets`
`secrets` - (optional) add secrets to Radix config `radixconfig.yaml` in the branch defined as `Config Branch` for your application. This will trigger a new build. This build will fail as no specified build secret has been set. You will now be able to set the secret **values** in the configuration section of your app in the Radix Web Console. These secrets also can be used in the [sub-pipelines](/docs/guides/sub-pipeline).

### `variables`
`variables` - (optional, available only in [sub-pipelines](/docs/guides/sub-pipeline)) environment variables names and values, provided for all build Radix environments in [sub-pipelines](/docs/guides/sub-pipeline). These common environment variables are overridden by environment-specific environment variables with the same names.

:::tip
* When an option `useBuildKit: false`, to ensure that multiline build secrets are handled correct by the build, **all** build secrets are passed as `ARG`-s during container build, base-64 encoded (they need to be decoded before use). 
* When an option `useBuildKit: true`, build secrets are not available as `ARG`-s during container build, but they can be mounted as files. Secret values are not base-64 encoded in these files.

Read the [build secrets](/docs/guides/build-secrets/) guide to see how to use build secrets in a Dockerfile.
:::

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

The `environments` section of the spec lists the environments for the application.

&gt; The `Config Branch` set in the application registration form **must** be mapped to the name of one of the `environments`.

### `name`

The name of the environment. Can be `dev`, `qa`, `production` etc.

### `build`

`from` specifies which branch each environment will build from. If `from` is not specified for the environment, no automatic builds or deployments will be created. This configuration is useful for a promotion-based [workflow](/docs/start/workflows/#promotion).

Wildcard branch mapping is also support, using `*` and `?`. Examples:

- `feature/*`
- `feature-?`
- `hotfix/**/*`

`variables` - environment variable names and values (currently available only in [sub-pipelines](/docs/guides/sub-pipeline)), provided for specific environments. They override common environment variables with the same names, if specified in the `spec.build.variables`.  

A text input field, will be available to put a full branch name for a build environment.  

Example:

```yaml
spec:
  build:
    variables:
      VAR1: val1
      CONNECTION_STRING: "Provider=MySQLProv;Data Source=prodDb;"
  environments:
    - name: dev
      build:
        from: main
        variables:
          VAR1: "val1-for-dev"  #overrides common env-var VAR1 in the "dev" external pipeline
          CONNECTION_STRING: "Provider=MySQLProv;Data Source=devDb;" #overrides common env-var CONNECTION_STRING in the "dev" custom sub-pipeline
    - name: prod
      build:
        from: release
        variables:
          VAR3: val3 #env-var VAR3 only exists in the "prod" custom sub-pipeline, in addition to common VAR1 and CONNECTION_STRING 
```

### `egress`

```yaml
spec:
  environments:
    - name: dev
      build:
        from: master
      egress:
        allowRadix: true
        rules:
        - destinations: 
          - "143.97.5.5/32"
          - "143.97.6.1/32"
          ports:
          - port: 443
            protocol: TCP
    - name: prod
      build:
        from: release
```

Specify `egress` with settings for which egress traffic is allowed from all components and jobs in the environment.

`allowRadix` can be set to `true` or `false` to allow or deny traffic to other applications in Radix. The default value is `false`.

`rules` can be defined with a list of legal `destinations` and `ports` for egress traffic. Each entry in `destinations` must be a string representing a valid IPv4 mask. Each entry in `ports` must be an object with a valid TCP/UDP `port` number and `protocol` equal to either "TCP" or "UDP". If one or more egress rules are defined, any traffic not allowed by the egress rules will be blocked. If no egress rules are defined, all traffic is allowed.

See [the egress configuration guide](/docs/guides/egress-config/) for usage patterns and tips and tricks.

&gt; Note! If an `environment` has defined the `egress` field, all traffic is blocked by default. If `egress` is not defined, all traffic is allowed.
&gt; Note! If your application uses a custom OAuth2 implementation, outbound access to Microsoft authentication endpoints must be allowed. See [allow traffic for OAuth2](/docs/guides/egress-config/#allow-traffic-for-oauth2).

## `components`

This is where you specify the various components for your application - it needs at least one. Each component needs a `name`; this will be used for building the Docker images (appName-componentName). Source for the component can be; a folder in the repository, a dockerfile or an image.

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

`src` a folder, relative to the repository root, where the `Dockerfile` for the component is located. The Dockerfile is used by the [Build and deploy](/docs/guides/build-and-deploy/) workflow of the Radix CI-CD pipeline to build a container image for the component. By default `src` is `.` - a root of the GitHub repository.

&gt; When the `image` option is set - `src` option is ignored.

### `dockerfileName`

```yaml
spec:
  components:
    - name: frontend
      dockerfileName: Dockerfile # Absolute path from repository root: /Dockerfile
      ports:
        - name: http
          port: 8080
    - name: backend
      src: .
      dockerfileName: backend/Dockerfile # Absolute path from repository root: /backend/Dockerfile
      ports:
        - name: http
          port: 5000
    - name: api
      src: api
      dockerfileName: "../Dockerfile" # Absolute path from repository root: /Dockerfile
      ports:
        - name: http
          port: 5000
    - name: web
      src: web
      dockerfileName: "subfolder/Dockerfile" # Absolute path from repository root: /web/subfolder/Dockerfile
      ports:
        - name: http
          port: 5000          
```

By default, Radix pipeline expects a docker file with a name `Dockefile` in the component `src` folder. If this file name needs to be different, it can be specified in the option `dockerfileName`. The name can also contain a path relative to `src`. See configuration examples above.

&gt; When the `image` option is set - `dockerfileName` option is ignored.

### `image`

An alternative configuration of a component could be to use an existing container image, which can be specified in the option `image`. When this option is set for a component - the component will be not build, but only deployed with this image. An example of such a configuration:

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

&gt; - When a container image is from the DockerHub repository, it is enough to specify only the image name. Examples:
&gt;   - `image: redis:latest`
&gt;   - `image: redis:7.0.5`.
&gt; - When an image is located in another container registry, the image name need to have the container registry URL. Example:
&gt;   - `image: gcr.io/distroless/nodejs18-debian11`.
&gt;   - `image: gcr.io/distroless/nodejs18-debian11:latest`.
&gt; - When an image is not publicly available, it is required to provide an authentication information. Please read more about [privateImageHubs](./#privateimagehubs) option.

### `ports`
```yaml
spec:
  components:
    - name: frontend
      ports:
        - name: http
          port: 8000
        - name: api
          port: 8001
```
A component can optionally have one or several ports:
* `name` - internal name of a port, used as a reference within the radixconfig. It needs to be unique within the component `ports` list.
* `port` - numeric value of a port, in the range between 1024 and 65535. It needs to be unique within the component `ports` list.

A component doesn't need to have ports. If it has at least one port, it has to respond to TCP or HTTP requests, sent to this port. Kubernetes [readiness probe](/docs/docs/topic-rollingupdate/#readiness-probe) will regularly request the first port in the `ports` list to ensure that the component can handle requests. 

When a new component version is deployed, the probe waits until replicas of the new component version start responding to such requests, keeping them in the "Starting" state. When the new replicas respond to these requests, the [rolling update](/docs/docs/topic-rollingupdate/) will remove the replicas of the old component version 

### `publicPort`

```yaml
spec:
  components:
    - name: frontend
      publicPort: http
```

The `publicPort` field of a component, if set to `&lt;PORT_NAME&gt;`, is used to make the component accessible on the internet by generating a public endpoint. Any component without `publicPort: &lt;PORT_NAME&gt;` can only be accessed from another component in the app. If specified, the `&lt;PORT_NAME&gt;` should exist in the `ports` field.

:::tip
If no [ports](./#ports) specified for a component, `publicPort` should not be set.
:::

### `monitoringConfig`

```yaml
spec:
  components:
    - name: frontend
      ports:
        - name: http
          port: 8000
        - name: metrics
          port: 1234
      monitoringConfig:
        portName: metrics
        path: /my-metrics
```

The `monitoringConfig` field of a component can be used to override the default port and/or path used for `monitoring`. Both fields are optional and are by default set to use the first available port and the path as `/metrics`.

&gt; Note: If overriding `portName` it will have to match one of the defined ports in the component.

### `ingressConfiguration`

```yaml
spec:
  components:
    - name: frontend
      ingressConfiguration:
        - websocketfriendly
```

The `ingressConfiguration` field of a component will add extra configuration by [annotations](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/) to the Nginx ingress, useful for a particular scenario.

&gt; Note that the settings affect the connections with the public component, not between a public and a private component.

- `websocketfriendly` will change connection timeout to 1 hour for the component.
- `stickysessions` will change load balancing of the ingress to route to a single replica.
- `leastconnectedlb` will try to route connection to the replica with least amount of load

See [this](https://github.com/equinor/radix-operator/blob/b828195f1b3c718d5a48e31d0bafe0435857f5bf/charts/radix-operator/values.yaml#L58) for more information on what annotations will be put on the ingress, given the configuration. See [nginx documentation](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/#choosing-a-load-balancing-method) for details about how the native nginx load balancing methods work.

### `alwaysPullImageOnDeploy`

```yaml
spec:
  components:
    - name: api
      image: docker.pkg.github.com/equinor/my-app/api:latest
      alwaysPullImageOnDeploy: false
```

Only relevant for teams that uses another CI tool than Radix and static tags. See [deploy-only](/docs/guides/deploy-only/#updating-deployments-on-static-tags) for more information.

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
          cpu: "1000m"
```

The `resources` section specifies how much CPU and memory each component needs, that are shared among all Radix environments in a component. These common resources are overridden by environment-specific resources.

The property `limits.memory` cannot be explicitly set, it is set automatically with the same value as `requests.memory` to reduce potential risk of not sufficient memory on a node. [Read more](https://kubernetes.io/blog/2021/11/26/qos-memory-resources/) about memory resources and QoS. 

### `variables` (common)

```yaml
spec:
  components:
    - name: backend
      variables:
        DB_NAME: my-db
```

The `variables` key contains environment variable names and their values, that are shared among all Radix environments in a component. These common environment variables are overridden by environment-specific environment variables that have exactly same names.

Environment variables [can be changed](/docs/guides/environment-variables/) in Radix Console.

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
              cpu: "2000m"
```

The `resources` section specifies how much CPU and memory each component needs, that are defined per Radix environment in a component. `resources` is used to ensure that each component is allocated enough resources to run as it should. `limits` describes the maximum amount of compute resources allowed. `requests` describes the minimum amount of compute resources required. If `requests` is omitted for a component it defaults to the settings in `limits`. If `limits` is omitted, its value defaults to an implementation-defined value. [More info](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/)

The property `limits.memory` cannot be explicitly set, it is set automatically with the same value as `requests.memory`

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

The `variables` key contains environment variable names and their values, that are defined per Radix environment in a component. In addition to what is defined here, running containers will also have some [environment variables automatically set by Radix](/docs/docs/topic-runtime-env/#environment-variables).

For shared environment variables across Radix environments, refer to [common environment variables](./#variables-common).

#### `horizontalScaling`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          horizontalScaling:
            resources:
                memory:
                  averageUtilization: 75
                cpu:
                  averageUtilization: 85
            minReplicas: 2
            maxReplicas: 6
```

The `horizontalScaling` field of a component environment config is used for enabling automatic scaling of the component in the environment. This field is optional, and if set, it will override the `replicas` value of the component. One exception is when the `replicas` value is set to `0` (i.e. the component is stopped), the `horizontalScaling` config will not be used.

The `horizontalScaling` field contains two sub-fields, `minReplicas` and `maxReplicas`, and one subsection, `resources`. The `minReplicas` and `maxReplicas` fields specify the minimum and maximum number of replicas for a component, respectively. The value of `minReplicas` must strictly be smaller or equal to the value of `maxReplicas`. Memory and CPU scaling thresholds are determined by the `resources.memory.averageUtilization` and `resources.cpu.averageUtilization` fields. The value of `averageUtilization` must be greater than 1. If the `horizontalScaling.resources` section is omitted from the environment config, the `cpu.averageUtilization` will default to a value of 80. However, if `memory.averageUtilization` is defined while `cpu.averageUtilization` is undefined, CPU based autoscaling will be disabled for this component.

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

&gt; See [this](/docs/guides/deploy-only/) guide on how make use of `imageTagName` in a deploy-only scenario.

### `volumeMounts`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          volumeMounts:
            - name: volume-name
              path: /path/in/container/to/mount/to
              blobfuse2:
                container: container-name
                uid: 1000
```

The `volumeMounts` field configures volume mounts within the running component.

#### `volumeMounts` settings

- `name` - the name of the volume. Unique within `volumeMounts` list of a component
- `path` - the folder inside the running container, where the external storage is mounted.
- `blobfuse2` - mount a container from blob in [Azure storage account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview). Uses [CSI Azure blob storage driver](https://github.com/kubernetes-sigs/blob-csi-driver). Replaces types `blob` and `azure-blob` for obsolete drivers.

_Options for `blobfuse2`_
  - `protocol` - (optional) a protocol, supported by the BlobFuse2. Currently, supports `fuse2` (default) and `nfs`.
  - `container` - name of the blob container.
  - `uid` and/or `gid` - User ID and/or group ID (numbers) of a [mounted volume owner](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#podsecuritycontext-v1-core). It is a User ID and Group ID of a user in the running container within component replicas. Usually a user, which is a member of one or multiple [groups](https://en.wikipedia.org/wiki/Group_identifier), is specified in the `Dockerfile` for the component with command `USER`. Read [more details](https://www.radix.equinor.com/docs/topic-docker/#running-as-non-root) about specifying user within `Dockerfile`. It is recommended to use because Blobfuse driver do [not honor fsGroup securityContext settings](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/driver-parameters.md).
  - `useAdls` - (optional) enables blobfuse to access Azure DataLake storage account. When set to false, blobfuse will access Azure Block Blob storage account, hierarchical file system is not supported. Default `false`. This must be set `true` when [HNS enabled account](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-namespace) is mounted.
  - `streaming` - (optional) defines a file streaming. When it is turned on (it is by default), files, opened by a container in its volume mount are not cached on a node, but read directly from a blob storage. It is recommended to use. When it is turned off, files are cached on a node, but it may cause a problem with a limited node disk available space.

    _Options for `streaming`_
    - `enabled` - (optional) turn on/off a file streaming. Default is `true`

There are [optional settings](/docs/guides/volume-mounts/optional-settings/) to fine tune volumes.

Access to the Azure storage need to be set in `secrets` for the component.

&gt; See [this](/docs/guides/volume-mounts/) guide on how make use of `volumeMounts`.

### `authentication`

```yaml
spec:
  components:
    - name: frontend
      authentication:
        clientCertificate: ...
        oauth2: ...
      environmentConfig:
        - environment: dev
          authentication:
            clientCertificate: ...
            oauth2: ...
```

The `authentication` section can be used to configure an authentication option for either an entire component or a specific environment.

&gt; Note that the environment config will override the component config for that specific environment.

#### `clientCertificate`

```yaml
clientCertificate:
  verification: "optional_no_ca"
  passCertificateToUpstream: true
```

`clientCertificate` is a subsection of [authentication](#authentication) and may be used to configure the Nginx Client Certificate Authentication.

&gt; Note that the Client Certificate configuration will be omitted if the component does not have a public port.

- `verification` Specifies type of verification of client certificates. Possible values are:
  - `off`: Don't request client certificates and don't do client certificate verification. (default)
  - `on`: Request a client certificate that must be signed by a certificate that is included in the secret key ca.crt of the secret specified by `nginx.ingress.kubernetes.io/auth-tls-secret: secretName`. Failed certificate verification will result in a status code 400 (Bad Request).
  - `optional`: Do optional client certificate validation against the CAs from auth-tls-secret. The request fails with status code 400 (Bad Request) when a certificate is provided that is not signed by the CA. When no or an otherwise invalid certificate is provided, the request does not fail, but instead the verification result is sent to the upstream service.
  - `optional_no_ca`: Do optional client certificate validation, but do not fail the request when the client certificate is not signed by the CAs from `auth-tls-secret`. Certificate verification result is sent to the upstream service.

- `passCertificateToUpstream` Indicates if the received certificates should be passed or not to the upstream server in the header ssl-client-cert. `verification` will have to be set to something other than `off` for the certificate to be passed upstream. Possible values are `true` or `false` (default).

&gt; If `verification` has been set to something other than `off` or `passCertificateToUpstream` is set to `true`, a valid certificate will need to be applied in the `Radix Console` for the affected environment(s). This can be found under `Environments\[environmentName]\[componentName]\[componentName]-clientcertca` in the `Radix Console` for your application.

#### `oauth2`

Configuration for adding OAuth2 authorization with OIDC to the component.

Common `oauth2` settings can be configured at component level and/or in the component's `environmentConfig` section. Properties configured in the `environmentConfig` section override properties at component level. The component must also be configured with a [publicPort](#publicport).

When OAuth2 is configured for a component, Radix creates an OAuth2 service (using [OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/)) to handle the OAuth2 authorization code flow, and to verify the authorization state of incoming requests to the component.

:::tip
If no [ports](./#ports) specified for a component, `authentication.oauth2` should not be set.
:::

The OAuth2 service handles incoming requests to the path _/oauth2_ (or the path defined in _proxyPrefix_) for all public DNS names configured for a component. Valid _redirect URIs_ must be registered for the application registration in Azure AD, e.g. `https://myapp.app.radix.equinor.com/oauth2/callback`.  
See [guide](/docs/guides/authentication/#configuration) for more information.

```yaml
oauth2:
  clientId: ceeabc6f-93f0-41d2-9fe1-ca671b365f6f
  scope: openid profile email offline_access 2b06f36c-5a78-45a6-9809-44816f59c1ff/user.read
  setXAuthRequestHeaders: true
  setAuthorizationHeader: true
  proxyPrefix: /oauth2
  oidc:
    issuerUrl: https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/v2.0
    jwksUrl: https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/discovery/v2.0/keys
    skipDiscovery: false
    insecureSkipVerifyNonce: false
  loginUrl: https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/v2.0/authorize
  redeemUrl: https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/v2.0/token
  sessionStoreType: redis # redis or cookie
  redisStore:
    connectionUrl: rediss://app-session-store.redis.cache.windows.net:6380
  cookieStore:
    minimal: false
  cookie:
    name: _oauth2_proxy
    expire: 168h0m0s
    refresh: 60m0s
    sameSite: lax
```

- `clientId` Required - The client ID of the application, e.g. the application ID of an application registration in Azure AD.

- `scope` Optional. Default **openid profile email** - List of OIDC scopes and identity platform specific scopes. More information about scopes when using the Microsoft Identity Platform can be found [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent).
- `setXAuthRequestHeaders` Optional. Default **false** - Adds claims from the access token to the _X-Auth-Request-User_, _X-Auth-Request-Groups_, _X-Auth-Request-Email_ and _X-Auth-Request-Preferred-Username_ request headers. The Access Token is added to the _X-Auth-Request-Access-Token_ header.
- `setAuthorizationHeader` Optional. Default **false** - Adds the OIDC ID Token in the _Authorization: Bearer_ request header.
- `proxyPrefix` Optional. Default **/oauth2** - The root path that the OAuth2 proxy should be nested under. The OAuth2 proxy exposes various [endpoints](https://oauth2-proxy.github.io/oauth2-proxy/docs/features/endpoints) from this root path.
- `oidc` OIDC configuration
  - `issuerUrl` Optional. Default **&lt;https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/v2.0&gt;** - OIDC issuer URL. The default value is set to the Equinor Azure tenant ID. Read more about Microsoft OIDC issuer URLs [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc#fetch-the-openid-connect-metadata-document).
  - `jwksUrl` Optional - OIDC JWKS URL for token verification. Required if `skipDiscovery` is set to **true**.
  - `skipDiscovery` Optional. Default **false** - Skip automatic discovery OIDC endpoints. `jwksURl`, `loginUrl` and `redeemUrl` must be specified if `skipDiscovery` is **true**.
  - `insecureSkipVerifyNonce` Optional. Default **false**. Skip verifying the OIDC ID Token's nonce claim. Should only be enabled with OIDC providers that does not support the nonce claim.
- `loginUrl` Optional - The authorization URL. Required if `skipDiscovery` is set to **true**.
- `redeemUrl` Optional - The URL used to redeem authorization code and refresh token. Required if `skipDiscovery` is set to **true**.
- `sessionStoreType` Optional. Default **cookie**. Allowed values: **cookie**, **redis** - Defines where session data shall be stored.
- `redisStore` Redis session store configuration if `sessionStoreType` is **redis**.
  - `connectionUrl` Connection URL of redis server.
- `cookieStore` Cookie session store configuration if `sessionStoreType` is **cookie**.
  - `minimal` Optional. Default **false**. Strips ID token, access token and refresh token from session store cookies. `setXAuthRequestHeaders` and `setAuthorizationHeader` must be set to **false**, and `cookie.refresh` must be set to **0**.
- `cookie` Session cookie configuration
  - `name` Optional. Default **_oauth2_proxy**. Name of the session cookie. If `sessionStoreType` is **cookie**, the ID token and access token is stored in cookies prefixed with this name.
  - `expire` Optional. Default **168h0m0s**. Expire timeframe for session cookies. Controls the _Expires_ cookie attribute.
  - `refresh` Optional. Default **60m0s**. Refresh interval defines how often the OAuth2 service should redeem the refresh token to get a new access token. The session cookie's _Expires_ is updated after refresh.
  - `sameSite` Optional. Default **lax**. The _SameSite_ attribute for the session cookie.

&gt; See [guide](/docs/guides/authentication/#using-the-radix-oauth2-feature) on how to configure OAuth2 authentication for a component.

### `enabled`

Component can be disabled or enabled for all specific environment configurations.

```yaml
spec:
  components:
    - name: backend
      enabled: false
```

Disabled component is not deployed. When a disabling component is already deployed, this component is removed from the application environment on next deployment - this is an equivalent of removing of the component configuration from the `radixconfig.yaml`.

When the option `enabled` is not set, the component is enabled.

The component can be disabled in specific environment configurations.

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          enabled: false
```

Read more details in the [guide](/docs/guides/enable-and-disable-components/).

[Job](./#jobs) components can be disabled similar way.

### `identity`

```yaml
spec:
  components:
    - name: backend
      identity:
        azure:
          clientId: 00000000-0000-0000-0000-000000000000
      environmentConfig:
        - environment: prod
          identity: ...
```

The `identity` section enables mounting of a JWT (JSON web token) that can be used as a federated credential with the [OAuth2 client credentials flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#third-case-access-token-request-with-a-federated-credential) to request an access token for an Azure AD application registration or managed identity.  
The following environment variables are added to the replicas automatically when `identity` is enabled:

- **AZURE_AUTHORITY_HOST** (`https://login.microsoftonline.com/`)
- **AZURE_CLIENT_ID** (value from `clientId` in configuration, e.g. `b96d264b-7053-4465-a4a7-32be5b0fec49`)
- **AZURE_FEDERATED_TOKEN_FILE** (path to the file containg the JWT, e.g. `/var/run/secrets/azure/tokens/azure-identity-token`)
- **AZURE_TENANT_ID** (e.g. `3aa4a235-b6e2-48d5-9195-7fcf05b459b0`)

`identity` can be configured on the component/job level and/or per environment in the `environmentConfig` section. Configuration in `environmentConfig` overrides configuration on the component/job level.

See [guide](/docs/guides/workload-identity) for more information.

## `jobs`

This is where you specify the various [jobs](/docs/guides/jobs) for your application.

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

The port number that the [job-scheduler](/docs/guides/jobs/job-manager-and-job-api.md) will listen to for HTTP requests to manage jobs. schedulerPort is a **required** field.

### `notifications`

```yaml
spec:
  jobs:
    - name: compute
      notifications:
        webhook: http://api:8080/monitor-batch-status
```

`webhook` is an optional URL to the Radix application component or job component which will be called when any of the job-component's running jobs or batches changes states. Only changes are sent by POST method with a `application/json` `ContentType` in a [batch event format](/docs/guides/jobs/notifications.md#radix-batch-event). Read [more](/docs/guides/jobs/notifications)

### `monitoringConfig`

```yaml
spec:
  jobs:
    - name: compute
      ports:
        - name: metrics
          port: 1234
      monitoringConfig:
        portName: metrics
        path: /my-metrics
```

See [monitoringConfig](#monitoringConfig) for a component for more information.

### `payload`

```yaml
spec:
  jobs:
    - name: compute
      schedulerPort: 8000
      payload:
        path: /compute/args
```

Job specific arguments must be sent in the request body to the [job-scheduler](/docs/guides/jobs/job-manager-and-job-api.md) as a JSON document with an element named `payload` and a value of type string.
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

### `timeLimitSeconds`

```yaml
spec:
  jobs:
    - name: compute
      schedulerPort: 8000
      timeLimitSeconds: 120
```

The maximum number of seconds a job can run. If the job's running time exceeds the limit, it will be automatically stopped with status `Failed`. The default value is `43200` seconds, 12 hours.

`timeLimitSeconds` applies to the total duration of the job, and takes precedence over `backoffLimit`. Once `timeLimitSeconds` has been reached, the job will be stopped with status `Failed` even if `backoffLimit` has not been reached.

### `backoffLimit`

```yaml
spec:
  jobs:
    - name: compute
      backoffLimit: 5
```

Defines the number of times a job will be restarted if its container exits in error. Once the `backoffLimit` has been reached the job will be marked as `Failed`. The default value is `0`.

### `environmentConfig`

The `environmentConfig` section is to set environment-specific settings for each job.

#### `notifications`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          notifications:
            webhook: http://api:8080/monitor-batch-status
```

See [notifications](#notifications) for a component for more information.

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
            - name: volume-name
              path: /path/in/container/to/mount/to
              blobfuse2:
                container: container-name
                uid: 1000
```

See [volumeMounts](#volumemounts) for a component for more information.

#### `timeLimitSeconds`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          timeLimitSeconds: 130
```

See [timeLimitSeconds](#timelimitseconds) for more information.

#### `backoffLimit`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          backoffLimit: 10
```

See [backoffLimit](#backofflimit) for more information.

### `identity`

```yaml
spec:
  jobs:
    - name: compute
      identity:
        azure:
          clientId: 00000000-0000-0000-0000-000000000000
      environmentConfig:
        - environment: prod
          identity: ...
```

See [identity](#identity) for more information.

## `dnsAppAlias`

```yaml
spec:
  dnsAppAlias:
    environment: prod
    component: frontend
```

As a convenience for nicer URLs, `dnsAppAlias` creates a DNS alias in the form of `&lt;app-name&gt;.app.radix.equinor.com` for the specified environment and component.

In the example above, the component **frontend** hosted in environment **prod** will be accessible from `myapp.app.radix.equinor.com`, in addition to the default endpoint provided for the frontend component, `frontend-myapp-prod.&lt;clustername&gt;.radix.equinor.com`.

## `dnsAlias`

```yaml
spec:
  dnsAlias:
    - alias: myapp
      environment: prod
      component: frontend
```

`dnsAlias` creates one or several DNS aliases in the form of `&lt;alias&gt;.radix.equinor.com` for the specified environment and component. There are few reserved aliases which cannot be used: 

`www`, `app`, `api`, `console`, `webhook`, `playground`, `dev`, `grafana`, `prometheus`, `canary`, `cost-api`. 

In the example above, the component **frontend** hosted in environment **prod** will be accessible from `myapp.radix.equinor.com` (or for the Playground: `myapp.playground.radix.equinor.com`), in addition to the default endpoint provided for the frontend component `frontend-myapp-prod.radix.equinor.com` (or for the Playground: `frontend-myapp-prod.playground.radix.equinor.com`).

## `dnsExternalAlias`

```yaml
spec:
  dnsExternalAlias:
    - alias: some.alias.com
      environment: prod
      component: frontend
      useCertificateAutomation: [false|true]
    - alias: another.alias.com
      environment: prod
      component: frontend
      useCertificateAutomation: [false|true]
```

It is possible to have multiple custom DNS aliases (i.e. to choose your own custom domains) for the application. The `dnsExternalAlias` needs to point to a component marked as public. It can be any domain name, which can in turn be used for public URLs to access the application. 

In the example above, the component **frontend** hosted in environment **prod** will be accessible from both `some.alias.com` and `another.alias.com`, as long as the correct certificate has been set.

The `useCertificateAutomation` property defines how the TLS certificate for the alias is issued. When set to `true`, certificate issuing and renewal is automatically handled by Radix, and when set to `false`, the application administrator is responsible for providing a valid certificate and private key. If the value is toggled, Radix deletes the existing certificate and private key. This will cause a TLS error when accessing the external DNS alias until a new certificate and private key is set.

There is a [detailed guide](/docs/guides/external-alias/) on how to set up external aliases.

## `privateImageHubs`

```yaml
spec:
  components:
    - name: webserver
      image: myappacr.azurecr.io/myapp-base:latest
  privateImageHubs:
    myappacr.azurecr.io:
      username: 23452345-3d71-44a7-8476-50e8b281abbc
      email: radix@statoilsrm.onmicrosoft.com
```

It is possible to pull images from private image hubs during deployment for an application. This means that you can add a reference to a private image hub in radixconfig.yaml file using the `image:` tag. See example above. 

With the `useBuildKit: true` setting in your `radixconfig.yaml`, you can also use privateImageHub credentials within the Dockerfile `FROM` instruction. 
```dockerfile
FROM myappacr.azurecr.io/myapp-base:latest
```
A `password` for these must be set via the Radix Web Console (under Configuration -&gt; Private image hubs).

To get more information on how to connect to a private Azure container registry (ACR), see the following [guide](https://thorsten-hans.com/how-to-use-private-azure-container-registry-with-kubernetes). The chapter `Provisioning an Azure Container Registry` provide information on how to get service principle `username` and `password`. It is also possible to create a Service Principle in Azure AD, and then manually grant it access to your ACR.

&gt; See [guide](/docs/guides/deploy-only/) on how make use of `privateImageHubs` in a deploy-only scenario.

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

When a component should run on a Kubernetes node with a GPU card on it, this need to be specified in the `gpu` key of the `node` section.

```yaml
  node:
    gpu: nvidia-v100, nvidia-p100
```

Put one or multiple (comma separated) GPU types, which is currently supported by Radix Kubernetes cluster and which fits to component logic, which requires GPU.
Currently available nodes with GPUs:

- `nvidia-v100` with 1, 2 or 4 GPU-s per node

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

## `secretRefs`

### `azureKeyVault`

Azure Key Vault secrets, keys and certificates can be used in Radix as secrets. Once configured, they are available in Radix application component replicas as environment variables and files content.

```yaml
secretRefs:
  azureKeyVaults:
    - name: radix-app-secrets
      path: /mnt/key-vault
      useAzureIdentity: true
      items:
        - name: connection-string-dev
          type: secret
          envVar: CONNECTION_STRING
        - name: key1
          type: key
          envVar: KEY1
        - name: cert1
          type: cert
          envVar: CERT1
```

- `azureKeyVaults` - list of Azure Key Vault configurations.
- `name` - Name of the Key Vault resource in an Azure subscription. Radix supports capital letters in the name, but not spaces.
- `path` - Folder path in running replica container, where secrets, keys and/or certificate contents are available as files (with file names, corresponding to their names in the Azure Key Vault). This field is optional. If set, it overrides default path: `/mnt/azure-key-vault/&lt;azure-key-vault-name&gt;`.
- `useAzureIdentity` - If set to `true`, Radix will use [Azure Workload Identity](/docs/guides/azure-key-vaults/#authentication-with-azure-workload-identity) to acquire credentials for accessing Azure Key Vault using the service principal configured in [identity.azure](#identity). This field is optional, with default value `false`. If omitted or set to `false`, credentials are acquired using [Azure Service Principal Client ID and Client Secret](/docs/guides/azure-key-vaults/#authentication-with-azure-service-principal-client-id-and-client-secret).
- `items` - list of secrets, keys and/or certificates with corresponding environment variable names.
  - `name` - name of secret, key or certificate in an Azure Key Vault.
  - `type` - Type of the item in the Azure Key Vault. Possible values: `secret`, `key`, `cert`. This field is optional, by default it is `secret`.
  - `envVar` - Name of an environment variable, which will contain specified secret, key or certificate. This field is optional - environment variable is not created if it is not specified, only file exist (see the property `path`).
  - `alias` - Alias of the file (see the property `path`). This field is optional. Default value is the same as `name`.

`secretRefs` can be configured for entire component, for component environments or only for specific component environments. Configuration in component environments overrides similar component properties.

Updated values of secrets, keys or certificates in Azure Key Vault are not automatically synced to corresponding secrets of already running replicas - they can be synced with a new deployment.

Azure Key Vaults configurable the same way in job-components.

&gt; See [guide](/docs/guides/azure-key-vaults/) on how to configure Azure Key Vault in Radix.

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
      egress:
        allowRadix: true
        rules:
        - destinations: 
          - "143.97.5.5/32"
          - "143.97.6.1/32"
          ports:
          - port: 443
            protocol: TCP
  components:
    - name: frontend
      src: frontend
      ports:
        - name: http
          port: 8000
        - name: metrics
          port: 8060
      publicPort: http
      monitoringConfig:
        portName: metrics
        path: /api/my-magic-metrics
      authentication:
        clientCertificate:
          verification: "optional_no_ca"
      node:
        gpu: nvidia-v100
        gpuCount: 4
      enabled: true
      volumeMounts:
        - name: volume-name
          path: /path/in/container/to/mount/to
          blobfuse2:
            container: container-name
            uid: 1000
      secretRefs:
        azureKeyVaults:
          - name: radix-app-secrets
            path: /mnt/key-vault
            useAzureIdentity: true
            items:
              - name: connection-string-dev
                type: secret
                envVar: CONNECTION_STRING
              - name: key1
                type: key
                envVar: KEY1
              - name: cert1
                type: cert
                envVar: CERT1
      identity:
        azure:
          clientId: 00000000-0000-0000-0000-000000000000
      environmentConfig:
        - environment: prod
          monitoring: true
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              cpu: "200m"
          authentication:
            clientCertificate:
              passCertificateToUpstream: true
          enabled: false
          identity:
            azure:
              clientId: 00000000-0000-0000-0000-000000000001
        - environment: dev
          monitoring: false
          resources:
            requests:
              memory: "128Mi"
              cpu: "200m"
            limits:
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
      timeLimitSeconds: 300
      backoffLimit: 2
      resources:
        requests:
          memory: "256Mi"
          cpu: "400m"
        limits:
          cpu: "600m"
      variables:
        DB_NAME: "compute-db"
      secrets:
        - DB_USER
        - DB_PASS
      identity:
        azure:
          clientId: 00000000-0000-0000-0000-000000000000
      notifications:
        webhook: http://backend:5000/monitor-batch-status
      environmentConfig:
        - environment: dev
          variables:
            DB_HOST: "db-dev"
            DB_PORT: "1234"
          notifications:
            webhook: ""
        - environment: prod
          timeLimitSeconds: 600
          backoffLimit: 10
          monitoring: true
          variables:
            DB_HOST: "db-prod"
            DB_PORT: "1234"
          identity:
            azure:
              clientId: 00000000-0000-0000-0000-000000000001
          notifications:
            webhook: http://backend:5000/monitor-batch-status-prod
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
