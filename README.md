# Radix Public Site
![Logo](logo/Banner%20energy%20red@2x.png)
www.radix.equinor.com (public site)  
![](https://api.radix.equinor.com/api/v1/applications/radix-platform/environments/prod/buildstatus?pipeline=promote)  

This is the public site for promoting, documenting & showcasing the Radix
platform. It is a static site built with [Jekyll](https://jekyllrb.com).



### Versioning
* Set the `version` in `public-site/_config.yml` - it is shown at the footer of the site
* After merging changes to the branch `main` - set `tag` in git repository (in `main` branch) - matching to the `version` in `public-site/_config.yml`
    ```
    git tag v1.0.0
    git push origin v1.0.0
    ```
