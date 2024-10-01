# Radix Public Site

This is the public site for promoting, documenting & showcasing the Radix
platform. It is a static site built with [Docusaurus](https://docusaurus.io).

## Running, building

### The easy way

`make dev-up`: Starts Docker compose services beloning to the`dev` profile.

This starts the Docusaurus developer server on port 8000, and NGINX on port 8080 which proxies requests to the docusaurus server. This ensures that your browser receives the same security related headers (defined in ./proxy/headers) as when you build and run the Dockerfile container image. Changes to source files are immediatly shown in the browser.

You can see the site on &lt;http://localhost:8080&gt;

Stop the server with Ctrl+C, but also run `make dev-down` to clean up the
Docker state.

If you need a shell in the container:

    `docker exec -ti radix-public-site_container sh`

NB: The search plugin does not work when running the docusaurus development server.

You can also build and run the container image intended for production environments by running `make prod-up`. To stop and cleanup you run `make prod-down`.

### The other way

You can also run docusurus locally. All that is needed is NodeJS and NPM. In the root folder of the project run `npm i` to fetch dependencies followed by `npm run start` to start serving the development environment of the Public Site. The disadvantage is that you will not catch errors caused by the security headers set by NGINX.

## Files and folder structure

File `docusaurus.config.ts` contains the main configuration for Docusaurus. This is where we configure the overall page layout like headers, footers, navbar, themes etc. `sidebars.ts` contains configuration for the sidebars.

- `/community/`: Information about the Radix community and team. 
- `/docs/`: General concepts (topics).
- `/feature/`: List of all fratures in Radix.
- `/guides/`: User-friendly, conversational guides on how to achieve specific objectives.
- `/radix-config/`: Reference documentation for end-users.
- `/start/`: Getting started guide

## docusaurus

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

[Create an application](https://docusaurus.io/docs/installation)
```bash
npx create-docusaurus@latest public-site classic --typescript
```
# Credits

trees by Made x Made from the Noun Project: &lt;https://thenounproject.com/term/trees/1723897/&gt;  
pot plant by Made x Made from the Noun Project: &lt;https://thenounproject.com/term/pot-plant/1724797/&gt;  
Tumbleweed by Megan Sorenson from the Noun Project: &lt;https://thenounproject.com/term/tumbleweed/1390797/&gt;  
