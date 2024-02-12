---
title: What is Radix
---
:tada:

Omnia Radix is a Platform-as-a-Service ("PaaS", if you like buzzwords). It builds, deploys, and monitors applications, automating the boring stuff and letting developers focus on code. Applications run in <abbr title="someone else's computer"> ☁️ the cloud</abbr> as 🐳 Docker containers, in environments that you define.

You can use Radix just to run code, but the main functionality is to integrate with a code repository so that it can continuously build, test, and deploy applications. For instance, Radix can react to a `git push` event, automatically start a new build, and push it to the `test` environment, ready to be tested by users.

Radix also provides monitoring for applications. There are default 📈 metrics (e.g. request latency, failure rate), but you can also output custom metrics from your code. Track things that are important for your application: uploaded file size, number of results found, or user preferences. Radix collects and monitors the data.

> To help improve Radix poke around in our **open sourced** repositories. We track **issues and feature requests** in the [radix](https://github.com/equinor/radix/issues) repo. Please log those! 🙂
