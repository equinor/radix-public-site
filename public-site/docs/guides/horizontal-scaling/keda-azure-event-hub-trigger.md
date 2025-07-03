---
title: Azure Event Hub
---

# Keda Azure Event Hub Trigger



##### Authenticate Keda for scaling
* [Workload Identity](#azure-service-bus-workload-identity)
* [Connection string](#azure-service-bus-connection-string)
###### Azure Service Bus Workload Identity
You must provide a clientId to a managed identity, that contains a federated credential with these properties:
```yaml
Federated credential scenario: Kubernetes Service Account
# Find real and current value here: https://console.radix.equinor.com/about (CLUSTER_OIDC_ISSUER_URL), 
# it will change in the future, we will post details in the slack channel #omnia-radix when it must be changed.
Cluster Issuer URL: https://northeurope.oic.prod-aks.azure.com/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000/ 
Namespace: keda
Service Account: keda-operator

# ⚠️ When you give Keda access to your Service Bus, any other Radix app can scale their app based on your queue. 
#    We are hoping on improving this - https://github.com/kedacore/keda/issues/5630
```
````yaml
- name: azuresb
  azureServiceBus:
    namespace: <servicebus-namespace> #.servicebus.windows.net
    queueName: main
    authentication:
      identity:
        azure:
          clientId: <client-id-of-service-principal>
````
###### Azure Service Bus connection string
````yaml
- name: azuresb
  azureServiceBus:
    namespace: <servicebus-namespace> #.servicebus.windows.net
    queueName: main
    connectionFromEnv: SERVICEBUS_CONNECTIONSTRING_ENV_NAME
````
`connectionFromEnv` - Name of the environment variable your deployment uses to get the connection string of the Azure Service Bus namespace. 
