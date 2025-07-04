---
title: Azure Service Bus
---

## Authenticate Keda to Azure Service Bus
* [Authenticate with Workload Identity](#authenticate-with-workload-identity)
* [Authenticate with connection string](#authenticate-with-connection-string)
### Authenticate with Workload Identity
:::warning
When access to your Service Bus is provided to Keda, _any_ other Radix applications can scale their components based on your queue! Use authentication with [connection string](#authenticate-with-connection-string) to avoid this.

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

Cluster Issuer URL can be changed on cluster migration, please watch the Slack channel `#omnia-radix` for updates.

````yaml
spec:
  components:
    - name: backend
      horizontalScaling:
        minReplicas: 0
        maxReplicas: 2
        triggers:
          - name: azure-sb
            azureServiceBus:
              namespace: my-servicebus-namespace
              queueName: my-queue
              authentication:
                identity:
                  azure:
                    clientId: 00000000-0000-0000-0000-000000000000
````
Read more about [Azure workload identity](/guides/workload-identity/)
### Authenticate with connection string
````yaml
spec:
  components:
    - name: backend
      horizontalScaling:
        minReplicas: 0
        maxReplicas: 2
        triggers:
          - name: azure-sb
            azureServiceBus:
              queueName: my-queue
              connectionFromEnv: SERVICE_BUS_CONNECTION
````
`connectionFromEnv` - Name of the environment variable your deployment uses to get the connection string of the Azure Service Bus namespace. 
