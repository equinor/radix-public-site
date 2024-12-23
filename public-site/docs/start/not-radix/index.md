---
title: When to not use Radix
---

## When to not use Radix

There will be certain circumstances that will Radix not suitable for your applications, some of these can be

- On-prem connectivity is required
- Need to use own terraform configurations
- Need to use own helm charts or flux
- Need to use DAPR
- Need to use sidecars
- Need to have direct access to Kubernetes components (pods, secrets, etc.)
- Need low-latency persistant storage (eg. databases and similar)
- Needs to accept traffic other than HTTP (eg. mqtt or UDP)
- Need to run own operators (e.g. redis operator to run Redis database in cluster)

However there are workaround for many of these cases, use the Radix community to ask for guidance.