---
title: Radix CLI
---

# Radix CLI

## Purpose

[Radix command line interface](https://github.com/equinor/radix-cli) is an application to execute commands for getting information, creating a Radix application or pipeline jobs, setting values of secrets, start and stop Radis components and other operations, described below. The Radix CLI, available for multiple platforms, it can be downloaded from the [GitHub repository](https://github.com/equinor/radix-cli/tags).

## Use

The Radix CLI can be used on local PC, in CI workflow, in a docker container.

Commands can be executed for `platform` or `playground` cluster, specified by an option `--context` or `-c`. Example: `--context platform` or `-c playground`. When no context specified, `platform` is used.

The default context can be changed
```shell
rx set context --context playground
```
Check the current context
```shell
rx get context
```

Only applications, permitted for users or Azure AD groups, where they are member of, are available to execute commands for.

The command `rx --version` or `rx -v` shows the version, installed on the PC.

To get debug information about request, sent by the Radix CLI prefix the command with set of environment variable `DEBUG`: `DEBUG=true rx get application -a your-app-name`

### Run on a local PC

Download a [version of a Radix CLI](https://github.com/equinor/radix-cli/tags) for a required platform, extract an executable binary from an archive and move it to a folder, where executables usually located on the PC (or it can remain the folder, from it can be run). Example for a Linux or Mac:

```shell
LATEST_VERSION=$(
curl --silent "https://api.github.com/repos/equinor/radix-cli/releases/latest" |
grep '"tag_name":' |
sed -E 's/.*"v([^"]+)".*/\1/'
)

rx_tar=radix-cli_${LATEST_VERSION}_Darwin_x86_64.tar.gz
curl -OL "https://github.com/equinor/radix-cli/releases/download/v${LATEST_VERSION}/${rx_tar}"
tar -xf ${rx_tar}

sudo mv rx /usr/local/bin/rx
rm ${rx_tar}
```

To start working with Radix CLI, first login to the cluster:
```shell
rx login
```
Follow the provided Microsoft sign in device login URL and enter the provided code.

On successful login - commands can be executed within your user permissions to the Radix.

To clean up the login data - logout from the Radix:
```shell
rx logout
```

### Run in CI workflow
Custom continuous integration tool like Jenkins or GitHub Action can use Radix CLI with an access token with following options:
* `--token-environment` - Take the token from environment variable `APP_SERVICE_ACCOUNT_TOKEN`
* `--token-stdin` - Take the token from stdin

Radix CLI can be used with help of the GitHub Action [equinor/radix-github-actions](https://github.com/equinor/radix-github-actions).

More details can be found in guidelines and examples:
* [Guideline to run "Deploy Only" pipeline job](../../guides/deploy-only/)
* [Example of using GitHub action to create a Radix deploy pipeline job](../../guides/deploy-only/example-github-action-to-create-radix-deploy-pipeline-job.md)
* [Example of using AD service principal to get access to a Radix application in a GitHub action](../../guides/deploy-only/example-github-action-to-create-radix-deploy-pipeline-job.md)

### Commands

To find out which commands are available - run `rx` and add one of commands in the list "Available Commands":
`create`, `delete`, `get`, etc.

Run the `rx` with one of commands and add another command from the list "Available Commands". Example: `rx get`, which you can use with addition commands `application`, `context`, etc.: `rx get platform`. This way all available sub-commands and options can be found without documentation.

Scope can be specified for most commands:
* Radix cluster - all applications, available to the logged-in user on selected cluster ("context")
* Radix application
* environment of a Radix application
* component of a Radix application environment

Examples of commands:
* Register (create) a new Radix application. `Deploy key` will be returned as a response - it can be put to the repository's "Deploy keys" to give the Radix access to an internal or a private repository.
    ```shell
    rx create application --application your-application-name --repository https://github.com/your-repository --config-branch main --ad-groups abcdef-1234-5678-9aaa-abcdefgf --shared-secret someSecretPhrase12345 --configuration-item "YOUR PROJECT CONFIG ITEM" --context playground
    ```
* Create a new "deploy only" pipeline job
    ```shell
    rx create job deploy -a radix-test --environment dev
    ```
* Create a new "build and deploy" pipeline job
    ```shell
    rx create job build-deploy -a radix-test --branch main
    ```
* Get list of pipeline jobs for a Radix application. `jq` helps to filter returned `json` output
    ```shell
    rx get application -a radix-test | jq -r '.jobs'
    ```
* Get log of a Radix application component. Each log line will be prefixed with a name of the replica, which sent it
    ```shell
    rx get logs component -a your-app-name --environment qa --component auth
    ```
* Get log of all Radix application in an environment
    ```shell
    rx get logs environment -a your-app-name --environment qa
    ```
* Stop, start or restart a Radix application component
    ```shell
    rx stop component --application your-app-name --environment qa --component auth
    rx start component -a your-app-name -e qa --component auth
    rx restart component -a your-app-name -e qa --component auth
    ```
* Stop, start or restart all components in a Radix application environment
    ```shell
    rx stop environment --application your-app-name --environment qa
    rx start environment -a your-app-name --environment qa
    rx restart environment -a your-app-name -e qa
    ```
* Stop, start or restart all components in all Radix application environments
    ```shell
    rx stop application --application your-app-name
    rx start application -a your-app-name
    rx restart application -a your-app-name
    ```
* Set a value of a component secret
    ```shell
    rx set environment-secret -a your-app-name -e qa --component auth -s CLIENT_ID -v qtrty-1234-5678-9aaa-abcdefgf
    ```

