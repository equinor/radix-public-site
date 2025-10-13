---
title: Overview
---

# Azure Service Bus
## Overview
Scale application components based on [Azure Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview) Queues or Topics.

Learn from an [example](https://github.com/equinor/radix-public-site/tree/main/examples/radix-example-keda-servicebus) scaling Radix application component by Azure Service Bus messages.

Azure Service Bus supports either `topicName` (with `subscriptionName`) or `queueName`. The target average value can be configured with `messageCount` (defaults to 5) and `activationMessageCount` (defaults to 0).  Read [more](https://keda.sh/docs/2.17/concepts/scaling-deployments/#activating-and-scaling-thresholds) about activating and scaling thresholds.

## Authentication
Authentication to the Azure Service Bus can be done with Workload Identity and with connection string. Read more about [Azure Service Bus trigger authentication](./keda-azure-service-bus-trigger-authentication.md).