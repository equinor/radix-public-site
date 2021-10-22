---
title: Mount volumes
---

# Configuring and mount volumes

The supported volume mount type is to mount CSI Azure Blob Container, using CSI Azure blob driver for Kubernetes. See [this](https://github.com/kubernetes-sigs/blob-csi-driver) for more information.

>Blobfuse FlexVolume is considered obsolete and recommended being replaced with CSI Azure blob driver.

In order to make use of this functionality you have to:

- Retrieve necessary values from Azure Blob Storage

Account name and key
![SecretValues](./SecretValues.png)

Name of container
![ContainerName](./ContainerName.png)

- Define the volume mounts for the environment in the RadixConfig. The container should match the one found in step 1

```yaml
environmentConfig:
  - environment: dev
    volumeMounts:
      - type: azure-blob
        name: storage
        storage: blobfusevolumetestdata
        path: /app/image-storage
```

- After environment has been built, set the generated secret to key found in step 1. This should ensure that key value is Consistent status. It is recommended to restart a component after a key has been set in the console

![SetSecrets](./SetSecrets.png)

This results in the Kubernetes deployment holding the volume mount in PersistentVolumeClaim and its StorageClass:

```yaml
spec:
  containers:
    - env:
  ...
volumeMounts:
  - mountPath: /app/image-storage
    name: csi-az-blob-frontend-storage1-blobfusevolumetestdata
  ...
volumes:
  - name: csi-az-blob-frontend-storage-blobfusevolumetestdata
    persistentVolumeClaim:
      claimName: pvc-csi-az-blob-frontend-storage-blobfusevolumetestdata
```

and files appear inside the container. If there are folders within blob container - it will exist in the pod's container as well

```sh
kubectl exec -it -n radix-csi-azure-example-dev deploy/frontend -- ls -l /app/image-storage
total 0
-rwxrwxrwx    1 root     root         21133 Nov 13 13:56 image-01.png
-rwxrwxrwx    1 root     root         21989 Nov 13 13:56 image-02.png
-rwxrwxrwx    1 root     root         47540 Nov 26 14:51 image-04.png
-rwxrwxrwx    1 root     root         48391 Nov 26 14:50 image-06.png
-rwxrwxrwx    1 root     root         47732 Nov 26 14:50 image-07.png
```

Multiple volume mounts are also supported

- for multiple blob-containers within one storage account
- for containers within multiple storage accounts
- for containers within storage accounts within multiple subscriptions and tenants

Not supported mount from same blob container to different folders within one component.

Multiple containers within one storage account
![MultipleContainers](./MultipleContainers.png)

To add multiple volumes

- Define the volume mounts for the environment in the RadixConfig.
  - add more `volumeMounts`, with `name`-s, unique within `volumeMounts` of an environment (do not use storage account name as this `name` as it is not secure and can be not unique)
  - specify `container` names for each `volumeMount`. The `container` should match the one found in step 1
  - specify `path` for each `volumeMount`, unique within `volumeMounts` of an environment

  ```yaml
  environmentConfig:
    - environment: dev
      volumeMounts:
        - type: azure-blob
          name: storage1
          storage: blobfusevolumetestdata
          path: /app/image-storage
        - type: azure-blob
          name: storage3
          storage: blobfusevolumetestdata3
          path: /app/image-storage3
  ```

- After environment has been built, set the generated secret to account name and key, found in step 1 - for each volume. This should ensure that key value is Consistent status. It is recommended to restart a component after a all secrets have been set in the console

![SetSecretsForMultiplemounts](./SetSecretsMultipleVolumes.png)

This results in the Kubernetes deployment holding the volume mounts in its spec:

```yaml
spec:
  containers:
    - env:
  ...
volumeMounts:
  - mountPath: /app/image-storage
    name: csi-az-blob-frontend-storage1-blobfusevolumetestdata
  - mountPath: /app/image-storage3
    name: csi-az-blob-frontend-storage3-blobfusevolumetestdata3
  ...
volumes:
  - name: csi-az-blob-frontend-storage1-blobfusevolumetestdata
    persistentVolumeClaim:
      claimName: pvc-csi-az-blob-frontend-storage1-blobfusevolumetestdata
  - name: csi-az-blob-frontend-storage3-blobfusevolumetestdata3
    persistentVolumeClaim:
      claimName: pvc-csi-az-blob-frontend-storage3-blobfusevolumetestdata3
```

and files appear inside the container

```sh
kubectl exec -it -n radix-csi-azure-example-dev deploy/frontend -- ls -lR /app
/app:
total 4
drwxrwxrwx    2 root     root          4096 Dec 11 15:10 image-storage
drwxrwxrwx    2 root     root          4096 Dec 11 15:10 image-storage3
-rw-r--r--    1 root     root          1343 Dec 11 11:52 index.html

/app/image-storage:
total 0
-rwxrwxrwx    1 root     root         21133 Nov 13 13:56 image-01.png
-rwxrwxrwx    1 root     root         21989 Nov 13 13:56 image-02.png
-rwxrwxrwx    1 root     root         47540 Nov 26 14:51 image-04.png
-rwxrwxrwx    1 root     root         48391 Nov 26 14:50 image-06.png
-rwxrwxrwx    1 root     root         47732 Nov 26 14:50 image-07.png

/app/image-storage3:
total 0
-rwxrwxrwx    1 root     root         27803 Dec 11 11:11 image-01.png
-rwxrwxrwx    1 root     root         28692 Dec 11 11:11 image-02.png
-rwxrwxrwx    1 root     root         29008 Dec 11 11:11 image-03.png
-rwxrwxrwx    1 root     root         59023 Dec 11 11:11 image-04.png
-rwxrwxrwx    1 root     root         28732 Dec 11 11:11 image-05.png
-rwxrwxrwx    1 root     root         60062 Dec 11 11:11 image-06.png
-rwxrwxrwx    1 root     root         59143 Dec 11 11:11 image-07.png
```
