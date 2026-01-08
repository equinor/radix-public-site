---
title: Radix Shared Responsibility Model
---

# Shared Responsibility Model

To ensure platform security, efficient operations, and good hygiene, Radix follows a **shared responsibility model**. This means the Radix platform team and application teams each have clear roles in securing and maintaining the stack.

**Why Shared Responsibility?**

Radix provides a secure, managed platform. Application teams are responsible for securing and operating their workloads. Together, we reduce risk and keep services reliable.

:::tip Quick Summary 

- Radix secures and operates the **platform**  
- App Teams secure and operate their **applications**  
- When things break, we fix them together and write great postmortems
:::

---

## Who does what?

| Area                | Radix Platform Team           | Application Team                |
|---------------------|--------------------------------|---------------------------------|
| **Infrastructure**         | Secure, maintain and patch Kubernetes clusters    | Maintain Application specific infrastructure |
| **Network**                | TLS termination (HTTPS), ingress controls         | Application level encryption  |
| **Identity & Access**      | Platform RBAC, SSO integration                    | Application authentication, roles and permissions |
| **Secrets**                | Provide secure storage and management             | Update and maintain secrets |
| **Application security**   |                                                   | Secure code, dependencies, secrets |
| **Images & Supply Chain**  | Scanning for vulnerabilities                      | Fix vulnerabilities |
| **Compliance & Logging**   | Platform audit logs and retention                 | Implement application level logging and data controls |
| **Incident Response**.     | Handle platform-level incidents                   | Handle application incidents |
| **Lifecycle**              | Platform upgrades and stability                   | Deploy, maintain, and retire apps |
| **Cost & Quotas**          | Radix distribute the best cost                    | Ensures the application is not using more resources than necessary |
| **Disaster Recovery (DR)**   | Radix backs up all application configuration, and has a DR plan/handbook| Application DR plan  |

:::info TL;DR
Radix keeps the platform safe and up-to-date; App Teams keep their apps secure, observable, and healthy. Teamwork makes the dream work. 🤝
:::
---
## What is expected from Application teams?

- **Secure your code and dependencies** - follow OWASP best practices
- **Implement health checks and observability** - logs, metrics, alerts
- **Keep apps maintained** - patch vulnerabilities and update regularly
- **Respond to app incidents promptly**
- **Tune application resource requirements** - the resources are shared, do not reserve more than necessary

## What does Radix provide

- Hardened Kubernetes clusters and managed ingress
- Platform-level compliance and audit logging
- Quick response to Platform Incidents (An established Major Incident process)
- An active Radix community

---
## Why 

Clear accountability reduces ambiguity and risk. Radix keeps the platform secure and reliable; Application teams keep their apps healthy and compliant. Together, we deliver secure, resilient services.



