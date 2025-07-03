---
title: Overview
---

# Horizontal Scaling
Scale your components replicas up and down based on resources (CPU, memory) or external metrics (CRON, Azure Service Bus, etc.).

Other trigger types can be found at https://keda.sh/docs/latest/scalers/ , their support can be implemented in Radix with feature requests in https://github.com/equinor/radix/issues

`horizontalScaling`can be overridden in application environments - Radix will merge `minReplicas`, `maxReplicas`, `pollingInterval` and `cooldownPeriod`. If any triggers are defined in the environment, they will replace _all_ triggers on the component level.

