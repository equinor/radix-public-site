---
title: When to not use Radix
---

## When to not use Radix

There will be certain circumstances that will Radix not suitable for your applications, some of these can be

- On-prem or Omnia Classic connectivity is required
- Needs to accept public traffic other than HTTP (eg. mqtt or UDP)
- Need **low-latency** persistant storage (eg. databases and similar)
- Your application needs **root** privileges
- Need to have direct access to Kubernetes
  - Need to deploy kubernetes resources using tools like Helm, Flux, Terraform, ArgoCD etc.
  - Need to use DAPR
  - Need to run own operators (e.g. redis operator to run Redis database in cluster)
- Need to use sidecars

However there are workaround for many of these cases, use the Radix community to ask for guidance.