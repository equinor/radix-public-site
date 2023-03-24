---
title: Integrate Dynatrace in a Radix app
---

# Integrate Dynatrace in a Radix app

Adding Dynatrace as your monitoring tool can be done by adding the Dynatrace agent to your build. See the sample below.

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
