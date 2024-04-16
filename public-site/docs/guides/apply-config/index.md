---
title: Apply Config
---

# Apply Config

[radixconfig.yaml](/radix-config/index.md) has properties, which do not require re-deployment of components: [DNS alias](/radix-config/index.md#dnsalias), [build secrets](/radix-config/index.md#secrets), etc. The `apply-config` pipeline workflow perform these changes without re-deploying components or jobs. 