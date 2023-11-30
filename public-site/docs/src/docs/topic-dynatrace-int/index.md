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
# Use Dynatrace PRE_PRODs tenant to build image and is only relevant for which secret is used to authenticate the image
FROM spa-equinor.kanari.com/e/eddaec99-38b1-4a9c-9f4c-9148921efa10/linux/oneagent-codemodules:all as dynatrace_repo

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

WORKDIR /source
COPY . .
WORKDIR /source/api
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:6.0 
WORKDIR /app
COPY --from=build /app ./
EXPOSE 5000

ENV DT_TAGS <APP-NAME> # Set yor app name here
COPY --from=dynatrace_repo / /
RUN mkdir /logs && chown -R 1001:1001 /logs

#Dynatrace config
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

# Runtime user change to non-root for added security
USER 1001
ENTRYPOINT ["dotnet", "api.dll", "--urls=http://0.0.0.0:5000"]
```

To build this dockerfile you must use a private build image secret (log in [here](https://statoilsrm.sharepoint.com/sites/applicationperformancemanagement/SitePages/Install-on-Linux.aspx?xsdata=MDV8MDF8fDRlMTgyMmRkYTU3YjRmOWVmNGRiMDhkYmYxODE1NmYzfDNhYTRhMjM1YjZlMjQ4ZDU5MTk1N2ZjZjA1YjQ1OWIwfDB8MHw2MzgzNjkzMTAwMTUxMTcwNTl8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKV0lqb2lNQzR3TGpBd01EQWlMQ0pRSWpvaVYybHVNeklpTENKQlRpSTZJazkwYUdWeUlpd2lWMVFpT2pFeGZRPT18MXxMMk5vWVhSekx6RTVPalV6WkdVeU1EVm1MVEF3WkRRdE5HUTFZeTA0TXpZM0xUWTFOalJtTkRBd1kyWXhOVjlpWXpNMFlqQXlaQzB3WXpoaExUUXlZbVV0T1RneE1DMWlaREU0TkdFM05qSXpZMlJBZFc1eExtZGliQzV6Y0dGalpYTXZiV1Z6YzJGblpYTXZNVGN3TVRNek5ESXdNRE14TWc9PXw5MGI0NGI0YzE1NDQ0OTBlZjRkYjA4ZGJmMTgxNTZmM3w0NDg2ODMxNDBhODA0YWFmOTk2Zjk1MGEwODllNDdkYQ%3D%3D&sdata=Qm1TMFRaV2d1YVo1SkU2QkpIUVpDYVpPTTVQMEJnajlTdUorM2ZLYzdsUT0%3D&ovuser=3aa4a235-b6e2-48d5-9195-7fcf05b459b0%2CRIHAG%40equinor.com&OR=Teams-HL&CT=1701334205387&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yMzExMDIzMTgwOCIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D) and take note of the PRE_PRODUCTION Api Token from the example ocmmand)

Then Update your `radixconfig.yaml` with these arguments:

```yaml
apiVersion: radix.equinor.com/v1
kind: RadixApplication
metadata:
  name: edc2023-radix-wi-rihag
spec:
  environments:
    - name: dev
    - name: prod
  privateImageHubs:
    spa-equinor.kanari.com:
      username: eddaec99-38b1-4a9c-9f4c-9148921efa10
  build:
    useBuildKit: true # usBuildKit is required to use private image hubs when building
  components:
    - name: web
      environmentConfig:
        - environment: dev
          variables:
            DT_TENANT: eddaec99-38b1-4a9c-9f4c-9148921efa10
        - environment: prod
          variables:
            DT_TENANT: da982f2e-adc0-4062-a06c-67889dfe4e1a
```

After changing your `radixconfig.yaml` file and pushing the changes, you must log in to your Application Configuration page in https://console.radix.equinor.com and paste in the API-Token under **App Secrets** and **Private image hubs**
