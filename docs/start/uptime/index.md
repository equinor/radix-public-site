---
title: Service, support, uptime and availability
---

# Uptime and availability
    
Historical uptime is an indicator of the reliability of a service, in our case the Radix Kubernetes cluster. We measure Radix uptime by sending requests from an external service every 1 minute to an endpoint running in Radix, and recording whether each request completed successfully. We then calculate the uptime number as the ratio (percentage) of aggregated time between consecutive successful requests over the length of the measurement period.

Radix only reports the measured uptime for the Radix platform, and not the other services we provide, i.e. build-deploy pipeline, monitoring, vulnerability scanning. We use an external service that monitors an application running on the Radix Platform, from outside the Azure tenant, and it calculates the availability of the monitored service.

| | |
|-|---------------------------------------|
| Service monitored: | `https://canary.radix.equinor.com` |
| Time period: | Rolling last 90 days |
|Monitoring tool: | Prometheus |
|Availability calculation %: | Uptime / (Uptime + Downtime) x 100 |

The [Uptime/Availability report](https://console.radix.equinor.com/about) gives an indication of the future reliability of the Radix Platform.


- **Planned maintenance:** We announce planned maintenance in our main Slack channel, [#omnia_radix](https://equinor.slack.com/archives/C8U7XGGAJ), at least 2 business days in advance. Downtime during planned maintenance does not affect uptime goals
- **Disaster Recovery:** We have a Disaster Recovery Procedure in place and execute it on a weekly basis. We estimate less than an hour to recover a cluster, and 4 hours to rebuild and recover a complete cluster. (We back up all resources in the Kubernetes cluster every 1 hour, and this backup is the main ingredient of the recovery recipe)

## Platform cluster availability and services

Use the Radix Platform when your team has chosen Radix as PaaS (Platform-as-a-Service) for a product under development or in production.

| Cluster                      | Purpose                                     | Upgrade         |   Support   |
| ---------------------------- | ------------------------------------------- | :-------------: | :---------: |
| **Platform -  C1 (North Europe)**  | Apps under development or in production with data or resources in same region | Every ~6 months | Yes         |
| **Platform 2 - C2 (West Europe)** | Apps under development or in production with data or resources in same region | Yes         |
| **Platform 3 - C3 (Central Sweden)** | Apps under development or in production with data or resources in same region | Every ~6 months | Yes         |
| [**Playground**](#radix-playground-services) | Experimentation, prototyping, and early-stage application development       |                 | Best-effort |

### Support

Schedule for Radix DevOps/Support team - 08:00 - 16:00 CET/CEST on Norwegian working days

- **Support channels:** File issue on [**radix** repo](https://github.com/equinor/radix-internal/issues) or ask on [#radix-support](https://equinor.slack.com/messages/CBKM6N2JY) on Slack
- **Response time:** As soon as possible within business hours, at least next business day
- **On-call duty:** No, please contact us to discuss options
- **Resolution time:** We can't guarantee a resolution time, but for critical issues we start working on the problem immediately and continue within business hours until we resolve it

### Associated operational risks

- No incident management beyond schedule "Norway - default" - i.e. no support after 16:00 CET/CEST on Norwegian working days
- Infrastructure downtime despite robust, high-availability infrastructure

### Application lifecycle policy

To ensure efficient resource usage, minimize unmaintained vulnerabilities and good platform hygiene, Radix enforces the following lifecycle policy for applications:

#### Inactive Applications
Radix considers an application inactive if it meets any of the following criteria:

- **Configuration Status:** The CMDB marks the associated configuration item (CI, or ServiceNow AppId) as **Retired**
- **Source Code Repository:** The GitHub repository linked to the application is **archived**
- **Deployment Activity:** Nobody has updated or deployed the application in the last **12 months**

#### Lifecycle actions

- **Inactive Applications:** Radix stops applications that nobody maintains or actively uses
- **Deletion Timeline:** If you take no action, Radix automatically deletes stopped applications after **30 days**
- **Notification:** Radix notifies owners before deletion to allow time for reactivation

We encourage teams to regularly review and update their applications and repositories to ensure they remain active and aligned with current business needs.


### Uptime risk management

We have carried out a risk assessment for cluster uptime, identified the most critical risk scenarios, and agreed on risk mitigation actions, which we implement as required.

### Disaster recovery

Velero backs up application configuration every hour and stores the backup in an Azure Storage account. We have created a script that can create a new AKS instance and migrate all applications from the affected cluster to the new one.

We estimate the **RTO (Recovery Time Objective)** at 20 minutes from the moment the Radix team starts working on it. Keep in mind that the RTO is only an estimate since external factors can also influence the recovery time. For example, this time increases if there is a high load on the Azure REST API or the Azure managed Kubernetes API server.

Some of the failure events that can take down the service or introduce delays and timeouts:

- Bad commit can introduce a bad code/bug in Radix components
- Executing a command in the wrong cluster
- Resource exhaustion, CPU, Memory, Disk issues
- Upgrading 3rd party components
- Someone deletes Azure resources/services
- MS Azure services unavailable
- Kubernetes bugs
- Kubernetes API changes
- Expired certificates
- Network issues, DDOS
- Expired secrets

We are working hard to mitigate as many of these as possible.

## Radix Playground services

Use Playground for testing Radix, see if it's a good fit for your projects, and provide feedback (e.g. using the button "Give us feedback" on the application list page). The Playground cluster has some limitations compared to the Platform clusters, e.g. it doesn't offer the external certificate service.


When you are ready to commit, register your application in any of the Radix Platform clusters, even if your application is still in the **development stage**. The Radix Platform clusters offer improved services.

- **Support channels:** Same as for Radix Platform (see above). We help when the team has capacity

- **Uptime:** "Best-effort", but we don't guarantee uptime. We announce planned maintenance as early as possible

### Automatic cleanup in Playground cluster

Radix Playground enforces a stricter lifecycle policy to make sure everybody shares the resources and to avoid unattended applications using unnecessary resources.

Radix stops any application that nobody has **deployed** or **restarted** in the last `7 days`.

After a further `21 days` of inactivity, Radix **deletes** all stopped applications.
