---
title: Service, support, uptime and availability
---

# Uptime and availability

We are experimenting with an approach with "release channels" which differ in update frequency, service level agreement (SLA) and expected stability.

| Cluster        | Purpose                                     | Upgrade             |   Support   |
| -------------- | ------------------------------------------- | :-----------------: | :---------: |
| **Platform**   | Products under development or in production |   Every ~6 months   |     Yes     |
| **Playground** | Testing and experimenting with Radix        |                     | Best-effort |

## Platform cluster availability and services

The Radix Platform should be used when your team has chosen Radix as PaaS (Platform-as-a-Service) for a product under development or in production.

### Support

Schedule for Radix DevOps/Support team - 08:00 - 16:00 CET/CEST on Norwegian working days

- **Support channels:** File issue on [radix-platform repo](https://github.com/equinor/radix-platform/issues) or ask on [#omnia_radix_support](https://equinor.slack.com/messages/CBKM6N2JY) on Slack
- **Response time:** As soon as possible within business hours, at least next business day
- **On-call duty:** No, please contact us to discuss options
- **Resolution time:** Cannot be guaranteed, but for critical issues work on fixing the problem will start immediately and continue within business hours until resolved

### Uptime

- **Platform monthly uptime: 99.9%** - expected uptime for Radix as a hosting platform
  - Measured platform uptime last 3 months: 99,95%
- **Radix services monthly uptime: 99%** - expected uptime for Radix services, like CI/CD and monitoring
- **Planned maintenance:** We will announce planned maintenance at least 2 business days in advance. Downtime during planned maintenance does not affect uptime goals
- **Disaster Recovery:** Procedure is in place and the procedure is executed on a weekly basis. Estimated time to recover a cluster is 15 minutes, estimated time to rebuild and recover a complete cluster is 1 hour

### Associated operational risks

- No incident management beyond schedule "Norway - default" - i.e. no support after 16:00 CET/CEST on Norwegian working days
- Infrastructure downtime despite robust, high-availability infrastructure

### Uptime risk management

A risk assessment for cluster uptime has been done, and the most critical risk scenarios are identified, and risk mitigation actions have been agreed upon and are implemented as required.

### Disaster recovery

Application configuration is backed up every hour using Velero and that backup is stored in the Azure Storage account. We have created a script that can create a new AKS instance and migrate all applications from the affected cluster to the new one.

**RTO (Recovery Time Objective)** has been estimated at 20 minutes from the moment the Radix team starts working on it. Keep in mind that the RTO is only an estimate since external factors can also influence the recovery time. For example, this time will increase if there is a high load on Azure REST API or Azure managed Kubernetes API server.

Some of the failure events that can take down the service or introduce delays and timeouts:

- Bad commit can introduce a bad code/bug in Radix components
- Executing a command in the wrong cluster
- Resource exhaustion, CPU, Memory, Disk issues
- Upgrading 3rd party components
- Azure resources/services are deleted
- MS Azure services unavailable
- Kubernetes bugs
- Kubernetes API changes
- Expired certificates
- Network issues, DDOS
- Expired secrets

We are working hard to mitigate as much of these as possible.

## Radix Playground services

Use Playground for testing Radix, see if it’s a good fit for your projects, and provide feedback. When you are ready to commit, register your application in the Radix Platform, even if your application still is development stage. The Radix Platform has improved services.

- **Support channels:** Same as for Radix Platform (see above). Help will be provided when team has capacity

- **Uptime:** "Best-effort", but no guarantee of uptime. Planned maintenance is announced as early as possible

**Please note:** applications hosted in the Playground cluster may need to be re-registered after maintenance, upgrades or migrations. All such required actions from your part will be communicated in the Radix slack channel.
