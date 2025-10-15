---
title: Authentication
---

# Azure Event Hub authentication

## Authenticate with Workload Identity
:::warning
When access to your Event Hub is provided to Keda, _any_ other Radix applications can scale their components based on your queue! Use authentication with [connection string](#authenticate-with-connection-string) to avoid this.

We are hoping on improving this - https://github.com/kedacore/keda/issues/5630
:::
ClientID to a managed identity should be provided, that contains a federated credential with following properties:
```yaml
Federated credential scenario: Kubernetes Service Account
Cluster Issuer URL: https://northeurope.oic.prod-aks.azure.com/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000/ 
Namespace: keda
Service Account: keda-operator
```
`Cluster Issuer URL` - current value can be found in Radix console [About page](https://console.radix.equinor.com/about) in the environment variable `CLUSTER_OIDC_ISSUER_URL`.

Cluster Issuer URL can be changed during cluster migration, please watch the Slack channel `#omnia_radix` for updates.

````yaml
spec:
  components:
    - name: backend
      horizontalScaling:
        minReplicas: 0
        maxReplicas: 2
        triggers:
          - name: azure-eh
            azureEventHub:
              eventHubName: my-event-hub
              eventHubNamespace: my-event-hub-namespace
              accountName: my-storage-account
              container: my-blob-container
              authentication:
                identity:
                  azure:
                    clientId: 00000000-0000-0000-0000-000000000000
````
Read more about [Azure workload identity](../workload-identity/index.md)

## Authenticate with connection string
````yaml
spec:
  components:
    - name: backend
      secrets:
        - EVENT_HUB_CONNECTION
        - STORAGE_CONNECTION
      horizontalScaling:
        minReplicas: 0
        maxReplicas: 2
        triggers:
          - name: azure-eh
            azureEventHub:
              container: my-blob-container
              eventHubConnectionFromEnv: EVENT_HUB_CONNECTION
              storageConnectionFromEnv: STORAGE_CONNECTION
````
`storageConnectionFromEnv` - Name of the environment variable your deployment uses to get the connection string of the Azure Event Hub namespace. This connection string can be Event Hub namespace or instance scope.

### Namespace connection string
To get the connection string for your Event Hub namespace, follow these steps:
* Go to the [Azure portal](https://portal.azure.com/).
* Navigate to an Event Hub namespace.
* In the left-hand menu, select "Shared access policies".
* Select the policy to be used or create a new one with required claims: Manage, Send and/or Listen.
* Copy the "Primary Connection String" or "Secondary Connection String".
* Store the connection string in a [Radix secret](../../radix-config/index.md#secrets) or [Azure Key Vault](../../radix-config/index.md#azurekeyvault) secret of a component, e.g. `EVENT_HUB_CONNECTION`.

   This connection string has the following format:

   `Endpoint=sb://<sb>.servicebus.windows.net/;SharedAccessKeyName=<key name>;SharedAccessKey=<key value>`

   It does not have `EntityPath` property, so it can be used for all Event Hub instances in the namespace.

* Specify an instance name in `eventHubName` or in an environment variable, referred by `eventHubNameFromEnv` properties.

### Instance connection string
To get the connection string for an Event Hub instance, follow these steps:
* Go to the [Azure portal](https://portal.azure.com/).
* Navigate to an Event Hub namespace. 
* Select a specific Event Hub instance in "Entities/Event Hubs" list. 
* In the left-hand menu, select "Settings/Shared access policies".

![Shared access policy for event hub instance](./shared-access-policy-for-event-hub-instance.png)

* Select the policy to be used or create a new one with required claims: Manage, Send and/or Listen.
* Copy the "Primary Connection String" or "Secondary Connection String".

![Shared access policy for event hub instance connection string](./shared-access-policy-for-event-hub-instance-connection.png)

* Store the connection string in a [Radix secret](../../radix-config/index.md#secrets) or [Azure Key Vault](../../radix-config/index.md#azurekeyvault) secret of a component, e.g. `EVENT_HUB_CONNECTION`.

This connection string has the following format:

`Endpoint=sb://<sb>.servicebus.windows.net/;SharedAccessKeyName=<key name>;SharedAccessKey=<key value>;EntityPath=<hub-name>`

It includes the `EntityPath` property, therefore specifying `eventHubName` or `eventHubNameFromEnv` is not required.


