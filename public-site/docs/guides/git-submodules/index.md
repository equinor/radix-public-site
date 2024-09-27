---
title: Git submodules
---

# Git submodule as Radix component

[Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) is a native git feature which enables git repositories within other git repositories. This guide describes a pattern for using git submodules to incorporate multiple GitHub repositories in a single Radix application. This pattern can be used to e.g. build each Radix component in a single app from a separate GitHub repository.

## Limitations

As of December 2022, Radix only supports a single SSH key for authenticating to remote git repositories. This means that a Radix repository's submodules must be either public or accessible using the same deploy key as the main repository. Because GitHub globally prohibits reuse of a single deploy key across multiple repositories, it's not possible to use submodules which point to private GitHub repositories.

:::info Note
There is an option to update submodule within the pipeline job. Please look [at the example](/guides/git-submodules/update-submodule-in-pipeline-job.md).
:::

## Sample application with git submodule

[This GitHub repository](https://github.com/equinor/radix-app-with-submodule-example) contains a Radix application that has a single component, `redis`. This component is built from the source code inside the `redis` directory, and this directory is in turn a git submodule which points to a git repository at https://github.com/equinor/radix-submodule-example. Take note that the remote URL of the submodule is HTTPS and not SSH; unauthenticated clone via SSH, even for public repositories, is not supported.

### Trigger build of main app with commit to submodule

By default, a submodule reference is statically locked to a single commit in the remote repository. E.g. a dynamic reference to a branch of the submodule is not possible. If a new commit is made in the sub-module, this will not be reflected in the main repository unless the main repository is updated with a new commit reference.

A development team might want a change in the submodule to be automatically reflected in parent repositories. This can be achieved with a GitHub actions workflow on the submodule repository which automatically updates the parent repositories. The submodule in the example has [such a workflow](https://github.com/equinor/radix-submodule-example/blob/main/.github/workflows/push-to-main-repo.yml).

The example workflow uses a deploy key with write access to automatically modify the parent repository when the submodule is modified. If a new commit is made to the `main` branch of the submodule, the `main` branch of the parent repository gets a new commit which changes the submodule reference to point to HEAD of the submodule's `main` branch.
