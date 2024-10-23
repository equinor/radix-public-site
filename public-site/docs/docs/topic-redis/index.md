---
title: Redis cache
---

# Redis cache
Redis (Remote Dictionary Server) is an open-source data structure. It is primarily used as a database, cache, and message broker.

# Redis Cache Usage for Storing Session IDs

One common use case for Redis is storing session IDs in web applications. When a user logs into a web application, a session is created with a unique ID. This session ID is often stored in a Redis cache for fast retrieval. It is recommended to use Redis as session store instead of cookie because of knows issues with refreshing the access token and updating the session cookie's Expires attribute.

# Challenges of Running Redis as a Pod in Radix (in Kubernetes)

Running Redis in a containerised environment like Kubernetes can have challenges, one of them is pod restart and data loss.
Redis operates in memory, which means its data is volatile. If a Redis pod is restarted due to node failure or pod eviction, all in-memory data, including session IDs, is lost unless persistence is configured. This can force users to log in again, leading to a poor user experience.

Radix does not implicitly restart pods, configured to use pre-built `image` property when no changes in the `radixconfig.yaml` where applied to such component before deployment, e.g. `image` version or environment variables are changed. However, autoscaling of a cluster or maintenance of a cluster node can restart pods. 

# Using Azure Cache for Redis as an Alternative

To overcome the limitations of running Redis natively in Kubernetes, a more robust solution is to use https://azure.microsoft.com/en-us/products/cache. Azure Cache for Redis is a fully managed, scalable, and highly available Redis service provided by Microsoft Azure. 