---
title: Radix CLI
---

# Radix CLI

## Purpose

[Radix CLI](https://github.com/equinor/radix-cli) is an application to execute commands for getting information, creating a Radix application or pipeline jobs, setting values of secrets, start and stop Radis components and other operations, described below. The Radix CLI, available for multiple platforms, it can be downloaded from the [GitHub repository](https://github.com/equinor/radix-cli/releases).

## Use

Radix CLI can be installed and run from your local PC, as a Docker container, or in CI workflows, like GitHub actions.

Commands can be executed towards all Radix cluster, either by  setting the `--context` flag when executing a command, or by configuring the default context. `platform` is used if no context is specified.

Set the default context:
```shell
rx set context --context playground
```
Check the current context:
```shell
rx get context
```

### Run on a local PC

Install Radix CLI locally by following the installation instructions in the [Radix CLI GitHub repository](https://github.com/equinor/radix-cli#installation).

To start working with Radix CLI you must first login:
```shell
rx login
```

After successful login, you can start executing commands.

To clean up the login data, logout from the Radix:
```shell
rx logout
```

Radix CLI uses Radix API to execute operations. An option `verbose` can be used to get more details about requests and responses to and from the Radix CLI:
```shell
rx create pipeline-job deploy -a your-app-name -e dev --verbose
```

### Run in CI workflow
Custom continuous integration tool like Jenkins or GitHub Action can use Radix CLI with an access token with following options:
* `--token-environment` - Take the token from environment variable `APP_SERVICE_ACCOUNT_TOKEN`
* `--token-stdin` - Take the token from stdin

Radix CLI can be used with help of the GitHub Action [equinor/radix-github-actions](https://github.com/equinor/radix-github-actions).

More details can be found in guidelines and examples:
* [Guideline to run "Deploy Only" pipeline job](/guides/deploy-only/)
* [Example of using GitHub action to create a Radix deploy pipeline job](/guides/deploy-only/example-github-action-to-create-radix-deploy-pipeline-job.md)
* [Example of using AD service principal to get access to a Radix application in a GitHub action](/guides/deploy-only/example-github-action-to-create-radix-deploy-pipeline-job.md)
* [Example of using GitHub Action to build and push container to custom Container Registry](/guides/deploy-only/example-github-action-building-and-deploying-application.md)

### Commands

To find out which commands are available - run `rx` and add one of commands in the list "Available Commands":
`create`, `delete`, `get`, etc.

Run the `rx` with one of commands and add another command from the list "Available Commands". Example: `rx get`, which you can use with addition commands `application`, `context`, etc.: `rx get platform`. This way all available sub-commands and options can be found without documentation.

Scope can be specified for most commands:
* Radix cluster - all applications, available to the logged-in user on selected cluster ("context")
* Radix application
* environment of a Radix application
* component of a Radix application environment

## Examples
#### Register application
* Register (create) a new Radix application. `Deploy key` will be returned as a response - it can be put to the repository's "Deploy keys" to give the Radix access to an internal or a private repository.
    ```shell
    rx create application --application your-application-name --repository https://github.com/your-repository --config-branch main --ad-groups abcdef-1234-5678-9aaa-abcdefgf --shared-secret someSecretPhrase12345 --configuration-item "YOUR PROJECT CONFIG ITEM" --context playground
    ```
#### Deploy pipeline job
* Create a new "deploy only" pipeline job. An optional argument `--follow`(`-f`) allows to watch the log of the job
    ```shell
    rx create pipeline-job deploy --application your-app-name --environment dev --follow
    rx create pipeline-job deploy -a your-app-name -e dev -f
    ```
:::tip
An option `job` of commands `create`, `get logs` is replaced with `pipeline-job`. It will be supported for backward compatibility. 
:::
* Create a new "deploy only" pipeline job with specified image tags. When `radixconfig.yaml` contains `image` option with dynamic [imageTagName](../../radix-config/index.md#imagetagname), this `imageTagName` can be altered in the Radix CLI `create pipeline-job deploy` command option `image-tag-name`. This option will override values defined in the `radixconfig.yaml` and can be defined for multiple components in the command. `image-tag-name`, provided as an option in the command `rx create pipeline-job deploy` is shown in the Radix pipeline orchestration job log. Component names that does not exist within the Radix application environment will be ignored.
    ```shell
    rx create pipeline-job deploy --application your-app-name --environment dev --image-tag-name web-app=stable-123 --image-tag-name api=1.22.0
    rx create pipeline-job deploy -a your-app-name -e dev -t web-app=stable-123 -t api=1.22.0
    ```
* Specify `commitID` to provide reference to a corresponding commit in the Radix console. 
    ```shell
    rx create pipeline-job deploy --application your-app-name --environment dev --commitID 019e0d411de667dff6952852e03b4a38b0a689c3
    ```
* Specify `component` to deploy when only specific component need to be deployed. Multiple components can be specified. Other components, if exist in the environment, will not be re-deployed, keeping their `commitID` and `gitTag`, environment variables, secrets, etc., their replicas will not be restarted.
    ```shell
    rx create pipeline-job deploy --application your-app-name --environment dev --component web-app
    rx create pipeline-job deploy -a your-app-name -e dev --component web-app --component api-server --commitID 019e0d411de667dff6952852e03b4a38b0a689c3
    ```
#### Build and deploy pipeline job
* Create a new "build and deploy" pipeline job
    ```shell
    rx create pipeline-job build-deploy -a your-app-name --branch main
    ```
  Optional argument `--use-build-cache=true|false` can override the radixconfig option [useBuildCache](/radix-config/index.md#usebuildcache)
#### Promote pipeline job
* Promote active deployment in one environment to another:
    ```shell
    rx create pipeline-job promote --application your-app-name --from-environment dev --to-environment prod --use-active-deployment
    ```
* Promote active deployment in one environment to another:
    ```shell
    rx create pipeline-job promote --application your-app-name --from-environment dev --to-environment prod --use-active-deployment
    ```
#### Manage pipeline jobs
* Restart failed or stopped pipeline job:
    ```shell
    rx restart pipeline-job --application your-app-name --job radix-pipeline-20231019122020-mhwif
    ```
* Get list of pipeline jobs for a Radix application. `jq` helps to filter returned `json` output
    ```shell
    rx get application -a your-app-name | jq -r '.jobs'
    ```
#### Log
* Get log of a Radix application component. Each log line will be prefixed with a name of the replica, which sent it
    ```shell
    rx get logs component -a your-app-name --environment your-env-name --component your-component-name
    ```
* Get log of all Radix application in an environment
    ```shell
    rx get logs environment -a your-app-name --environment your-env-name
    ```
* Get previous (terminated) container log of a Radix application component. This may help to indicate why the container was restarted. These logs are not always available as the Kubernetes node, where the pod with this container was running on, may have been removed or restarted.  
    ```shell
    rx get logs component --application your-app-name --environment your-env-name --component your-component-name --previous
    rx get logs component -a your-app-name -e your-env-name --component your-component-name -p
    ```
#### Start, stop, restart
* Stop, Scale, reset or restart a Radix application component
    ```shell
    rx stop component --application your-app-name --environment your-env-name --component your-component-name # does the same as scale to 0 replicas
    rx scale component -a your-app-name -e your-env-name --component your-component-name --replicas 5 # Allowed values: 0 - 20
    rx scale component -a your-app-name -e your-env-name --component your-component-name --reset # reset manually scaled or stopped component
    rx restart component -a your-app-name -e your-env-name --component your-component-name
  
    # Depreceated: replaced by `rx scale component -a your-app-name -e your-env-name -n your-component-name --reset`
    rx start -a your-app-name -e your-env-name -n your-component-name
    ```
* Stop, start or restart all components in a Radix application environment
    ```shell
    rx stop environment --application your-app-name --environment your-env-name
    rx start environment -a your-app-name --environment your-env-name
    rx restart environment -a your-app-name -e your-env-name
    ```
* Stop, start or restart all components in all Radix application environments
    ```shell
    rx stop application --application your-app-name
    rx start application -a your-app-name
    rx restart application -a your-app-name
    ```
#### Scale replicas
* Scale up or down Radix application component replicas. Allowed values between "0" and "20" (value "0" is an equivalent of the command `rx stop`). Scaling can be useful for tuning the resource configuration to figure out what amount of replicas affect performance of an application and particular need of CPU and memory. 
    ```bash
    rx scale component --application your-app-name --environment your-env-name --component web-app --replicas 2
    rx scale component --application your-app-name --environment your-env-name --component web-app --reset
    ```
  :::info
  This scale will persist after re-deployment, so remember to reset the component when you are finished.  
  After reset, scaled component gets replicas specified in the [`radixconfig.yaml`](../../radix-config/index.md), "1" if not specified, or set by [`horizontal scaling`](../../radix-config/index.md#horizontalscaling)  
  :::
#### Manage components
* Set a value of a component secret (runtime secret)
    ```shell
    rx set environment-secret -a your-app-name -e your-env-name --component your-component-name -s CLIENT_ID -v qtrty-1234-5678-9aaa-abcdefgf
    ```
* Set a value of a component environment variable (runtime environment variable)
    ```shell
    rx set environment-variable -a your-app-name -e your-env-name --component your-component-name --variable LOG_LEVEL --value DEBUG
    ```
* Set certificate and private key from files or string literals
    ```shell
    rx set external-dns-tls --application myapp --environment prod --component web --alias myapp.example.com --certificate-from-file "cert.crt" --private-key-from-file "cert.key"
    ```


