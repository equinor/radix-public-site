---
title: Azure Service Bus
---

# Keda Azure Service Bus Trigger
Take a look here [github.com/equinor/radix-public-site/examples/radix-example-keda-servicebus](https://github.com/equinor/radix-public-site/tree/main/examples/radix-example-keda-servicebus) for a sample implementation that runs on Radix.

Azure Service Bus supports either a `queueName`, or a `topicName` and `subscriptionName`. You can also select the target average `messageCount` (defaults to 5), and `activationMessageCount` (defaults to 0).

## Authenticate Keda to Azure Service Bus
* [Authenticate with Workload Identity](#authenticate-with-workload-identity)
* [Authenticate with connection string](#authenticate-with-connection-string)
### Authenticate with Workload Identity
:::warning
When access to your Service Bus is provided to Keda, _any_ other Radix applications can scale their components based on your queue! Use authentication with [connection string](/guides/horizontal-scaling/keda-azure-service-bus-trigger#azure-service-bus-connection-string) to avoid this.

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
          - name: azuresb
            azureServiceBus:
              namespace: <servicebus-namespace>
              queueName: <queue-name>
              topicName: <topic-name>
              subscriptionName: <subscription-name>
              messageCount: 5
              activationMessageCount: 0
              authentication:
                identity:
                  azure:
                    clientId: <client-id-of-service-principal>
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
        - name: azuresb
          azureServiceBus:
            namespace: <servicebus-namespace>
            queueName: main
            connectionFromEnv: SERVICEBUS_CONNECTIONSTRING_ENV_NAME
````
`connectionFromEnv` - Name of the environment variable your deployment uses to get the connection string of the Azure Service Bus namespace. 
