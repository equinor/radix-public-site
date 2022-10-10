---
title: Requirements
---

There aren't many requirements: Radix runs applications written in Python, Java, .NET, JavaScript, or [LOLCODE](https://en.wikipedia.org/wiki/LOLCODE) equally well. If it can be built and deployed as Docker containers, we are nearly ready. If not, it's not hard to "dockerise" most applications.

An in-depth understanding of Docker is not a requirement, but it helps to be familiar with the concepts of containers and images. There are many beginner tutorials online; here's one of the most straightforward: [Getting Started with Docker](https://scotch.io/tutorials/getting-started-with-docker).

It is also expected that you have a [basic understanding of Git](http://rogerdudler.github.io/git-guide/) (branching, merging) and some networking (ports, domain names).

### Repository

A GitHub repository for our code is required (only GitHub is supported at the moment)  

### Radix config file (radixconfig.yaml)

A `radixconfig.yaml` file that defines the running environments. This must be in the root directory of our repository and in the branch we set as our `Config Branch` when we register our application in Radix. Usually we set it to *main* or *master*, but you can use any branch in your repository.

See the [radixconfig.yaml documentation](../../references/reference-radix-config/)  