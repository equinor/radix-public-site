---
title: Radix cost
---

# Radix cost allocation

As part of hosting an application on Radix, each application will take it's share of the cloud cost assosiated with the Radix Platform cluster. The cost will be allocated monthy following the routines issued by Equinor.

## How is the cost calculated

Cost calculation is based on the total time the replicas(containers) belonging to an application has been running, and how much CPU and memory the replicas requested. The cost is split between applications by dividing each application's CPU and memory time by the total CPU and memory time for all applications.
Cluster cost is split 50/50 between CPU and memory time.

## Example

![Cost Calculation Example](./radix-cost.png "Cost Calculation Example")

Assuming a period of 30 days where total cluster cost is 100.000NOK. Two applications, `Application 1` and `Application 2`, are running in the cluster.

`Application 1` has two components, `frontend` and `backend`. `horizontalScaling` is configured for `backend` to automatically start new replicas during periods of high CPU utilization. `Application 2` has two components, `frontend` and `backend`, and a job named `compute`.

### CPU and memory time by Application 1

| | CPU | CPU total | Memory | Memory total
| --- | --- | --- | --- | ---
| frontend-replica1 | 100m &times; 720hrs | 72.000 | 100MB &times; 720hrs | 72.000
| backend-replica1 | 200m &times; 720hrs | 144.000 | 400MB &times; 720hrs | 288.000
| backend-replica2 | 200m &times; 300hrs | 60.000 | 400MB &times; 300hrs | 120.000
| backend-replica3 | 200m &times; 90hrs | 18.000 | 400MB &times; 90hrs | 36.000

| | Calculation | Total
| --- | --- | ---
| CPU | 72.000 &plus; 144.000 &plus; 60.000 &plus; 18.000 | 294.000
| Memory | 72.000 &plus; 288.000 &plus; 120.000 &plus; 36.000 | 516.000

### CPU and memory time by Application 2

| | CPU | CPU total | Memory | Memory total
| --- | --- | --- | --- | ---
| frontend-replica1 | 100m &times; 720hrs | 72.000 | 200MB &times; 720hrs | 144.000
| backend-replica1 | 50m &times; 720hrs | 36.000 | 250MB &times; 720hrs | 180.000
| job-1 | 250m &times; 15hrs | 3.750 | 750MB &times; 15hrs | 11.250
| job-2 | 250m &times; 15hrs | 3.750 | 750MB &times; 15hrs | 11.250
| job-3 | 250m &times; 30hrs | 7.500 | 750MB &times; 30hrs | 22.500

| | Calculation | Total
| --- | --- | ---
| CPU | 72.000 &plus; 36.000 &plus; 3.750 &plus; 3.750 &plus; 7.500 | 123.000
| Memory | 144.000 &plus; 180.000 &plus; 11.250 &plus; 11.250 &plus; 22.500 | 369.000

### Calculation

| | Calculation | Total
| --- | --- | ---
| Cluster CPU time | 294.000 &plus; 123.000 | 417.000
| Cluster memory time |  516.000 &plus; 369.000 | 885.000
| Cluster CPU cost | 100.000 &divide; 2 | 50.000

| | Calculation | Total
| --- | --- | ---
| Application1 CPU cost | 294.000 &divide; 417.000 &times; 100.000NOK &times; 0.5 | 35.252NOK
| Application1 memory cost | 516.000 &divide; 885.000 &times; 100.000NOK &times; 0.5 | 29.152NOK
| Application1 total cost | | **64.405NOK**

| | Calculation | Total
| --- | --- | ---
| Application2 CPU cost | 123.000 &divide; 417.000 &times; 100.000NOK &times; 0.5 | 14.748NOK
| Application2 memory cost| 369.000 &divide; 885.000 &times; 100.000NOK &times; 0.5 | 20.847NOK
| Application2 total cost | | **35.595NOK**
