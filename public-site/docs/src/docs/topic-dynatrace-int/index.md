---
title: Integrate Dynatrace in a Radix app
---

# Integrate Dynatrace in a Radix app

Adding Dynatrace as your monitoring tool can be done by adding the Dynatrace agent to your build. See the sample below.

> Because Radix sends [build secrets](../../references/reference-radix-config/#build) to the Dockerfile `ARG` instruction [base64-encoded](../../guides/build-secrets/), these values cannot be use in the `FROM` instruction. This Dockerfile can be used to be built and pushed to own image repository and be referenced in the `radixconfig.yaml` in the [image](https://radix.equinor.com/references/reference-radix-config/#image) property of a component. 

This method are adding the oneagent to the containers, and manipulating environment etc with runtime environments. To be used with a [deploy only strategy](../../guides/deploy-only/)

::: tip Community
Join the Slack channel ***#application-performance-management***
:::


### Dockerfile sample

```yaml
ARG DYNATRACE_PAAS_TOKEN
ARG DYNATRACE_TENANT
ARG DYNATRACE_URL
FROM ${DYNATRACE_URL}/e/${DYNATRACE_TENANT}/linux/oneagent-codemodules:all as dynatrace_repo

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

WORKDIR /source
COPY . .
WORKDIR /source/api
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:6.0 
WORKDIR /app
COPY --from=build /app ./
EXPOSE 5000

COPY --from=dynatrace_repo / /
RUN mkdir /logs && chown -R 1001:1001 /logs

#Dynatrace config
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

# Runtime user change to non-root for added security
USER 1001
ENTRYPOINT ["dotnet", "api.dll", "--urls=http://0.0.0.0:5000"]
```
::: warning UNSUPPORTED
This Dockerfile is not supported by Radix and will not build. Build secrets are base64 encoded and cannot be used in FROM arguments in your Dockerfile.
:::
