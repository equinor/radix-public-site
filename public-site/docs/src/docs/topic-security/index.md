---
title: Security
---

# Security

## Role Based Access Control
RBAC within the Radix Platform is structured into different roles, each tailored to grant varying degrees of access.

### Radix Platform User
Membership in the 'Radix Platform User' AD group grants access to

- Radix Web Console
- Grafana Dashboard (Monitoring)

Only members of the AD group provided during application registration, will be able to see the application listed in the Radix web console. Same AD group also controls who will be able to change the configuration of the application in the Radix web console.

### Radix Application Reader Role
A newer addition to the Radix RBAC is the 'Radix application reader' role. This role is designed for users who require read-only access to information about a Radix application. 
These users should not be able to perform any actions that could impact the application's state, such as starting or stopping components or deleting the application.
Readers have the privilege to access logs associated with the application's replicas and jobs. This access enables troubleshooting and gathering insights without having the risk of impacting the application.
The 'Radix application reader' role is an Azure AD group that can be assigned under 'Access control' in the Configuration page of the application.

## Authentication

It is important to understand that **application authentication is not handled by Radix**. The application endpoints will be public. Each team managing an application hosted on Radix is responsible for authenticating their users.

For an example of in-app authentication using AD have a look at [Radix Authentication Example](https://github.com/equinor/radix-example-oauth-proxy) code.
