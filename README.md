| Prod                                                                                       |   QA   | Promote                        |  | 
|---------------------------------------------------------------------------------------------------|------|-----------------------------|----------------|
| ![prod](https://api.radix.equinor.com/api/v1/applications/radix-public-site//environments/prod/buildstatus) |   ![qa](https://api.radix.equinor.com/api/v1/applications/radix-public-site//environments/qa/buildstatus)   | ![build_deploy_promote](https://api.radix.equinor.com/api/v1/applications/radix-public-site//environments/prod/buildstatus?pipeline=promote)  |  | 


[![SCM Compliance](https://scm-compliance-api.radix.equinor.com/repos/equinor/8de2870b-4681-4c54-8f5e-2cb7a85f3201/badge)](https://developer.equinor.com/governance/scm-policy/)

# Radix Public Site

[![Logo](logo/Banner%20energy%20red@2x.png)](https://radix.equinor.com)  
radix.equinor.com (public site)  

This is the public site for promoting, documenting & showcasing the Radix
platform. It is a static site built with [Docusaurus](https://docusaurus.io/).

## Versioning

* Set the `version` in `public-site/_config.yml` - it is shown at the footer of the site
* After merging changes to the branch `main` - set `tag` in git repository (in `main` branch) - matching to the `version` in `public-site/_config.yml`

    ```sh
    git tag v1.0.0
    git push origin v1.0.0
    ```


## Contributing

Read our [contribution guidelines](./CONTRIBUTING.md)

-----------------

[Security notification](./SECURITY.md)
