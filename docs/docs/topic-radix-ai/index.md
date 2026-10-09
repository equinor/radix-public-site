---
title: Radix AI
displayed_sidebar: docsSidebar
---

# Radix AI

[Radix AI](https://github.com/equinor/radix-ai) is an [Agent Package Manager (APM)](https://microsoft.github.io/apm/) package for GitHub Copilot. It provides guidance for configuring, deploying, and troubleshooting applications on Radix.

After [installing APM](https://microsoft.github.io/apm/getting-started/installation/), run:

```bash
apm init
apm install equinor/radix-ai --target copilot
```

The first command initializes APM in the repository. The second installs the Radix skills and supporting instructions for GitHub Copilot.

Commit the generated files so everyone working in the repository gets the same Radix guidance.

## Use Radix AI

After installation, ask GitHub Copilot questions or give it tasks related to Radix. For example:

- "Create a `radixconfig.yaml` for this application."
- "Deploy this application with the Radix CLI."
- "Help me troubleshoot this failed Radix deployment."

The package includes skills for onboarding an application, working with `radix-cli`, and handling common Radix configuration and deployment tasks. The skills inspect the context of your repository and use the relevant Radix guidance when responding.

Review generated configuration and commands before applying them. The [Radix configuration reference](../../radix-config/index.md) remains the source of truth for `radixconfig.yaml`.

## Update Radix AI

Check whether a newer package version is available, then install the update:

```bash
apm outdated
apm update equinor/radix-ai
```

See the [radix-ai repository](https://github.com/equinor/radix-ai) for the package source and release history.