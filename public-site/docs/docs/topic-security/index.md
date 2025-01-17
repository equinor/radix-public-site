---
title: Security
---

# Security

## Role Based Access Control
There are three roles which govern access to the management plane of Radix.

#### Radix Platform User
The Radix Platform User role is scoped to the entirety of the Radix platform. Members of the Radix Platform User AD 
group are granted access to create new Radix applications, view the Radix Web Console and the Grafana Dashboard (Monitoring). 
Membership of this AD group is granted by submitting an application in AccessIT.

#### Radix Application Admin Role
Each Radix application has a list of AD groups whose members are granted the Radix Application Admin role.
Users with this role can view and modify all attributes of a Radix applications, including, but not limited to, 
the application's configuration, environment variables, and secrets.

#### Radix Application Reader Role
Similar to the Radix Application Admin role, each Radix application has a list of AD groups whose members are granted the 
Radix Application Reader role. This role is designed for users who require read-only access to information about a Radix application. 
These users can not perform any actions that could impact the application's state, such as starting or stopping components or deleting the application.
Readers have the privilege to access logs associated with the application's replicas and jobs. This access enables troubleshooting and gathering insights without having the risk of impacting the application.

## Authentication

It is important to understand that **application authentication is not handled by Radix**. The application endpoints will be public. Each team managing an application hosted on Radix is responsible for authenticating their users.

To help with this, Radix allows to configure build in [authentication component](/radix-config#authentication). Please look at the [Authentication](/guides/authentication/) guide for more information. However, this component does not provide authentication for the application itself, the access needs to be configured by a team (e.g. limiting access to particular Microsoft Entra ID groups or users, etc.).


