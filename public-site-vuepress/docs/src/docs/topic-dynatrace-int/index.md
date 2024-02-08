---
title: Integrate Dynatrace in a Radix app
---

# Integrate Dynatrace in a Radix app

Adding Dynatrace as your monitoring tool can be done by adding the Dynatrace agent to your build. See the sample below.

This method adds DynaTrace OneAgent to the container, and uses RadixConfig to manipulate environment.

::: tip TLDR
- Always use pre-production image in dockerfile.
- Add `spa-equinor.kanari.com` to `privateImageHubs` in your `radixconfig.yaml` file.
- Override `DT_TENANT`, `DT_TENANTTOKEN` and `DT_CONNECTION_POINT` with Radix Secrets.
- Push updated `Dockerfile` and `radixconfig.yaml` file so Radix is aware of the changes,
  - update application configuration with private build image secret
  - update each environments secrets with dynatrace config  
- Join the Slack channel ***#application-performance-management***.

:::

### Dockerfile sample

```dockerfile
# Always use Dynatrace pre-production image
FROM spa-equinor.kanari.com/e/eddaec99-38b1-4a9c-9f4c-9148921efa10/linux/oneagent-codemodules:all AS DYNATRACE


FROM mcr.microsoft.com/dotnet/sdk:6.0 AS BUILD
WORKDIR /source
COPY . .
WORKDIR /source/api
RUN dotnet publish -c release -o /app


FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS PRODUCTION 

#Dynatrace config
COPY --from=DYNATRACE / /
ENV DT_TENANT eddaec99-38b1-4a9c-9f4c-9148921efa10  # Defaults to PRE-PRODUCTION, can be changed in RadixConfig for Prod
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so
ENV DT_TAGS DT_MZ=<TeamMzName> # Set yor app name here

#Application config
WORKDIR /app
RUN mkdir /logs && chown -R 1001:1001 /logs
COPY --from=BUILD /app ./

# Runtime user change to non-root for added security
EXPOSE 5000
USER 1001
ENTRYPOINT ["dotnet", "api.dll", "--urls=http://0.0.0.0:5000"]
```

To build this dockerfile you must use a private build image secret 
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
      # always use Dynatrace pre-production image
      username: eddaec99-38b1-4a9c-9f4c-9148921efa10
  build:
    # usBuildKit is required to use private image hubs when building
    useBuildKit: true
  components:
    - name: web
      # Get secrets from Dynatrace json api:
      secrets:
        - DT_TENANT
        - DT_TENANTTOKEN # tenantToken from response
        - DT_CONNECTION_POINT # formattedCommunicationEndpoints from response
```

After changing your `radixconfig.yaml` file and pushing the changes, you must log in to your Application Configuration page in [Radix Console](https://console.radix.equinor.com) and paste in the PaaS-Token in **Private image hubs** under **App Secrets**. 
Then you must update environment secrets in each component with corresponding Dynatrace configuration: `DT_TENANT`, `DT_TENANTTOKEN` (`tenantToken`) and `DT_CONNECTION_POINT` (`formattedCommunicationEndpoints`).
```request
GET https://spa-equinor.kanari.com/e/<DT_TENANT>/api/v1/deployment/installer/agent/connectioninfo
accept: application/json
Authorization: Api-Token <Paas Token>
```

- Read about Dynatrace Container monitoring integration [here](https://statoilsrm.sharepoint.com/sites/applicationperformancemanagement/SitePages/Container-monitoring---attaching-to-a-management-zone.aspx)
- Read about Dynatrace secrets and configuration [here](https://statoilsrm.sharepoint.com/sites/applicationperformancemanagement/SitePages/Install-on-Linux.aspx)
