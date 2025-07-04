---
title: Overview
---

# Horizontal Scaling
Scale your components replicas up and down based on resources (CPU, memory) or external metrics (CRON, Azure Service Bus, etc.).

Other trigger types can be found at https://keda.sh/docs/latest/scalers/ , their support can be implemented in Radix with feature requests in https://github.com/equinor/radix/issues

`horizontalScaling`can be overridden in application environments - Radix will merge `minReplicas`, `maxReplicas`, `pollingInterval` and `cooldownPeriod`. If any triggers are defined in the environment, they will replace _all_ triggers on the component level.

## Keda Azure Service Bus Trigger
Scale application components based on [Azure Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview) Queues or Topics.

Learn from an [example](https://github.com/equinor/radix-public-site/tree/main/examples/radix-example-keda-servicebus) scaling Radix application component by Azure Service Bus messages.

Azure Service Bus supports either `topicName` (with `subscriptionName`) or `queueName`. The target average can be configured with `messageCount` (defaults to 5) and `activationMessageCount` (defaults to 0).  Read [more](https://keda.sh/docs/2.17/concepts/scaling-deployments/#activating-and-scaling-thresholds) about activation.

Configure [Azure Service Bus trigger](./keda-azure-service-bus-trigger.md)

## Keda Azure Event Hub Trigger
Scale application components based on [Azure Event Hub](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about) events.

Azure Event Hub target average can be configured with `unprocessedEventThreshold` (defaults to 64) and `activationUnprocessedEventThreshold` (defaults to 0). Read [more](https://keda.sh/docs/2.17/concepts/scaling-deployments/#activating-and-scaling-thresholds) about activation.

