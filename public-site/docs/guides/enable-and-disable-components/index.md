---
title: Enable and disable components
sidebarDepth: 3
---

# Enable and disable components

* Component can be [disabled or enabled](/docs/radix-config/index.md#enabled) for all or specific environment configurations.

    ```yaml
    spec:
      components:
        - name: backend
          environmentConfig:
            - environment: prod
              enabled: false
    ```

    In the example above the component `backend` is disabled for the environment `prod`, but it remains enabled for other environments, if they exist. An equal configuration:

    ```yaml
    spec:
      components:
        - name: backend
          enabled: true
          environmentConfig:
            - environment: prod
              enabled: false
    ```

* The component can be enabled for specific environment configurations.

    ```yaml
    spec:
      components:
        - name: backend
          enabled: false
          environmentConfig:
            - environment: prod
              enabled: true
    ```

    In the example above the component `backend` is disabled for all environments, but it is disabled for the environment `prod`.

* If a component is disabled and there are its environment configurations, where the option `enabled` is not specified, the component is disabled for such environments.

    ```yaml
    spec:
      components:
        - name: backend
          enabled: false
          environmentConfig:
            - environment: prod
    ```

    In the example above the component `backend` is disabled for all environments, including the environment `prod`.
