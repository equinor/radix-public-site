---
title: Configuring Jobs
---

# Scheduled jobs

A job is an on-demand and short lived container/process that performs a set of tasks, e.g. a ML training job or an ETL job, and exits when it is done.
The duration of a job can span from seconds to hours, depending on what tasks it performs, but it is expected to exit when it has completed the work. Multiple jobs can be created and running simultaneously.

CPU, GPU and memory resources requested by a job are reserved when it starts, and released when it exits. This will help reduce the total cost for an application since cost is only calculated for running containers. A job that requests 10GB of memory and 2 CPUs, started once per day and runs for one hour, will only accumulate cost for the hour it is running. A component that requests the same resources will accumulate cost for all 24 hours of a day.

Docker images built from the definition in the components section in radixconfig.yaml are started automatically when a new build-deploy, promote or deploy pipeline completes. Jobs on the other hand, must be managed through the [job-scheduler](#job-scheduler) web API service. Radix creates a job-scheduler for each job and environment defined in [`radixconfig.yaml`](../../references/reference-radix-config/). The job-scheduler can start new containers from the Docker image build by the pipeline, delete and list existing jobs.
The job-scheduler does not require any authentication since it is not exposed to the Internet and is only accessible by components in the same application and environment.

## Configure a job

Jobs are configured in [`radixconfig.yaml`](../../references/reference-radix-config/#jobs), similar to how components are configured.

```yaml
spec:
  environments:
    - name: dev
    - name: prod
  components:
    - name: backend
      ...
  jobs:
    - name: compute
      src: compute
      schedulerPort: 8000
      payload:
        path: "/compute/args"
      ports:
        - name: http
          port: 3000
    - name: etl
      src: etl
      schedulerPort: 9000
      resources:
        requests:
          memory: "256Mi"
          cpu: "400m"
        limits:
          memory: "384Mi"
          cpu: "500m"
      node:
        gpu: nvidia-k80
        gpuCount: 2
```

They share many of the same configuration options with a few exceptions.

A job does not have `publicPort`, `ingressConfiguration`, `replicas`, `horizontalScaling` and `alwaysPullImageOnDeploy`

- `publicPort` and `ingressConfiguration` controls exposure of component to the Internet. Jobs cannot be exposed to the Internet, so these options are not applicable.
- `replicas` and `hortizontalScaling` controls how many containers of a Docker image a component should run. A job has always one replica.
- `alwaysPullImageOnDeploy` is used by Radix to restart components that use static Docker image tags, and pulling the newest image if the SHA has changed. Jobs will always pull and check the SHA of the cached image with the SHA of the source image.

Jobs have two extra configuration options; `schedulerPort` and `payload`

- `schedulerPort` (required) defines the port of job-scheduler's endpoint.
- `payload` (optional) defines the directory in the job container where the payload received by the job-scheduler is mounted.
- `resources` (optional) defines cpu and memory requested for a job.
- `node` (optional) defines gpu node requested for a job.

### schedulerPort

In the [`radixconfig.yaml`](../../references/reference-radix-config/#schedulerport) example above, two jobs are defined: `compute` and `etl`.

`compute` has `schedulerPort` set to 8000, and Radix will create a job-scheduler service named compute that listens for HTTP requests on port 8000. The URL for the compute job-scheduler is `http://compute:8000`

The job-scheduler for the `etl` job listens for HTTP requests on port 9000, and the URL is `http://etl:9000`

### payload

Arguments required by a job is sent in the request body to the job-scheduler as a JSON document with an element named `payload`.
The content of the payload is then mounted in the job container as a file named `payload` in the directory specified in `payload.path` in [`radixconfig.yaml`](../../references/reference-radix-config/#payload).
The data type of the `payload` value is string, and it can therefore contain any type of data (text, json, binary) as long as you encode it as a string, e.g. base64, when sending it to the job-scheduler, and decoding it when reading it from the mounted file inside the job container. The max size of the payload is 1MB.

The compute job in the example above has `payload.path` set to `/compute/args`. Any payload, send to the compute job-scheduler, will available inside the job container in the file `/compute/args/payload`

### resources

The resource requirement for a job can be sent in the request body to the job scheduler as a JSON document with an element named `resources`.
The content of the resources will be used to set the resource definition for the job [`radixconfig.yaml`](../../references/reference-radix-config/#resources-common).
The data type of the `resources` is of type `ResourceRequirements` an requires this specific format.

The etl job in the example above has `resource` configured.

### node

The node requirerement for a job can be sent in the request body to the job scheduler as a JSON document with an element named `node`.
The content of the node will be used to set the node definition for the job [`radixconfig.yaml`](../../references/reference-radix-config/#node).
The data type of the `node` is of type `RadixNode` an requires this specific format.

The etl job in the example above has `node` configured.

## Job Scheduler

The job-scheduler is a web API service, that you use to create, delete and monitor the state of jobs.
Radix creates one job-scheduler per job defined in [`radixconfig.yaml`](../../references/reference-radix-config/#jobs). A job-scheduler will listen to the port defined by `schedulerPort` and host name equal to the `name` of the job. The job-scheduler API can only be accessed by components running in the same environment, and it is not exposed to the Internet. No authentication is required.

The job-scheduler exposes the following methods for managing jobs

- `POST /api/v1/jobs` Create a new job using the Docker image that Radix built for the job. Job-specific arguments can be sent in the request body

```json
{
  "payload": "Sk9CX1BBUkFNMTogeHl6Cg==",
  "resources": {
    "limits": {
      "memory": "32Mi",
      "cpu": "300m"
    },
    "requests": {
      "memory": "16Mi",
      "cpu": "150m"
    }
  },
  "node": {
    "gpu": "gpu1, gpu2, gpu3",
    "gpuCount": "6"
  }
}
```

> `payload`, `resources` and `node` are all optional fields and any of them can be omitted in the request.

- `GET /api/v1/jobs` Get states (with names and statuses) for all jobs
- `GET /api/v1/jobs/{jobName}` Get state for a named job
- `DELETE /api/v1/jobs/{jobName}` Delete a named job

![Diagram of jobs and job-scheduler](./job-scheduler-diagram.png "Job Scheduler overview")

> The job-scheduler keeps the 10 latest `Succeeded` and the 10 latest `Failed` jobs.

## Starting a new job

The example configuration at the top has component named `backend` and two jobs, `compute` and `etl`. Radix creates two job-schedulers, one for each of the two jobs. The job-scheduler for `compute` listens to `http://compute:8000`, and job-scheduler for `etl` listens to `http://etl:9000`.

To start a new job, send a `POST` request to `http://compute:8000/api/v1/jobs` with request body set to

```json
{
  "payload": "{\"x\": 10, \"y\": 20}"
}
```

The job-scheduler creates a new job and mounts the payload from the request body to a file named `payload` in the directory `/compute/args`.
Once the job has been created successfully, the `job-scheduler` responds to `backend` with a job state object

```json
{
  "name": "compute-20210407105556-rkwaibwe",
  "started": "",
  "ended": "",
  "status": "Running"
}
```

- `name` is the unique name for the job. This is the value to be used in the `GET /api/v1/jobs/{jobName}` and `DELETE /api/v1/jobs/{jobName}` methods. It is also the host name to connect to running job's container, with its exposed port, e.g. `http://compute-20210407090837-mll3kxxh:3000`
- `started` is the date and time the job was started. It is represented in RFC3339 form and is in UTC.
- `ended` is the date and time the job successfully ended. Also represented in RFC3339 form and is in UTC. This value is only set for `Successful` jobs.
- `status` is the current status of the job container. Possible values are `Running`, `Successful` and `Failed`. Status is `Failed` if the container exits with a non-zero exit code, and `Successful` if the exit code is zero.

## Getting the status of existing jobs

Get a list of all jobs with their states by sending a `GET` request to `http://compute:8000/api/v1/jobs`. The response is an array of job state objects, similar to the response received when creating a new job

```json
[
  {
    "name": "compute-20210407090837-mll3kxxh",
    "started": "2021-04-07T09:08:37Z",
    "ended": "2021-04-07T09:08:45Z",
    "status": "Succeeded"
  },
  {
    "name": "compute-20210407105556-rkwaibwe",
    "started": "2021-04-07T10:55:56Z",
    "ended": "",
    "status": "Failed"
  }
]
```

To get state for a specific job, e.g. `compute-20210407090837-mll3kxxh`, send a `GET` request to `http://compute:8000/api/v1/jobs/compute-20210407090837-mll3kxxh`. The response is a single job state object

```json
{
  "name": "compute-20210407090837-mll3kxxh",
  "started": "2021-04-07T09:08:37Z",
  "ended": "2021-04-07T09:08:45Z",
  "status": "Succeeded"
}
```

## Deleting an existing job

The job list in the example above has a job named `compute-20210407105556-rkwaibwe`. To delete it, send a `DELETE` request to `http://compute:8000/api/v1/jobs/compute-20210407105556-rkwaibwe`. A successful deletion will respond with result object

```json
{
  "status": "Success",
  "message": "job compute-20210407105556-rkwaibwe successfully deleted",
  "code": 200
}
```

## OpenAPI/Swagger spec

[Download][1] Swagger/OpenAPI specification for job-scheduler

## Generating clients

The [openapi-generator](https://github.com/OpenAPITools/openapi-generator) can be used to generate client code for communicating with the `job-scheduler` API. It can also generate server stub code that can be used for local development and testing purposes.

The tool can be installed using [Homebrew](https://github.com/OpenAPITools/openapi-generator#15---homebrew), [npm](https://github.com/OpenAPITools/openapi-generator#17---npm), or by downloading the [JAR file](https://github.com/OpenAPITools/openapi-generator#13---download-jar). It can also be executed using a pre-built [Docker image](https://github.com/OpenAPITools/openapi-generator#16---docker).

To get the list of supported language and framework generators, execute

```sh
openapi-generator-cli list
```

Each language/framework generator has its own set of additional configuration options

```sh
openapi-generator-cli config-help -g <generator-name>
```

These configuration options can be added to a file, e.g. `config.yaml`, and referenced in the `openapi-generator` CLI using the `-c` option (see examples below)

```yaml
additionalProperties:
  targetFramework: net5.0
  packageName: JobScheduler
  netCoreProjectFile: true
```

## Examples

Using the `config.yaml` above, we can generate a C# NET Core 5.0 client by executing

```sh
openapi-generator-cli generate 
  -g csharp-netcore
  -i https://www.radix.equinor.com/guides/configure-jobs/swagger.json
  -c config.yaml
  -o Client
```

`openapi-generator-cli` generates client code, tests and documentation

![Generated client code](./netcore-client-output.png "Generated client code")

Server stub code for AspNetCore can be generated using the `aspnetcore` generator

```sh
openapi-generator-cli generate 
  -g aspnetcore 
  -i https://www.radix.equinor.com/guides/configure-jobs/swagger.json
  -c config_server.yaml
  -o Server
```

## Managing Jobs in Web Console

TBA

[1]:swagger.json
