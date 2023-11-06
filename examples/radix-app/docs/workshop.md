 <!-- markdownlint-disable MD014 MD007 MD034-->

# 1. Omnia Radix example application

The purpose of the application is to give a general introduction to Radix. 

## 1.1. Pre-requisites

- Have access to the Radix Playground
  - Apply for access to the Radix Playground in AccessIT (search for ````Radix Playground Users````)
  -  Find Radix at [https://console.playground.radix.equinor.com](https://console.playground.radix.equinor.com)
- Account on github.com
- Git installed and working locally against github.com
- Docker running locally
- Node js eco system installed and running ([Download Nodejs](https://nodejs.org/en/download/))
- Local dev. environment (IDE++)

## 2.1. Part 1 - Register app in Radix

Scenario

Your team has just started developing an application that generates secure passwords and displayes it in a web client. To get feedback from end users as fast as possible, your team have chosen to do [UI first](https://konstantinpavlov.net/blog/2017/03/07/ui-first-development/) development. To facilitate a short feedback loop, automated CI/CD (automate build/deploy) of the application needs to be setup, ending with a public url that users can test.

An OpenAPI specification has been agreed on with the API team, so we'll begin with mocking data for the UI. Radix has been choosen as platform, seemingly perfect for the scenario.

### 2.1.1. Getting started

1. Fork repository to your home on github. Consider choosing an alternative name for the repository
1. Clone your newly forked repository down to your developer laptop

### 2.1.2. Exploring the `frontend` app

1. Move into the [frontend](../frontend/) folder and explore how to develop the `frontend` app using ```ReactJs``` and ```Node.js``` as well as Dockerizing the application.

### 2.1.3. Preparing for Radix

- The Radix cluster we use for the workshop is available at https://console.playground.radix.equinor.com/
- Radix documentation is available at https://www.radix.equinor.com/

Important to know:

1. The difference between ```platform user``` and ```application user```
1. Important terminology: ```application```, ```environments```,```components```, and ```replicas``` [Important Radix Concepts](https://www.radix.equinor.com/docs/topic-concepts/)
1. ```radixconfig.yaml``` - lives on the `main` branch and is your infrastrucure as code - drive your app in Radix.

### 2.1.4. Explore radixconfig.yaml

1. Reading about radixconfig.yaml in [docs](https://www.radix.equinor.com/docs/reference-radix-config)
1. Exploring the config file for the example app [./radixconfig.yaml](../radixconfig.yaml)

### 2.1.5. Creating the application on Radix

1. Update the ```your app name``` of the application in radixconfig.yaml - it needs to be unique in cluster
1. Follow the [getting started guide](https://www.radix.equinor.com/guides/configure-an-app/) or "just do it!"
1. Do a change in app, commit and push to `main` to trigger the initial build and deploy to Radix. Examine web-hooks and reponse in Radix
1. Verify that the app work on the public end-point it has been given.

## 2.2 Part 2 - connecting UI and API

Scenario

The UI is comming along nicely, and your team has started on the API. Next step is to integrate the API with the UI, so users can also start testing the logic behind password generation.

### 2.2.1. Exploring the `server` app

1. Move into the [backend](../backend/) folder and explore how to develop the `backend` app using ```Node.js``` as well as Dockerizing the application.

### 2.2.2. Connect UI with `backend` Api

1. Move into [UI](../frontend/src/App.js) and disable the use of Mock data. 
1. Run `server` API locally
1. Run `frontend` locally
1. Verify in log that requests are being handled by API

### 2.2.3. Update app in Radix

1. Add `server` app to radixconfig.yaml 
1. Update [nginx.conf](../www/src/nginx.conf) to forward request to `server` api
1. Commit code to `main` branch. 
1. Verify the changes in Radix. Look at the Radix Host name, which should jump between the two replicas we've setup for the API. 

### 2.2.4. Update api

1. Do a change on `main` branch either in the api or ui
1. commit and push to `main` branch
1. Verify that there is no downtime during the release of a new version

Radix run on top of [Kubernetes](https://kubernetes.io/), which support [rolling updates](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/). This means that traffic will not be routed to the newly deploy api before it is up and running. 

## 2.3 Part 3 - setup `prod` environment

Scenario

The MVP of the application is done, and next step is to setup a production environment. There is sadly too few automated tests to support a clean [Trunk base development](https://trunkbaseddevelopment.com/), but we will do something similar. 

We'll setup 2 new environments, `development` and `prod`. A build/deploy to `development` will be triggered by push to "release" branches. When the `development` version has been verified its manually promoted to `prod` environment. 

### 2.3.1. Multiple environments

Radix support connecting a branch to a specific environment. Let's explore this.

1. Add two new environments in radixconfig.yaml file - `development` and `prod`. `development` should be built from release/* branch (whenever someone publish to a release/* branch).
1. Commit and push changes to `main` branch, explore what's happening in Radix.

### 2.3.2 Deploy to `development`

1. Check out a new branch "release/0.1.0" from `main` branch
1. Commit and push the new branch, explore what's happening in Radix.
1. Verified that the application is running as expected in `development` environment. 

### 2.3.3 Promote to production

1. Do a promotion of the deployment running in `development` to `prod` environment. 
1. Verified that the application is running as expected in `prod` environment. 

## 2.4 Part 4 - Authentication (optional)

Radix support refering to prebuild docker images. This can be used to introduce common services as proxies, caching, authentication etc. In this part we will explore how to reference an existing image to add OpenId Connect authentication to the application. 

If there is time we will go through an example together during workshop.

### 2.4.1 Create an app in Azure AD

If you have access to create an app in Azure AD, you can perform this part. You can follow the instruction from [example](https://github.com/equinor/radix-example-front-proxy#requirements).

### 2.4.2 Update radixconfig with oauth_proxy

1. Use [OAuth proxy](https://github.com/pusher/oauth2_proxy) developed by pusher to add Authentication
1. Update radixconfig file. See [example](https://github.com/equinor/radix-example-front-proxy) on how it can be done
1. Remember to disable the public endpoint for `frontend` component in radixconfig file (publicPort should not be set)
1. Optional: get the authentication to work locally using docker-compose - the format is similar to radixconfig
1. Commit & push to `main` branch to verify setup

## 2.5 Monitoring & Metrics

The `server` component is exposing metrics on the /metrics endpoint. These metrics are scraped by [Prometheus](https://prometheus.io/docs/introduction/overview/) and made available in [Grafana](https://grafana.com/). Consult the docs for Prometheus and Grafana for how to work with metrics and monitoring.

## 3. Typical questions

(Status as of September 2019)

- Storage - databases
- Authentication
- Logging
- Metrics - Monitoring
- Radix CLI (Api)
- Backup & Disaster recovery
- Own domain names / urls for apps

## 3.1. Where to get started, get help, log issues or feature requests

### 3.1.1. Getting help

- Radix on #Slack ([#omnia_radix](https://equinor.slack.com/messages/C8U7XGGAJ), [#omnia_radix_support](https://equinor.slack.com/messages/CBKM6N2JY))
- [Radix site](https://www.radix.equinor.com/)
- Radix on [github.com](https://github.com/equinor/radix-platform)

### 3.1.2. Getting started

- Radix Getting Started - https://www.radix.equinor.com/

### 3.1.3. Log issues & feature requests

- https://github.com/equinor/radix-platform/issues

It makes sense to examing existing issues and perhaps discuss on Slack prior to logging a new one

## 4 Next steps

- The application is currently hosted under a *.radix.equinor.com domain. This is OK for now, but it has been identified that for the future we'll want our own *.equinor.com domain as is possible in [Radix](https://www.radix.equinor.com/docs/reference-radix-config/#dnsexternalalias).
- Move your own apps into Radix
