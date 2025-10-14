---
title: Apply Config
---

# Apply Config

[radixconfig.yaml](/radix-config/index.md) has properties, which do not require redeploy of components. The `apply-config` pipeline workflow perform these changes without re-deploying components or jobs. Currently it apply changes in : [DNS alias](/radix-config/index.md#dnsalias), [build secrets](/radix-config/index.md#secrets), [environments](/radix-config/index.md#environments) (create new or soft-delete existing).