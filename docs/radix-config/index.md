---
title: The radixconfig.yaml file
---

# Radix Config

In order for Radix to configure your application it needs a configuration file. By default, it is expected to be located in the root of the application repository, has a name `radixconfig.yaml` and be in YAML or JSON format - in either case, it must have the `.yaml` or `.yml` extension (the name and extension should be exactly same as for the file in the GitHub repository). The name of the file and its location in the repository can be different. It can also be changed later on the Radix web-console configuration page for the application. Read more in the [monorepo](/guides/monorepo) guide.

:::tip
Radix only reads `radixconfig.yaml` from the branch we set as the `Config Branch` in the application registration form. If the file is changed in other branches, those changes will be ignored.
:::

The basic format of the file is this; the configuration keys are explained in the Reference section below:

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata: ...
spec: ...
```

:::tip
You can enable auto-completion and validation for `radixconfig.yaml` in your code editor. Read more about it [here](/docs/topic-code-editor-integration/index.md).
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

The `build` section of the spec contains configuration used during the build process of the components and jobs.

### `useBuildKit`
`useBuildKit` - (optional, default `false` for backwards compatibility) builds components and jobs using [Buildah](https://www.redhat.com/en/topics/containers/what-is-buildah). This option provides several benefits over the default Radix build engine:
- Secure handling of [**build secrets**](/guides/build-secrets/#build-secrets-with-buildkit).
- Caching support that can reduce build time, see [`useBuildCache`](#usebuildcache).
- Use images from protected container registries defined in [`privateImageHubs`](#privateimagehubs), in the Dockerfile's `FROM` instructions.
- Faster builds due to less steps involved and higher performance nodes.

:::tip
`useBuildKit` is the recommended way to build containers and will be the default in the future.
:::

### `useBuildCache`
`useBuildCache` - (optional, defaults to `true`) pushes all layers to cache, and uses it in future builds when possible. Requires `useBuildKit` to be enabled. Internally Radix sets `--cache-to`, `--cache-from` and `--layers` in Buildah. Read more at [Buildahs Documentation](https://github.com/containers/buildah/blob/main/docs/buildah-build.1.md)

This option can be overridden in the [Radix CLI command](/docs/topic-radix-cli/index.md#build-and-deploy-pipeline-job) `rx create pipeline-job build-deploy` with an argument `--use-build-cache=true|false` and with the checkbox `Use Build Cache` in the Radix Web Console.

#### Refresh Build Cache

There are cases when cache need to be refreshed explicitly:
* When `useBuildCache` is `true` and there are changes in source code's implicit dependencies or external resources, used by the Dockerfile (e.g. components, referenced to external Git repository or service)
* When build secrets are changed

In such (or other) cases the build cache can be refreshed within a `build` or `build-deploy` pipeline job created with the CLI command with the option `--refresh-build-cache true` or with the ticked checkbox `Refresh Build Cache` in the Radix Web Console.

:::tip
Make sure you never store secrets or confidential information in any intermediate layer, multistage image, or in your final container image.
:::

### `secrets`
```yaml
spec:
  build:
    secrets:
      - SECRET_1
      - SECRET_2
```
`secrets` - (optional) Defines secrets to be used in Dockerfiles or [sub-pipelines](/guides/sub-pipeline). Secrets values must be set in Radix Web Console. `build-deploy` jobs will fail if not all secret values are set.

:::tip
* When an option `useBuildKit: false`, to ensure that multiline build secrets are handled correct by the build, **all** build secrets are passed as `ARG`-s during container build, base-64 encoded (they need to be decoded before use).
* When an option `useBuildKit: true`, build secrets are not available as `ARG`-s during container build, but they can be mounted as files. Secret values are not base-64 encoded in these files.

Read the [build secrets](/guides/build-secrets/) guide to see how to use build secrets in a Dockerfile.
:::

### `subPipeline`
`subPipeline` - (optional, available only in [sub-pipelines](/guides/sub-pipeline)) configuration of sub-pipeline options. 

#### `variables`
```yaml
spec:
  build:
    subPipeline:
      variables:
        VAR1: value1
        VAR2: value2
```
`variables` - (optional, available only in [sub-pipelines](/guides/sub-pipeline)) environment variables names and values, provided for all build Radix environments in [sub-pipelines](/guides/sub-pipeline). These common environment variables can be overridden by environment-specific environment variables with the same names.

#### `identity` {#build-identity}
```yaml
spec:
  build:
    subPipeline:
      identity:
        azure:
          clientId: 12345678-a263-abcd-8993-683cc6123456
```
When `identity.azure.clientId` option is set, the environment variable `AZURE_CLIENT_ID` with its value is automatically added to the running pipeline, and it can be used in this pipeline tasks. Read more about the identity in the [component identity](/radix-config/#component-identity) option and about using it in the sub-pipeline in the [Pipeline with Azure workload identity](/guides/sub-pipeline/example-pipeline-with-azure-workload-identity.md) example.

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

### `name`

The name of the environment. Can be `dev`, `qa`, `production` etc.

### `build`

`from` specifies which branch or git tag each environment will build from. If `from` is not specified for the environment, no automatic builds or deployments will be created. This configuration is useful for a promotion-based [workflow](/start/workflows/#promotion).

Wildcard branch or git tag mapping is also support, using `*` and `?`. Examples:

- `feature/*`
- `feature-?`
- `hotfix/**/*`

`variables` - environment variable names and values (currently available only in [sub-pipelines](/guides/sub-pipeline)), provided for specific environments. They override common environment variables with the same names, if specified in the `spec.build.variables`.  

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

### `webhookEnabled`

```yaml
spec:
  environments:
    - name: dev
      build:
        from: master
        webhookEnabled: false
```

`webhookEnabled` - (optional, default `true`) controls whether the environment is built and deployed by `build-deploy` pipeline jobs triggered from GitHub webhook.

### `fromType`

```yaml
spec:
  environments:
    - name: dev
      build:
        from: master
        fromType: branch|tag
```

`fromType` - (optional, default both - branch or tag) controls whether the environment is built and deployed by `build-deploy` pipeline jobs triggered from GitHub webhook:
* `branch` - on commit to a branch
* `tag` - on created tag
* not set - both on commit to a branch or on created tag

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

See [the egress configuration guide](/guides/egress-config/) for usage patterns and tips and tricks.

:::tip
If an `environment` has defined the `egress` field, all traffic is blocked by default. If `egress` is not defined, all traffic is allowed.
If your application uses a custom OAuth2 implementation, outbound access to Microsoft authentication endpoints must be allowed. See [allow traffic for OAuth2](/guides/egress-config/#allow-traffic-for-oauth2).
:::

### `subPipeline`
`subPipeline` - (optional, available only in [sub-pipelines](/guides/sub-pipeline)) configuration of sub-pipeline options for specific environment. 
* It can override common [subPipeline](/radix-config/index.md#subpipeline) or combine with it (if present) for a specific environment.
* It can remove the common Sub-Pipeline [identity](/radix-config/index.md#identity) (if present) with `{}` (empty object) for a specific environment
```yaml
spec:
  environments:
    - name: dev
      subPipeline: {}
```
#### `variables`
```yaml
spec:
  environments:
    - name: dev
      subPipeline:
        variables:
          VAR1: value1
          VAR2: value2
```
Sub-pipeline environment variables names and values, provided for specific build Radix environment in [sub-pipelines](/guides/sub-pipeline). These variables will be combined with [subPipeline environment variables](/radix-config/index.md#variables) (if present).

#### `identity` {#component-identity}
```yaml
spec:
  environments:
    - name: dev
      subPipeline:
        identity:
          azure:
            clientId: 12345678-a263-abcd-8993-683cc6123456
```
The `identity` section enables identity for a specific environment. Read more about [build identity](/radix-config/index.md#build-identity).
* It can remove the common [identity](/radix-config/index.md#identity) with `{}` empty object for a specific environment
```yaml
spec:
  environments:
    - name: dev
      subPipeline:
        identity:
          azure: {}
```

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

`src` defines the folder, relative to the repository root, to use as [build context](https://docs.docker.com/build/concepts/context/) when building the `Dockerfile`, defined by [`dockerfileName`](#dockerfilename), in [Build and deploy](/guides/build-and-deploy/) pipeline jobs.  
The default value is `.` (root of the repository).

For Radix environment specific `src`, refer to [environmentConfig src](#src-1).

:::info
The [`image`](#image) option takes precedence over `src` and `dockerfilename`.
:::

### `dockerfileName`

```yaml
spec:
  components:
    - name: frontend
      dockerfileName: Dockerfile # Resolved path from repository root: /Dockerfile
      ports:
        - name: http
          port: 8080
    - name: backend
      dockerfileName: backend/Dockerfile # Resolved path from repository root: /backend/Dockerfile
      ports:
        - name: http
          port: 5000
    - name: api
      src: api
      dockerfileName: "../otherfolder/Dockerfile" # Resolved path from repository root: /otherfolder/Dockerfile
      ports:
        - name: http
          port: 5000
    - name: web
      src: web
      dockerfileName: "subfolder/Dockerfile" # Resolved path from repository root: /web/subfolder/Dockerfile
      ports:
        - name: http
          port: 5000          
```
`dockerfileName` defines the name and path, relative to [`src`](#src), of the `Dockerfile` to build in [Build and deploy](/guides/build-and-deploy/) pipeline jobs.

For Radix environment specific `dockerfileName`, refer to [environmentConfig image](/radix-config/index.md#dockerfilename-1).

:::info
The [`image`](#image) option takes precedence over `src` and `dockerfilename`.
:::

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

:::tip
- When a container image is from the DockerHub repository, it is enough to specify only the image name. Examples:
  - `image: redis:latest`
  - `image: redis:7.0.5`.
  - When an image is located in another container registry, the image name need to have the container registry URL. Example:
  - `image: gcr.io/distroless/nodejs18-debian11`.
  - `image: gcr.io/distroless/nodejs18-debian11:latest`.
- When an image is not publicly available, it is required to provide an authentication information. Please read more about [privateImageHubs](./#privateimagehubs) option.
:::

For Radix environment specific `image`, refer to [environmentConfig image](/radix-config/index.md#image-1).
### `replicas`

```yaml
spec:
  components:
    - name: backend
      replicas: 2
```

`replicas` can be used to [horizontally scale](https://en.wikipedia.org/wiki/Scalability#Horizontal_and_vertical_scaling) the component. If `replicas` is not set, it defaults to `1`. If `replicas` is set to `0`, the component will not be deployed (i.e. stopped).

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

A component doesn't need to have ports. If it has at least one port, it has to respond to TCP or HTTP requests, sent to this port. Kubernetes [readiness probe](/docs/topic-rollingupdate/#readiness-probe) will regularly request the first port in the `ports` list to ensure that the component can handle requests. 

When a new component version is deployed, the probe waits until replicas of the new component version start responding to such requests, keeping them in the "Starting" state. When the new replicas respond to these requests, the [rolling update](/docs/topic-rollingupdate/) will remove the replicas of the old component version 

### `publicPort`

```yaml
spec:
  components:
    - name: frontend
      publicPort: http
```

The `publicPort` field of a component, if set to `<PORT_NAME>`, is used to make the component accessible on the internet by generating a public endpoint. By default, the public endpoint can be accessed from all public IP addresses. You can restrict access to the public endpoints by configuring a list of IP address ranges in `network.ingress.public.allow`, see [network](#network-1) for more information.

A component without `publicPort: <PORT_NAME>` can only be accessed from another component in the app. If specified, the `<PORT_NAME>` should exist in the `ports` field.

:::tip
If no [ports](./#ports) specified for a component, `publicPort` should not be set.
:::

### `command`
```yaml
spec:
  components:
    - name: frontend
      command:
      - ./run.sh
```
`command` - (optional) sets or overrides [ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint) directive array in a docker image. [Variable](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#use-environment-variables-to-define-arguments) references like `$(VAR_NAME)` can be used with the container's environment variables. Read more in [Kubernetes documentation](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#run-a-command-in-a-shell). `command` can be set or overridden for a specific environment. 

When `command` is set and a Dockerfile used by the job-component has [CMD](https://docs.docker.com/reference/dockerfile/#cmd) directive (having a shell command or arguments to a command defined in [ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint)), this [CMD](https://docs.docker.com/reference/dockerfile/#cmd) directive will be ignored.

When `command` is set to an empty array `[]`, it will be equivalent of empty `command`, no effect on configuration.  

The command can be followed by a list of arguments.
```yaml
spec:
  components:
    - name: frontend
      command:
        - node
        - server.js
```
Array syntax is also supported:
```yaml
spec:
  components:
    - name: frontend
      command: ["node", "server.js"]
```

### `args`
```yaml
spec:
  components:
    - name: frontend
      args:
      - --port=8000
      - --host=server
```
`args` - (optional) sets or overrides [CMD](https://docs.docker.com/reference/dockerfile/#cmd) directive array in a docker image. [Variable](https://kubernetes.io/docs/tasks/inject-data-application/define-args-argument-container/#use-environment-variables-to-define-arguments) references like `$(VAR_NAME)` can be used with the container's environment variables. Read more in [Kubernetes documentation](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#run-a-command-in-a-shell). `args` can be set or overridden for a specific environment.

When `args` is set to an empty array `[]`, it will be equivalent of empty `args`, no effect on configuration.

Array syntax is also supported:
```yaml
spec:
  components:
    - name: frontend
      args: ["--port=8000", "--host=server"]
```
:::tip
`command` and `args` can be combined. If both are set, `command` will override the [ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint) and `args` will override the [CMD](https://docs.docker.com/reference/dockerfile/#cmd) of the container image.

Following configuration will run the command in the container: `node server.js --port=8000 --host=server`

```yaml
spec:
  components:
    - name: frontend
      command: ["node", "server.js"]
      args: ["--port=8000", "--host=server"]
```
:::

### `monitoring`

```yaml
spec:
  components:
    - name: frontend
      monitoring: true
```

When the `monitoring` field is set to `true`, is used to expose custom application metrics in the Radix monitoring dashboards. It is expected that the component provides a `/metrics` endpoint: this will be queried periodically (every five seconds) by an instance of [Prometheus](https://prometheus.io/) running within Radix. General metrics, such as resource usage, will always be available in monitors, regardless of this being set.

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

:::tip Note
If overriding `portName` it will have to match one of the defined ports in the component.
:::

### `horizontalScaling`
Configure automatic scaling of the component. This field is optional, and if set, it will override the `replicas` value of the component. If no triggers are defined, Radix will configure a default CPU trigger with a target of 80% average usage.

One exception is when the `replicas` value is set to `0` (i.e. the component is stopped), the `horizontalScaling` config will not be used.

:::info Deprecation
The previous `resources` block have been replaced by `triggers`.
:::

Radix application components replicas can be scaled up and down based on resources (CPU, memory) or external metrics (cron, Azure Service Bus, etc.). Read [more](/guides/horizontal-scaling/).

#### Scaling options
```yaml
spec:
  components:
    - name: backend
      horizontalScaling:
        minReplicas: 0
        maxReplicas: 6
        pollingInterval: 15
        cooldownPeriod: 120
```
* `minReplicas` - (optional, default `1`) The minimum number of replicas to scale down to. Valid minimum value depend on trigger type. If only CPU or memory trigger is defined, the default and minimum value is `1`. If other types of triggers are defined, the minimum value can be `0`.
* `maxReplicas` - the maximum number of replicas to scale up to by any combination of triggers.
* `pollingInterval` - (optional, default `30`) This is the interval in seconds to check each trigger on. Read [more](https://keda.sh/docs/2.14/concepts/scaling-deployments/#pollinginterval).
* `cooldownPeriod` - (optional, default `300`) The period in seconds to wait after the last trigger reported active before scaling the resource back to `0`. Read [more](https://keda.sh/docs/2.14/concepts/scaling-deployments/#cooldownperiod).

Read [more](https://keda.sh/docs/2.14/concepts/scaling-deployments/#scaledobject-spec) about other default options.

#### `cpu` and `memory` triggers
Scale applications based on CPU and/or memory metrics.
```yaml
spec:
  components:
    - name: backend
      horizontalScaling:
        minReplicas: 1
        maxReplicas: 6
        triggers:
        - name: cpu
          cpu:
            value: 85
        - name: memory
          memory:
            value: 75
```
* `minReplicas` - (optional) The minimum number of replicas to scale down to. If only CPU or memory trigger is defined, the default and minimum value is `1`. If other types of triggers are defined, the minimum value can be `0`.
* `cpu` - (optional) The target average CPU usage (in percents) across all replicas. If the average CPU usage is above this value, KEDA will scale up the component. Read [more](https://keda.sh/docs/2.17/scalers/cpu/)
* `memory` - (optional) The target average memory usage (in percents) across all replicas. If the average memory usage is above this value, KEDA will scale up the component. Read [more](https://keda.sh/docs/2.17/scalers/memory/).

:::tip Deprecated
* Legacy resources will be rewritten as triggers by Radix.
* It is not allowed to mix resources with triggers.
```yaml
 #Deprecated
 resources:
     memory:
       averageUtilization: 75
     cpu:
       averageUtilization: 85
```
:::
#### `cron` trigger
Scale applications based on a cron schedule. 

The example below scales the `backend` component to `2` replicas between 07:00 and 17:00 on weekdays (Monday to Friday) in the Europe/Oslo timezone. Outside this period, the component will scale down to `0` replicas.
```yaml
spec:
  components:
    - name: backend
      horizontalScaling:
        minReplicas: 0
        maxReplicas: 2
        triggers:
        - name: cron
          cron:
            timezone: Europe/Oslo
            start: 0 7 * * 1-5 # 07:00 Monday - Friday
            end: 0 17 * * 1-5 # 17:00 Monday - Friday
            desiredReplicas: 2
```
* `minReplicas` - it need to be set to `0` to allow scaling down to zero replicas outside the cron scheduled period.
* `maxReplicas` - the maximum number should be equal or great than `desiredReplicas`.
* `timezone` - (optional) One of the acceptable values from the IANA Time Zone Database. The list of timezones can be found [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
* `start` - (required) Cron expression indicating the start of the cron schedule.
* `end` - (required) Cron expression indicating the end of the cron schedule.
* `desiredReplicas` - Number of replicas to which the resource has to be scaled _between the start and end_ of the cron schedule.

Read [more](https://keda.sh/docs/2.17/scalers/cron/)

#### `azureServiceBus` trigger
Scale application components based on [Azure Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview) Queues or Topics.
````yaml
spec:
  components:
    - name: backend
      horizontalScaling:
        minReplicas: 0
        maxReplicas: 2
        secrets:
          - SERVICE_BUS_CONNECTION
        triggers:
          - name: azure-sb
            azureServiceBus:
              namespace: my-servicebus-namespace
              queueName: my-queue
              topicName: my-topic
              subscriptionName: my-subscription
              messageCount: 5
              activationMessageCount: 0
              authentication:
                identity:
                  azure:
                    clientId: 00000000-0000-0000-0000-000000000000
              connectionFromEnv: SERVICE_BUS_CONNECTION
````
* `minReplicas` - it need to be set to `0` to allow scaling down to zero replicas.
* `namespace` - The Azure Service Bus namespace, without the `.servicebus.windows.net` suffix. Required when authenticate to Azure Service Bus using a Managed Identity.
* `queueName` - (optional) Name of the Azure Service Bus queue to scale on. This cannot be used together with `topicName`.
* `topicName` - (optional) Name of the Azure Service Bus topic to scale on. This cannot be used together with `queueName`.
* `subscriptionName` - (optional) Name of the Azure Service Bus subscription to scale on. Required when `topicName` is specified. This cannot be used together with `queueName`.
* `messageCount` - (optional, default 5) The target average number of messages in the queue or topic subscription. If the average number of messages is above this value, Keda will scale up the component.
* `activationMessageCount` - (optional, default 0) The number of messages that must be present in the queue or topic subscription before Keda will activate scaling. If the number of messages is below this value, Keda will not scale up the component.
* `authentication` - (optional) authenticate to Azure Service Bus using a Managed Identity. `identity.azure.clientId` is a service principal ClientID. Read [more](/guides/horizontal-scaling/keda-azure-service-bus-trigger-authentication#authenticate-with-workload-identity).
* `connectionFromEnv` - (optional) The name of an environment variable or a secret that contains the connection string to the Azure Service Bus. Ignored when authentication is done with Workload Identity. Read [more](/guides/horizontal-scaling/keda-azure-service-bus-trigger-authentication#authenticate-with-connection-string).

Read [more](https://keda.sh/docs/2.17/scalers/azure-service-bus/) about the Keda Azure Service Bus scheduler.

#### `azureEventHub` trigger
Scale application components based on [Azure Event Hub](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about) events.
````yaml
spec:
  components:
    - name: backend
      horizontalScaling:
        minReplicas: 0
        maxReplicas: 1
        secrets:
          - EVENT_HUB_CONNECTION
          - STORAGE_CONNECTION
        triggers:
          - name: azure-eh
            azureEventHub:
              eventHubName: my-event-hub
              eventHubNamespace: my-event-hub-namespace
              eventHubNameFromEnv: EVENT_HUB_NAME
              eventHubNamespaceFromEnv: EVENT_HUB_NAMESPACE
              accountName: my-storage-account
              container: my-blob-container
              checkpointStrategy: blobMetadata
              unprocessedEventThreshold: 20
              activationUnprocessedEventThreshold: 2
              authentication:
                identity:
                  azure:
                    clientId: 00000000-0000-0000-0000-000000000000
              eventHubConnectionFromEnv: EVENT_HUB_CONNECTION
              storageConnectionFromEnv: STORAGE_CONNECTION
````
* `minReplicas` - it need to be set to `0` to allow scaling down to zero replicas.
* `eventHubNamespace` - (optional) the Azure Event Hub namespace, without the `.servicebus.windows.net` suffix. Required when authentication is done with Workload Identity.
* `eventHubNamespaceFromEnv` - (optional) the name of an environment variable that contains the Event Hub namespace. Ignored when `eventHubNamespace` is specified. Required when authentication is done with Workload Identity.
* `eventHubName` - (optional) the name of the Event Hub to scale on. Required when authentication is done with Workload Identity.
* `eventHubNameFromEnv` - (optional) the name of an environment variable that contains the Event Hub name. Ignored when `eventHubName` is specified. Required when authentication is done with Workload Identity.
* `accountName` - (optional) the name of the Azure Storage account to save current [checkpoint](https://keda.sh/docs/2.17/scalers/azure-event-hub/#checkpointing-behaviour). Required when authentication is done with Workload Identity.
* `container` - (optional) the name of the Azure Storage container to save current [checkpoint](https://keda.sh/docs/2.17/scalers/azure-event-hub/#checkpointing-behaviour). Required when `checkpointStrategy` is _not_ `azureFunction`.
* `checkpointStrategy` - (optional, default `blobMetadata`) the strategy to use for checkpointing. Can be one of the following values:
  * `blobMetadata` - checkpoint is stored in an Azure Storage Account.
  * `azureFunction` - checkpoint is stored in an Azure Storage Account, in the blob container `azure-webjobs-eventhub` - Radix will automatically set or override with this value `container` property for this checkpoint type.
  * `goSdk` - for all implementations using the [Golang SDK](https://github.com/Azure/azure-event-hubs-go) checkpointing.
* `unprocessedEventThreshold` - (optional, default `64`) average target value to trigger scaling actions.
* `activationUnprocessedEventThreshold` - (optional, default `0`) target value for activating the scaler. Read [more](https://keda.sh/docs/2.17/concepts/scaling-deployments/#activating-and-scaling-thresholds) about activation.
* `authentication` - (optional) authenticate to Azure Event Hub using a Managed Identity. `identity.azure.clientId` is a service principal ClientID. Read [more](/guides/horizontal-scaling/keda-azure-event-hub-trigger-authentication#authenticate-with-workload-identity).
* `storageConnectionFromEnv` - (optional) The name of an environment variable or a secret that contains the connection string to the Azure Event Hub. Ignored when authentication is done with Workload Identity. Read [more](/guides/horizontal-scaling/keda-azure-event-hub-trigger-authentication#authenticate-with-connection-string).

Read [more](https://keda.sh/docs/2.17/scalers/azure-event-hub/) about the Keda Azure Event Hub scheduler.

### `healthChecks`

By default Radix configures a TCP Readiness probe that tells the platform your component is ready to accept traffic as soon as the port is opened.
Radix support [Readiness, Liveness and Startup Probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes).

If any custom probes are configured, Radix will not include the default readiness probe and you should configure it yourself.

:::tip
A **HTTP Get probe** for readiness probe is usually easer to manage than a TCP probe, and the probe should let Radix now when your component _and_ your dependencies are ready for traffic.

**TCP Probes** only checks if the port is open or closed. This way its hard to explicitly open or close the port when your component or dependencies are unavailable after startup. This could also disrupt regular requests that might not be affected.
:::


```yaml
spec:
  components:
    - name: backend
      healthChecks:
        startupProbe:
          tcpSocket:
            port: 8000
        livenessProbe:
          httpGet:
            port: 8000
            path: /healthz/live
        readinessProbe:
          successThreshold: 1
          periodSeconds: 30
          failureThreshold: 3
          initialDelaySeconds: 10
          timeoutSeconds: 5
          httpGet:
            port: 8000
            path: /healthz/ready # Component is Ready when this endpoint returns a successful status code (2xx or 3xx)
```

All probes have all settings (except for successThreshold that is not available for liveness and startup probes). We support HTTP, TCP, Exec and GRPC probes.
`environmentConfig` can also override individual startup, liveness or readiness-probes (but will not merge probe specific config).

:::warning
Incorrectly configured probes can lead to premature restarts and will affect your uptime.

Read more about probes here: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
:::

### `imageTagName`

```yaml
components:
  - name: backend
    image: docker.pkg.github.com/equinor/myapp/backend:{imageTagName}
    imageTagName: master-latest
```
The `imageTagName` allows for flexible configuration of fixed images, built outside of Radix. It can be configured with separate tag for each environment.

:::tip
See [this](/guides/deploy-only/) guide on how make use of `imageTagName` in a deploy-only scenario.
:::

### `volumeMounts`

```yaml
spec:
  components:
    - name: backend
      volumeMounts:
        - name: volume-name
          path: /path/in/container/to/mount/to
          blobFuse2:
            protocol: fuse2
            container: container-name
            cacheMode: Block
            blockCache:
              blockSize: 4
              poolSize: 100
              diskSize: 250
              diskTimeout: 120
              prefetchCount: 11
              prefetchOnOpen: false
              parallelism: 8
            fileCache:
              timeout: 120
            attributeCache:
              timeout: 0
            accessMode: ReadWriteMany
            requestsStorage: 1M
            uid: "2000"
            gid: "2001"
            useAdls: false
            useAzureIdentity: false
            storageAccount: radixblobtest6
            subscriptionId: ffffffff-ffff-ffff-ffff-ffffffffffff
            tenantId: ffffffff-ffff-ffff-ffff-ffffffffffff
            streaming: # deprecated in favor of cacheMode
              enabled: false
        - name: temp-volume-name
          path: /another/path/in/container/to/mount/to
          emptyDir:
            sizeLimit: 10M

```

The `volumeMounts` field configures volume mounts within the running component.

- `name` - The name of the volume. Unique within `volumeMounts` list of a component
- `path` - The folder inside the running container, where the external storage is mounted.

Configure one of the following volume types:
- `emptyDir` - Mounts a read-write empty volume.
- `blobFuse2` - Mounts an [Azure storage account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview) blob container.

#### `emptyDir`

- `sizeLimit` - The maxiumum capacity for the volume.

An `emptyDir` volume mounts a temporary writable volume in the container. Data in an `emptyDir` volume is safe across container crashes for component replicas, but is lost if a job container crashes and restarts. When a component replica is deleted for any reason, the data in `emptyDir` is removed permanently.

`emptyDir` volumes are useful when [`readOnlyFileSystem`](#readonlyfilesystem) is set to `true`.

:::tip Use cases

- scratch space, such as for a disk-based merge sort
- checkpointing a long computation for recovery from crashes
- holding files that a content-manager container fetches while a webserver container serves the data
  :::

#### `blobFuse2`

The **blobFuse2** volume type adds support for mounting Azure storage account blob containers. Read the [guide](../guides/volume-mounts/) for detailed information and examples.

- `protocol` (optional, default `fuse2`) - Name of the protocol to be used. Valid values are `fuse2` or `""` (blank).
- `container` - Name of the blob container in the Azure storage account.
- `cacheMode` (optional, default `Block`) - Specify how files should be cached. Valid values are `Block`, `File` and `DirectIO`. Read more about the different mode [here](../guides/volume-mounts/index.md#cache-modes).
- `blockCache` (optional) - Settings for `Block` cache mode.
  - `blockSize` (optional, default `4`) - Size (in MB) of a block to be downloaded as a unit.
  - `prefetchCount` (optional, default `11`) - Max number of blocks to prefetch. Value must be `0` or greater than `10`.
  - `prefetchOnOpen` (optional, default `false`) - Start prefetching on open or wait for first read.
  - `poolSize` (optional) - Defines the size (in MB) of total memory preallocated for block cache. Must be at least `blockSize` * `prefetchCount`. If `prefetchCount` is set to `0` then the minimum value is 1 * `blockSize`. If this value is set lower than the required minimum, Radix will automatically use minimum to prevent failures.
  - `diskSize` (optional, default `0`) - Defines the size (in MB) of total disk capacity that block cache can use. `0` disables block caching on disk. Follows the same requirements and behavior as `poolSize` when set to a value greater than `0`.
  - `diskTimeout` (optional, default `120`) - Timeout (in seconds) for which persisted data on disk cache. Applicable only when `diskSize` greater than `0`.
  - `parallelism` (optional, default `8`) - Number of worker thread responsible for upload/download jobs.
- `fileCache` (optional) - Settings for `File` cache mode.
  - `timeout` (optional, default `120`) - The timeout (in seconds) for which file cache is valid.
- `attributeCache` (optional) - Settings for file attribute cache.
  - `timeout` (optional, default `0`) - The timeout (in seconds) for file attribute cache entries.
- `accessMode` (optional, default `ReadOnlyMany`) - Defines the access mode to the mounted volume. Valid values are `ReadOnlyMany`, `ReadWriteOnce` or `ReadWriteMany`.
- `requestsStorage` (optional, default `1Mi`) - Defines the requested storage size for the Azure storage account blob container. Currently, this setting has no effect.
- `uid` (optional) - Defines the ID of the user that will own the mounted files and directories. Currently, the blobfuse2 driver does no honor this setting.
- `gid` (optional) - Defines the ID of the group that will own the mounted files and directories. Currently, the blobfuse2 driver does no honor this setting.
- `useAdls` (optional, default `false`) - When Azure storage account has enabled [HNS](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-namespace) (hierarchical namespace, available in [Azure Data Lake Gen2 storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-overview#about-azure-data-lake-storage-gen2)), ADLS (Azure Data Lake Storage) can be used instead of Blob Storage. When `adls: true` - folder hierarchy, folder operations (create, delete, etc.) and ACL (access control list) can be used on blob data in a Radix component pod's container, within `path`. Read about [private endpoint and ADLS](/guides/volume-mounts/#private-endpoint).
- `useAzureIdentity` (optional, default `false`) - Enables [Azure Workload Identity](../guides/volume-mounts/index.md#azure-workload-identity) credentials using the service principal configured in [identity.azure](#identity-2) for accessing the Azure Storage. If omitted or set to `false`, [Azure storage account keys](../guides/volume-mounts/index.md#access-keys) is used for authentication.
- `storageAccount` (optional) - Name of the Azure storage account. Required when `useAzureIdentity` is `true`.
- `resourceGroup` (optional) - Name of the Azure resource group for the Azure storage account. Required when `useAzureIdentity` is `true`.
- `subscriptionId` (optional) - Azure subscription ID for the Azure storage account. Required when `useAzureIdentity` is `true`.
- `tenantId` (optional, defaults to the Equinor tenant) - Azure tenant ID for the Azure storage account. Applicable when `useAzureIdentity` is `true`.
- `streaming` (deprecated) - Streaming is deprecated by the blobfuse2 driver, and is replaced with block caching. To prevent breaking changes for applications that have explicitly disabled streaming, by setting `streaming.enabled` to `false`, in order to use file caching, this behavior is preserved as long as `cacheMode` is not set.

### `ingressConfiguration`

```yaml
spec:
  components:
    - name: frontend
      ingressConfiguration:
        - websocketfriendly
```

The `ingressConfiguration` field of a component will add extra configuration by [annotations](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/) to the Nginx ingress, useful for a particular scenario.

:::tip
Note that the settings affect the connections with the public component, not between a public and a private component.
:::

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

Only relevant for teams that uses another CI tool than Radix and static tags. See [deploy-only](/guides/deploy-only/#updating-deployments-on-static-tags) for more information.

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

The `resources` section specifies how much CPU and memory each component needs, that are shared among all Radix environments in a component. 
These common resources are overridden by environment-specific resources. The requested quota of memory and cpu must be below the limit.

If no memory limit is set, but a memory request is set, we will set the limit equal to the requested value. 
The opposite is also true, if a memory limit is set, but no requests, we will sett the requested memory equal to the memory limit.

[Read more](https://kubernetes.io/blog/2021/11/26/qos-memory-resources/) about memory resources and QoS.
[More details](/guides/resource-request/index.md) about `resources` and about [default resources](/guides/resource-request/index.md#default-resources).

### `variables` (common)

```yaml
spec:
  components:
    - name: backend
      variables:
        DB_NAME: my-db
```

The `variables` key contains environment variable names and their values, that are shared among all Radix environments in a component. These common environment variables are overridden by environment-specific environment variables that have exactly same names.

Environment variables [can be changed](/guides/environment-variables/) in Radix Console.

### `environmentConfig`

The `environmentConfig` section is to set environment-specific settings for each component.

#### `src`

Overrides the [`src`](#src) option defined on the component level.

If the [`image`](#image) option is specified on the component level, this `image` option will be ignored and this component will be built for this environment with that specified `src`. An example of such configuration:

```yaml
spec:
  components:
    - name: frontend
      src: "."
      environmentConfig:
        - environment: dev
          src: "./frontend"
    - name: backend
      environmentConfig:
        - environment: dev
          src: "./backend"
    - name: api
      image: ghcr.io/my-repo/my-app/api:v1.10
      environmentConfig:
        - environment: dev
          src: "./api"
```
In this example:
* The `frontend` component in the `dev` environment will be built from the `frontend` folder of the GitHub repo, and from a root folder for other environments. Both docker-files expected to be `Dockerfile` as `dockerfileName` option is not specified.
* The `backend` component in the `dev` environment will be built from the `backend` folder of the GitHub repo, and from a root folder (used by default) for other environments. Both docker-files expected to be `Dockerfile` as `dockerfileName` option is not specified.
* The `api` component in the `dev` environment will be built from the `api` folder. This option in the environment overrides an `image` option on the component level, which value `ghcr.io/my-repo/my-app/api:v1.10` will be used to deploy this component in other environments. The docker-file expected to be `Dockerfile` as `dockerfileName` option is not specified.

#### `dockerfileName`

Overrides the [`dockerfileName`](#dockerfilename) option defined on the component level.

If the [`image`](#image) option is specified on the component level, this `image` option will be ignored and this component will be built for this environment with that specified `dockerfileName`. An example of such configuration:

```yaml
spec:
  components:
    - name: frontend
      dockerfileName: Dockerfile
      environmentConfig:
        - environment: dev
          dockerfileName: Dockerfile.dev
    - name: backend
      src: "./backend"
      environmentConfig:
        - environment: dev
          dockerfileName: Dockerfile.dev
    - name: api
      image: ghcr.io/my-repo/my-app/api:v1.10
      environmentConfig:
        - environment: dev
          dockerfileName: Dockerfile
```
In this example:
* The `frontend` component in the `dev` environment will be built with the `Dockerfile.dev` docker-file, and with a `Dockerfile` docker-file for other environments. Both docker-files expected to be in the root of the GitHub repo as `src` option is not specified.
* The `backend` component in the `dev` environment will be built with the `Dockerfile.dev` docker-file, and with a `Dockerfile` docker-file (a name, used by default) for other environments. Both docker-files expected to be in the `backend` folder in the root of the GitHub repo.
* The `api` component in the `dev` environment will be built with the `Dockerfile` docker-file. This option in the environment overrides an `image` option on the component level, which value `ghcr.io/my-repo/my-app/api:v1.10` will be used to deploy this component in other environments. The docker-file expected to be in the root of the GitHub repo as `src` option is not specified.

#### `image`

When a component needs a different docker image in a particular application environment, this image can be specified in the `image` option of the `environmentConfig` section for this environment. An example of such configuration:

```yaml
spec:
  components:
    - name: redis
      image: redis:5.0-alpine
      environmentConfig:
        - environment: qa
          image: redis:7.2.4
    - name: web-app
      src: ./app
      dockerfileName: Dockerfile.app
      environmentConfig:
        - environment: prod
          image: ghcr.io/my-repo/my-app/web-app:v1.10
```
In this example:
* The `redis` component in the `qa` environment will be run on the image `redis:7.2.4`, in other environments it will be run on the default image `redis:5.0-alpine`
* The `web-app` component in the `prod` environment will be run on the pre-build image `ghcr.io/my-repo/my-app/web-app:v1.10`, in other environments it will be built from the source folder `./app` and the docker-file `Dockerfile.app`

For shared image across Radix environments, refer to [common image](./#image).

#### `replicas`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          replicas: 2
```

`replicas` can be used to [horizontally scale](https://en.wikipedia.org/wiki/Scalability#Horizontal_and_vertical_scaling) the component. If `replicas` is not set, it defaults to `1`. If `replicas` is set to `0`, the component will not be deployed (i.e. stopped). This can override the [component level](/radix-config#replicas) `replicas` value.

#### `command`
```yaml
spec:
  components:
    - name: frontend
      environmentConfig:
        - environment: prod
          command:
          - ./run.sh
```
`command` - (optional) sets or overrides [ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint) directive array in a docker image. It can also override the component's `command` if it exists. Read more about [command](/radix-config/#command)

#### `args`
```yaml
spec:
  components:
    - name: frontend
      environmentConfig:
        - environment: prod
          args:
          - --port=8000
          - --host=server
```
`args` - (optional) sets or overrides [CMD](https://docs.docker.com/reference/dockerfile/#cmd) directive array in a docker image. It can also override the component's `args` if it exists. Read more about [args](/radix-config/#args)

:::tip
`command` and `args` in the component and its `environmentConfig` can be combined.
Following configuration will run the command:
* in the `dev` environment container: `node server.js --port=8000 --host=server` 
* in the `prod` environment container: `node server.js --port=8099 --host=api` 

```yaml
spec:
  components:
    - name: frontend
      command: ["node", "server.js", "--port=$(PORT)"]
      variables:
        PORT: "8000"
      environmentConfig:
        - environment: dev
          args: ["--host=server"]
          variables:
            PORT: "8099"
        - environment: prod
          args: ["--host=api"]
```
:::

#### `monitoring`

```yaml
spec:
  components:
    - name: frontend
      environmentConfig:
        - environment: prod
          monitoring: true
```

When the `monitoring` field of a component environment config is set to `true`, is used to expose custom application metrics for the specific environment.
See [monitoring](#monitoring) for more information.

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

The `variables` key contains environment variable names and their values, that are defined per Radix environment in a component. In addition to what is defined here, running containers will also have some [environment variables automatically set by Radix](/docs/topic-runtime-env/#environment-variables).

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

The `horizontalScaling` field of a component environment config adds automatic scaling of the component in the environment, or it combines or overrides a component `imageTagName` if it is defined.

#### `healthChecks`

Health check probes defined here will override probes defined on the component level. 

```yaml
spec:
  components:
    - name: backend
      healthChecks:
        startupProbe:
          tcpSocket:
            port: 8000
        livenessProbe:
          tcpSocket:
            port: 8000
        readinessProbe:
          httpGet:
            port: 8000
            path: /health/ready
      environmentConfig:
        - environment: prod
          healthChecks:
            livenessProbe:
              httpGet:
                port: 8000
                path: /health/alive
```

In this example, the prod environment will have 3 probes, a startup probe (TCP port 8000), a liveness check (HTTP /health/ready) and a readiness probe (HTTP /health/ready)

Please see more information at [`healthChecks`](#healthchecks) for detailed information and warnings.

#### `imageTagName`

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
The `imageTagName` can be configured with separate tag for each environment. Environment `imageTagName` overrides a component `imageTagName` if it is also defined.
See [imageTagName](#imagetagname) for a component for more information.

#### `volumeMounts`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          volumeMounts:
            - name: volume-name
              path: /path/in/container/to/mount/to
              blobFuse2:
                container: container-name
                uid: 1000
            - name: temp-volume-name
              path: /another/path/in/container/to/mount/to
              emptyDir:
                sizeLimit: 10M

```

The `volumeMounts` field configures volume mounts within the component running in the specific environment. EnvironmentConfig `volumeMounts` combine or override a component `volumeMounts` if they are defined.

See [volumeMounts](#volumemounts) for more information.

#### `readOnlyFileSystem`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          readOnlyFileSystem: true|false
```

See [readOnlyFileSystem](#readonlyfilesystem-1) for more information.

#### `runtime`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          runtime:
            architecture: amd64|arm64
```

See [runtime](#runtime-1) for more information.

#### `network`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          network:
            ingress:
              public:
                allow:
                  - 100.1.1.1
                  - 100.2.2.2/30
```

See [network](#network-1) for more information.

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

:::tip
Note that the environment config will override the component config for that specific environment.
:::

#### `clientCertificate`

```yaml
clientCertificate:
  verification: "optional_no_ca"
  passCertificateToUpstream: true
```

`clientCertificate` is a subsection of [authentication](#authentication) and may be used to configure the Nginx Client Certificate Authentication.

:::tip
Note that the Client Certificate configuration will be omitted if the component does not have a public port.
:::
- `verification` Specifies type of verification of client certificates. Possible values are:
  - `off`: Don't request client certificates and don't do client certificate verification. (default)
  - `on`: Request a client certificate that must be signed by a certificate that is included in the secret key ca.crt of the secret specified by `nginx.ingress.kubernetes.io/auth-tls-secret: secretName`. Failed certificate verification will result in a status code 400 (Bad Request).
  - `optional`: Do optional client certificate validation against the CAs from auth-tls-secret. The request fails with status code 400 (Bad Request) when a certificate is provided that is not signed by the CA. When no or an otherwise invalid certificate is provided, the request does not fail, but instead the verification result is sent to the upstream service.
  - `optional_no_ca`: Do optional client certificate validation, but do not fail the request when the client certificate is not signed by the CAs from `auth-tls-secret`. Certificate verification result is sent to the upstream service.

- `passCertificateToUpstream` Indicates if the received certificates should be passed or not to the upstream server in the header ssl-client-cert. `verification` will have to be set to something other than `off` for the certificate to be passed upstream. Possible values are `true` or `false` (default).

:::tip
If `verification` has been set to something other than `off` or `passCertificateToUpstream` is set to `true`, a valid certificate will need to be applied in the `Radix Console` for the affected environment(s). This can be found under `Environments\[environmentName]\[componentName]\[componentName]-clientcertca` in the `Radix Console` for your application.
:::
#### `oauth2`

Configuration for adding OAuth2 authorization with OIDC to the component.

Common `oauth2` settings can be configured at component level and/or in the component's `environmentConfig` section. Properties configured in the `environmentConfig` section override properties at component level. The component must also be configured with a [publicPort](#publicport).

When OAuth2 is configured for a component, Radix creates an OAuth2 service (using [OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/)) to handle the OAuth2 authorization code flow, and to verify the authorization state of incoming requests to the component.

:::tip
If no [ports](./#ports) specified for a component, `authentication.oauth2` should not be set.
:::

The OAuth2 service handles incoming requests to the path _/oauth2_ (or the path defined in _proxyPrefix_) for all public DNS names configured for a component. Valid _redirect URIs_ must be registered for the application registration in Azure AD, e.g. `https://myapp.app.radix.equinor.com/oauth2/callback`.  
See [guide](/guides/authentication/#configuration) for more information.

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
  credentials: azureWorkloadIdentity
  sessionStoreType: systemManaged # Defaults to cookie, can be systemManaged, redis or cookie

  # Required for sessionStoreType `redis`:
  # redisStore:
  #   connectionUrl: rediss://app-session-store.redis.cache.windows.net:6380
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
- `credentials` Optional. Default **secret**. The type of the authentication. When the value of the `credentials` omitted or set to `secret` a Client Secret component or job secrets is required to be set. See details in the [Authentication with Client Secret](/guides/authentication/#authentication-with-client-secret). Supported values:
  - `secret` - using a client secret to authenticate the OAuth2 proxy.
  - `azureWorkloadIdentity`- [Azure Workload Identity](/guides/authentication/#authentication-with-azure-workload-identity) to authenticate the OAuth2 proxy using the Microsoft Entra ID application registration with its `ClientID` set to the `oauth2.clientId` field.
- `sessionStoreType` Optional. Default **cookie**. Allowed values: **cookie**, **redis**, **systemManaged**. Defines where session data shall be stored:
  - When defined as **cookie**, the session data is stored in cookies.
  - When defined as **systemManaged**, the session store is managed by Radix and the session data is stored in a Redis cache - a Redis component is automatically configured and deployed within the environment. 
  - When defined as **redis**, the session data is stored in a Redis cache. Set `redisStore` equal to the URL where Redis is located, and configure the password as a secret in Radix Web Console. This could be a seperate Redis component, or Azure Cache for Redis (recommended for production)`.
- `redisStore` Redis session store configuration if `sessionStoreType` is **redis**.
  - `connectionUrl` Connection URL of redis server.
- `cookieStore` Cookie session store configuration if `sessionStoreType` is **cookie**.
  - `minimal` Optional. Default **false**. Strips ID token, access token and refresh token from session store cookies. `setXAuthRequestHeaders` and `setAuthorizationHeader` must be set to **false**, and `cookie.refresh` must be set to **0**.
- `cookie` Session cookie configuration
  - `name` Optional. Default **_oauth2_proxy**. Name of the session cookie. If `sessionStoreType` is **cookie**, the ID token and access token is stored in cookies prefixed with this name.
  - `expire` Optional. Default **168h0m0s**. Expire timeframe for session cookies. Controls the _Expires_ cookie attribute.
  - `refresh` Optional. Default **60m0s**. Refresh interval defines how often the OAuth2 service should redeem the refresh token to get a new access token. The session cookie's _Expires_ is updated after refresh.
  - `sameSite` Optional. Default **lax**. The _SameSite_ attribute for the session cookie.

:::tip
See [guide](/guides/authentication/#using-the-radix-oauth2-feature) on how to configure OAuth2 authentication for a component.
:::

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

Read more details in the [guide](/guides/enable-and-disable-components/).

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

See [guide](/guides/workload-identity) for more information.

### `readOnlyFileSystem`

```yaml
spec:
  components:
    - name: backend
      readOnlyFileSystem: true|false
      environmentConfig:
        - environment: prod
          readOnlyFileSystem: true|false
```

Mounts the container's root filesystem as read-only. Setting `readOnlyFileSystem` in `environmentConfig` overrides the value configured on component level. Defaults to `false` if not specified.

Read-only filesystems will prevent the application from writing to disk. This is desirable in the event of an intrusion as the attacker will not be able to tamper with the filesystem or write foreign executables to disk. Without a writable filesystem the attack surface is dramatically reduced.

There may be a requirement for temporary files or local caching, in which case one or more writable [`emptyDir`](#volumemounts) volumes can be mounted.

### `runtime`
The `runtime` section can be configured on the component/job level and in `environmentConfig` for a specific environment. `environmentConfig` takes precedence over component/job level configuration.
`runtime` can be optionally re-defined for individual Radix [batch jobs](/guides/jobs/job-manager-and-job-api#create-a-batch-of-jobs) or [single jobs](/guides/jobs/job-manager-and-job-api#create-a-single-job). 
#### `architecture`
```yaml
spec:
  components:
    - name: backend
      runtime:
        architecture: amd64|arm64
      environmentConfig:
        - environment: prod
          runtime:
            architecture: amd64|arm64
```
The `architecture` property in `runtime` defines the CPU architecture a component or job should be built and deployed to. Valid values are `amd64` and `arm64`. `amd64` is used if neither is configured. Currently used virtual machines, when `nodeType` is not defined:
* `amd64`
  * CPU: AMD 3rd gen EPYC™ 7763v, 16 cores, architecture: AMD64
  * Memory: 128 GB
* `arm64`
  * CPU: Arm Ampere® Altra®, 16 cores, architecture: ARM64
  * Memory: 128 GB


#### `nodeType`
```yaml
spec:
  components:
    - name: backend
      runtime:
        nodeType: memory-optimized-2-v1
      environmentConfig:
        - environment: prod
          runtime:
            nodeType: gpu-nvidia-1-v1
```
The `nodeType` property in `runtime` defines the particular Kubernetes cluster node (virtual machine) in the list of supported by Radix, where a component or job replicas should be running on. Currently supported list of node types:
* `memory-optimized-2-v1`
  * CPU: Intel Xeon 4th Gen Scalable (Sapphire Rapids) [x86-64], 96 cores
  * Memory: 1946 GB
  * GPU: n/a
* `gpu-nvidia-1-v1` 
  * CPU: AMD EPYC (Genoa) [x86-64], 40 cores
  * Memory: 320 GB
  * GPU: 1 x Nvidia PCIe H100 GPU, 94 GB of memory 
:::warning
Nodes, available with `nodeType` property are usually much more expensive than default nodes. Please use them only when needed, preferable with jobs, as these nodes automatically scaled up on started component or jobs (which can take up to 5 minutes) and scaled down (within minutes) when the job is finished.
:::
:::note
Properties `architecture` and `nodeType` cannot be used at the same time, but they can be used one on the component or job level, another on the `environmentConfig` level.
:::
```yaml
spec:
  components:
    - name: backend
      runtime:
        nodeType: memory-optimized-2-v1
      environmentConfig:
        - environment: prod
          runtime:
            architecture: amd64|arm64
```

If you use the [`build and deploy`](/guides/build-and-deploy) pipeline to build components or jobs, [`useBuildKit`](#usebuildkit) must be enabled if at least one component or job is configured for `arm64`. Radix will run the **build steps** on nodes with matching architecture, which in most cases mean that you do not have to change anything in the Dockerfile to support the configured architecture. This applies as long as the images defined in the Dockerfile's `FROM <image>` supports this architecture.

For deploy-only components and jobs (with [`image`](#image) property set), make sure that the selected image supports the configured architecture. Many frequently used public images, like [nginx-unprivileged](https://hub.docker.com/r/nginxinc/nginx-unprivileged), includes variants for both `amd64` and `arm64` in the same image. Radix (Kubernetes) will pull the appropriate variant based on the configured architecture.

### `network`

```yaml
spec:
  environment:
    - name: dev
    - name: qa
    - name: prod
  components:
    - name: backend
      network:
        ingress:
          public:
            proxyBodySize: 500m
            proxyReadTimeout: 5
            proxySendTimeout: 10
            proxyBufferSize: 16k
            proxyRequestBuffering: true
            allow:
              - 100.1.1.1
              - 110.1.1.1/30
      environmentConfig:
        - environment: dev
          network:
            ingress:
              public:
                proxyBodySize: 20m
                proxyReadTimeout: 30
                proxySendTimeout: 30
                proxyBufferSize: 8k
                proxyRequestBuffering: false
                allow: []
        - environment: qa
          network:
            ingress:
              public:
                proxyBodySize: 100m
                allow:
                  - 200.1.1.1
                  - 200.10.1.1
        - environment: prod
```

`network.ingress.public` contains settings used to control the behavior of [public endpoints](../docs/topic-domain-names/). These settings can be configured on the component level and/or in `environmentConfig` for a specific environment. `environmentConfig` takes precedence over component level configuration.

- `allow`: Defines a list of public IP addresses or CIDRs allowed to access the component's public endpoints. Setting `allow` to an empty list allows access from all public IP addresses.  
**Note**: When `allow` is configured in `environmentConfig`, it will _overwrite_ any values defined on component level. 
- `proxyBodySize`: Sets the maximum allowed size of the client request body. Sizes can be specified in bytes, kilobytes (suffixes k and K), megabytes (suffixes m and M), or gigabytes (suffixes g and G), for example "1024", "64k", "32m" or "2g". If the size in a request exceeds the configured value, the 413 (Request Entity Too Large) error is returned to the client. Setting this value to "0" disables checking of client request body size. The default is 100m.
- `proxyReadTimeout`: Defines a timeout, in seconds, for reading a response from the proxied server. The timeout is set only between two successive read operations, not for the transmission of the whole response. If the proxied server does not transmit anything within this time, the connection is closed. The default is 60 seconds.
- `proxySendTimeout`: Defines a timeout, in seconds, for transmitting a request to the proxied server. The timeout is set only between two successive write operations, not for the transmission of the whole request. If the proxied server does not receive anything within this time, the connection is closed. The default is 60 seconds.
- `proxyBufferSize`: Sets the size of the buffer used for reading the first part of the response received from the proxied server. The size must be large enough to hold the response headers. Sizes can be specified in bytes, kilobytes (suffixes k and K), megabytes (suffixes m and M), or gigabytes (suffixes g and G) for example, "1024", "64k", "32m", "2g". If the response headers exceed the buffer size, the 502 (Bad Gateway) error is returned to the client. The default is `16k`.
- `proxyRequestBuffering`: Enable or disable buffering of the request body before sending it to your backend. Enabled by default. Disable this to get the request faster to your server when uploading, or streaming data to your API.

:::warning Caution
Setting `proxyBodySize` to "0", or an unnecessary high value, can lead to instability/denial of service or increased cost, depending on how the request body is processed by the backend, e.g. when buffering to memory or storing the content to disk, either locally or remotely. Never set the value to "0" unless the backend component is configured to enforce a limit.
:::

## `jobs`

This is where you specify the various [jobs](/guides/jobs) for your application.

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

The port number that the [job-scheduler](/guides/jobs/job-manager-and-job-api.md) will listen to for HTTP requests to manage jobs. schedulerPort is a **required** field.

In the example above, the URL for the compute job-scheduler is `http://compute:8000`

### `command`
```yaml
spec:
  jobs:
    - name: compute
      command:
      - ./run.sh
```
`command` - (optional) sets or overrides [ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint) directive array in a docker image. Read more about [command](/radix-config/#command). It can be overridden for individual job or batch jobs, read [more](/guides/jobs/job-manager-and-job-api#parameters).

When `command` in an `environmentConfig` is set to an empty array `[]`, it will suppress `command` on the component or job-component level if exists, an [ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint) directive in the Dockerfile will be used if defined.

### `args`
```yaml
spec:
  jobs:
    - name: compute
      args:
      - --output=json
      - --log-level=info
```
`args` - (optional) sets or overrides [CMD](https://docs.docker.com/reference/dockerfile/#cmd) directive array in a docker image. Read more about [args](/radix-config/#args). It can be overridden for individual job or batch jobs, read [more](/guides/jobs/job-manager-and-job-api#parameters).

When `args` in an `environmentConfig` is set to an empty array `[]`, it will suppress `args` on the component or job-component level if exists, an [CMD](https://docs.docker.com/reference/dockerfile/#cmd) directive in the Dockerfile will be used if defined.

### `notifications`

```yaml
spec:
  jobs:
    - name: compute
      notifications:
        webhook: http://api:8080/monitor-batch-status
```

`webhook` is an optional URL to the Radix application component or job component which will be called when any of the job-component's running jobs or batches changes states. Only changes are sent by POST method with a `application/json` `ContentType` in a [batch event format](/guides/jobs/notifications.md#radix-batch-event). Read [more](/guides/jobs/notifications)

### `batchStatusRules`

```yaml
spec:
  jobs:
    - name: compute
      batchStatusRules:
        - condition: Any
          operator: In
          jobStatuses:
            - Failed
          batchStatus: Failed
        - condition: All
          operator: NotIn
          jobStatuses:
            - Waiting
            - Active
            - Running
          batchStatus: Completed
```
`batchStatusRules` - Optional rules to define batch statuses by their jobs statuses. 
- `condition` - `Any`, `All`
- `operator` - `In`, `NotIn`
- `jobStatuses` - `Waiting`, `Active`, `Running`, `Succeeded`, `Failed`, `Stopped`
- `batchStatus` - `Waiting`, `Active`, `Running`, `Succeeded`, `Failed`, `Stopping`, `Stopped`, `Completed`

Rules are applied in the order from top to bottom in the rules list. When any rule matches, rules following it are ignored.

If `batchStatusRules` are not defined or no rules match a batch status is set by following rules:
* `Waiting` - no jobs are started
* `Active` - any jobs are in `Active` or `Running` state
* `Completed` - no jobs are in `Waiting`, `Active` or `Running` states

Batch statuses, default or defined by rules, are the same in the Radix console, returned by [job notifications](/guides/jobs/notifications.md) and [Job Manager API](/guides/jobs/job-manager-and-job-api.md). If rules are changed, they will be applied on next deployment of an application environment, also affecting already existing batches statuses in this environment.

`batchStatusRules` [can be overridden](#batchstatusrules-1) for individual environments.

### `monitoring`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          monitoring: true
```

When the `monitoring` field of a job-component environment config is set to `true`, is used to expose custom application metrics for the specific environment.

See [monitoring](#monitoring) for more information.

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

See [monitoringConfig](#monitoringconfig) for a component for more information.

### `payload`

```yaml
spec:
  jobs:
    - name: compute
      schedulerPort: 8000
      payload:
        path: /compute/args
```

Job specific arguments must be sent in the request body to the [job-scheduler](/guides/jobs/job-manager-and-job-api.md) as a JSON document with an element named `payload` and a value of type string.

The data type of the `payload` value is string, and it can therefore contain any type of data (text, json, binary) as long as you encode it as a string, e.g. base64, when sending it to the job-scheduler, and decoding it when reading it from the mounted file inside the job container. The content of the payload is then mounted into the job container as a file named `payload` in the directory specified in the `payload.path`. The max size of the payload is 1MB.

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

The maximum number of seconds a job can run, with a default value of `43200` seconds (12 hours). If the job's running time exceeds the limit, a SIGTERM signal is sent to allow the job to gracefully shut down with a 30 second time limit, after which it will be forcefully terminated.

### `backoffLimit`

```yaml
spec:
  jobs:
    - name: compute
      backoffLimit: 5
```

Defines the number of times a job will be restarted if its container exits in error. Once the `backoffLimit` has been reached the job will be marked as `Failed`. The default value is `0`.

### `failurePolicy`

```yaml
spec:
  jobs:
    - name: compute
      backoffLimit: 5
      failurePolicy:
        rules:
          - action: FailJob
            onExitCodes:
              operator: In
              values: [1]
          - action: Ignore
            onExitCodes:
              operator: In
              values: [143]
      environmentConfig:
        - environment: prod
          failurePolicy:
            rules:
              - action: FailJob
                onExitCodes:
                  operator: In
                  values: [42]
```

`failurePolicy` defines how job container failures should be handled based on the exit code. When a job container exits with a non-zero exit code, it is evaluated against the `rules` in the order they are defined. Once a rule matches the exit code, the remaining rules are ignored, and the defined `action` is performed. When no rule matches the exit code, the default handling is applied.

Possible values for `action` are:
- `FailJob`: indicates that the job should be marked as `Failed`, even if [`backoffLimit`](#backofflimit) has not been reached.
- `Ignore`: indicates that the counter towards [`backoffLimit`](#backofflimit) should not be incremented.
- `Count`: indicates that the job should be handled the default way. The counter towards [`backoffLimit`](#backofflimit) is incremented.


`failurePolicy` can be configured on the job level, or in `environmentConfig` for a specific environment. Configuration in `environmentConfig` will override all rules defined on the job level. 

### `volumeMounts`

```yaml
spec:
  jobs:
    - name: compute
      volumeMounts:
        - name: volume-name
          path: /path/in/container/to/mount/to
          blobFuse2:
            container: container-name
            uid: 1000
```

The `volumeMounts` field configures volume mounts within the job-component.

See [volumeMounts](#volumemounts) for more information.

### `imageTagName`

```yaml
jobs:
  - name: compute
    image: docker.pkg.github.com/equinor/myapp/compute:{imageTagName}
    imageTagName: master-latest
```
The `imageTagName` allows for flexible configuration of fixed images, built outside of Radix. It can be configured with separate tag for each environment.

See [imageTagName](#imagetagname) for a component for more information.

### `environmentConfig`

The `environmentConfig` section is to set environment-specific settings for each job.

#### `command`
```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          command:
          - ./run.sh
```
`command` - (optional) sets or overrides [ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint) directive array in a docker image. It can also override the component's `command` if it exists. Read more about [command](/radix-config/#command). It can be overridden for individual job or batch jobs, read [more](/guides/jobs/job-manager-and-job-api#parameters).

#### `args`
```yaml
spec:
  jobs:
    - name: compute
      args:
        - --output=yaml
      environmentConfig:
        - environment: prod
          args:
          - --output=json
          - --log-level=info
```
`args` - (optional) sets or overrides [CMD](https://docs.docker.com/reference/dockerfile/#cmd) directive array in a docker image. It can also override the component's `args` if it exists. Read more about [args](/radix-config/#args). It can be overridden for individual job or batch jobs, read [more](/guides/jobs/job-manager-and-job-api#parameters).

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

#### `batchStatusRules`

```yaml
spec:
  jobs:
    - name: compute
      batchStatusRules:
        - condition: All
          operator: NotIn
          jobStatuses:
            - Waiting
            - Active
            - Running
          batchStatus: Completed
      environmentConfig:
        - environment: prod
          batchStatusRules:
            - condition: All
              operator: In
              jobStatuses:
                - Succeeded
              batchStatus: Succeeded
```
When `batchStatusRules` is defined for an environment it fully overrides the job's `batchStatusRules`.
See [batchStatusRules](#batchstatusrules) for a job for more information.

#### `monitoring`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          monitoring: true
```

When the `monitoring` field of a job-component environment config is set to `true`, is used to expose custom application metrics for the specific environment.

See [monitoring](#monitoring) for more information.

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

See [variables](#variables-common) for a component for more information.

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
The `imageTagName` can be configured with separate tag for each environment. Environment `imageTagName` overrides a job-component `imageTagName` if it is also defined.

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
              blobFuse2:
                container: container-name
                uid: 1000
```

The `volumeMounts` field configures volume mounts within the job-component running in the specific environment. EnvironmentConfig `volumeMounts` combine or override a job-component `volumeMounts` if they are defined.

See [volumeMounts](#volumemounts) for more information.

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

#### `failurePolicy`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          backoffLimit: 5
          failurePolicy:
            rules:
              - action: FailJob
                onExitCodes:
                  operator: In
                  values: [42]
              - action: Count
                onExitCodes:
                  operator: In
                  values: [1, 2, 3]
              - action: Ignore
                onExitCodes:
                  operator: In
                  values: [143]
```

See [failurePolicy](#failurepolicy) for more information.

#### `readOnlyFileSystem`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          readOnlyFileSystem: true|false
```

See [readOnlyFileSystem](#readonlyfilesystem-1) for more information.

#### `runtime`

##### `architecture`

```yaml
spec:
  jobs:
    - name: compute
      environmentConfig:
        - environment: prod
          runtime:
            architecture: amd64|arm64
```

##### `nodeType`

```yaml
spec:
  components:
    - name: backend
      environmentConfig:
        - environment: prod
          runtime:
            nodeType: memory-optimized-2-v1
```
See [runtime](#runtime-1) for more information.

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

### `readOnlyFileSystem`

```yaml
spec:
  jobs:
    - name: compute
      readOnlyFileSystem: true|false
      environmentConfig:
        - environment: prod
          readOnlyFileSystem: true|false
```

See [readOnlyFileSystem](#readonlyfilesystem-1) for more information.

### `runtime`

```yaml
spec:
  jobs:
    - name: compute
      runtime:
        architecture: amd64|arm64
      environmentConfig:
        - environment: prod
          runtime:
            architecture: amd64|arm64
```

See [runtime](#runtime-1) for more information.

## `dnsAppAlias`

```yaml
spec:
  dnsAppAlias:
    environment: prod
    component: frontend
```

Creates a short, predictable DNS name for a single component in a single environment. The alias format is:

`<app-name>.app.<cluster-dns-zone>`   

- `<cluster-dns-zone>` depends on the Radix cluster where the app is deployed (see [Radix clusters](../start/radix-clusters/)).
- The alias is added in addition to Radix's automatically assigned domain names.

Example: The `frontend` component in `prod` becomes reachable at 

 - `myapp.app.radix.equinor.com` if hosted in the Platform cluster (North Europe)
 - `myapp.app.c2.radix.equinor.com` if hosted in the Platform 2 cluster (West Europe)
 - `myapp.app.playground.radix.equinor.com` if hosted in the Playground cluster

## `dnsAlias`

```yaml
spec:
  dnsAlias:
    - alias: myapp
      environment: prod
      component: frontend
```

Define your own aliases for a component in a specific environment. Each entry produces an alias with this format:

`<alias>.<cluster-dns-zone>` 

:::info  Observe the following
Aliases are scoped to the specified environment and component.
Reserved aliases (not allowed):  
  `www`, `app`, `api`, `console`, `webhook`, `playground`, `dev`, `grafana`, `prometheus`, `canary`, `cost-api`.
:::

Example: The `frontend` component in `prod` becomes reachable at 

 - `myapp.radix.equinor.com` if hosted in the Platform cluster (North Europe)
 - `myapp.c2.radix.equinor.com` if hosted in the Platform 2 cluster (West Europe)

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

Attach one or more custom (external) domains to a public component. Requirements and behavior:

- Each alias must point to a component that is public (has a public port).
- Provide a domain name that you control; configure your DNS (CNAME/A) to point to the Radix-managed hostname as described in the [external alias guide](/guides/external-alias/)
- TLS:
  - `useCertificateAutomation: true` — Radix obtains and renews the TLS certificate automatically
  - `useCertificateAutomation: false` — you must upload a valid certificate and private key for the alias

For setup steps and DNS/TLS details see the external alias [guide](/guides/external-alias/)


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

:::tip
See [guide](/guides/deploy-only/) on how make use of `privateImageHubs` in a deploy-only scenario.
:::

## `node`

`node` section is deprecated. Please use [nodeType](#nodetype) instead.

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
- `path` - Folder path in running replica container, where secrets, keys and/or certificate contents are available as files (with file names, corresponding to their names in the Azure Key Vault). This field is optional. If set, it overrides default path: `/mnt/azure-key-vault/<azure-key-vault-name>`.
- `useAzureIdentity` - If set to `true`, Radix will use [Azure Workload Identity](../guides/workload-identity/index.md) to acquire credentials for accessing Azure Key Vault using the service principal configured in [identity.azure](#identity). This field is optional, with default value `false`. If omitted or set to `false`, credentials are acquired using [Azure Service Principal Client ID and Client Secret](/guides/azure-key-vaults/#authentication-with-azure-service-principal-client-id-and-client-secret).
- `items` - list of secrets, keys and/or certificates with corresponding environment variable names.
  - `name` - name of secret, key or certificate in an Azure Key Vault.
  - `type` - Type of the item in the Azure Key Vault. Possible values: `secret`, `key`, `cert`. This field is optional, by default it is `secret`.
  - `envVar` - Name of an environment variable, which will contain specified secret, key or certificate. This field is optional - environment variable is not created if it is not specified, only file exist (see the property `path`).
  - `alias` - Alias of the file (see the property `path`). This field is optional. Default value is the same as `name`.

`secretRefs` can be configured for entire component, for component environments or only for specific component environments. Configuration in component environments overrides similar component properties.

Updated values of secrets, keys or certificates in Azure Key Vault are not automatically synced to corresponding secrets of already running replicas - they can be synced with a new deployment.

Azure Key Vaults configurable the same way in job-components.

:::tip
See [guide](/guides/azure-key-vaults/) on how to configure Azure Key Vault in Radix.
:::

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
        webhookEnabled: false
        fromType: branch
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
      enabled: true
      volumeMounts:
        - name: volume-name
          path: /path/in/container/to/mount/to
          blobFuse2:
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
