---
title: Runtime environment
---

# Runtime environment

Running an application in Radix is not much different to running Docker containers locally. However, you should be aware of some special behaviours and constraints.

## Networking

### Traffic

Only HTTPS traffic is allowed into the application. There is no protocol restriction on outbound traffic. SSL certificates are automatically managed by Radix, [external aliases](/guides/external-alias/) can also be managed by Radix, i.e. automatically refreshed.

Internally - within the same environment/namespace, [components](/start/radix-concepts/index.md#component) can communicate with each other using other protocols and [ports](/radix-config/index.md#components), provided they use TCP.

### Internal DNS

Communicating between components should be done using short DNS names. For instance, to access the `dataqueue` component from the `middleware` component, simply use the DNS name `dataqueue`. If this communication happens over HTTP, the internal URL to use would be `http://dataqueue`.

Other ports/protocols can be used, e.g. `fileserver:22` for an FTP port.

### Request size

For external requests there is an upload limit of 100MB. If your application needs to receive larger payloads, these should be split across separate requests.

### Request headers

Requests reaching your components from outside Radix are routed, and will have some extra HTTP headers with information about the original request

- `X-Forwarded-For`: List of IP addresses that have proxied the request (leftmost is original requester)
- `X-Forwarded-Host`: Hostname requested
- `X-Forwarded-Port`: Port requested (usually `443`)
- `X-Forwarded-Proto`: Protocol used (usually `https`)
- `X-Original-URI`: Path of original requested (e.g. `/item/widget`)
- `X-Real-IP`: Source IP seen by Radix (depending on client-side proxies, this can be different from `X-Forwarded-For`)
- `X-Request-ID`: A unique random ID for the request; can be used for [correlation tracking](https://theburningmonk.com/2015/05/a-consistent-approach-to-track-correlation-ids-through-microservices/)
- `X-Scheme`: Same as `X-Forwarded-Proto`

## Storage

Radix **does not** support persistent storage. Any files written to the filesystem will be lost when a component restarts or is redeployed. If you need persistence, cloud-based systems like [Azure storage](https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction) are recommended, these can be [mounted as volumes](/guides/volume-mounts/index.md).

## Multiple copies

Although you can configure the number of [replicas](/start/radix-concepts/index.md#replica) for a component, Radix will occasionally run a different number of these. For instance, a component that has been configured to run with just one replica (this is the default) might momentarily have two replicas running during a Radix cluster migration.

This is a common characteristic of high-availability cloud-based environments. Your application should be written in a way that can cope with multiple running copies of a component (or the whole application), even if momentarily.

## Environment variables

In addition to [variables defined in `radixconfig.yaml`](/radix-config/index.md#variables-common), Radix will automatically set the following variables

- `RADIX_ACTIVE_CLUSTER_EGRESS_IPS`: IP address range of the current cluster
- `RADIX_APP`: The name of the Radix application
- `RADIX_CANONICAL_DOMAIN_NAME`: The [canonical domain name](/docs/topic-domain-names/#canonical-name) of the component
- `RADIX_CLUSTERNAME`: The canonical name of the Radix cluster (e.g. "eu-8")
- `RADIX_CLUSTER_TYPE`: The type of cluster ("production", "playground", "development")
- `RADIX_COMPONENT`: Name of the current component
- `RADIX_CONTAINER_REGISTRY`: Container image registry where component images are downloaded from
- `RADIX_DNS_ZONE`: Cluster DNS zone (e.g. _`radix.equinor.com`_)
- `RADIX_ENVIRONMENT`: The application's current environment
- `RADIX_GIT_COMMIT_HASH`: Git commit hash of source code from which current deployment was built. Only applicable for deployments with one or more container images built by Radix pipeline.
- `RADIX_GIT_TAGS`: Space-separated list of git tags which point to `$RADIX_GIT_COMMIT_HASH` at the time of container image build.
- `RADIX_PORTS`: Space-separated list of open ports, enclosed in parentheses. E.g. (8888) and (8888 8889)
- `RADIX_PORT_NAMES`: List of open ports (names; only if set)
- `RADIX_PUBLIC_DOMAIN_NAME`: [Public domain name](/docs/topic-domain-names/#public-name) of the component (if the component has been made public)
