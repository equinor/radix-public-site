# Radix Public Site

This is the public site for promoting, documenting & showcasing the Radix
platform. It is a static site built with [VuePress 2](https://v2.vuepress.vuejs.org/).

## Running, building

### The easy way

`docker compose --profile dev up --build`

This starts the Docusaurus developer server on port 8000, and NGINX on port 8080 which proxies requests to the docusaurus server. This ensures that your browser receives the same security related headers (defined in ./proxy/headers) as when you build and run the Dockerfile container image. Changes to source files are immediatly shown in the browser.

You can see the site on &lt;http://localhost:8080&gt;

Stop the server with Ctrl+C, but also run `docker compose --profile dev down` to clean up the
Docker state.

If you need a shell in the container:

    `docker exec -ti radix-public-site_container sh`

NB: The search plugin does not work when running the docusaurus development server.

You can also build and run the container image intended for production environments by running `docker compose --profile prod up --build`. To stop and cleanup you run `docker compose --profile prod down`.

**Windows**: There is currently [a
problem](https://github.com/docker/for-win/issues/56) with Docker that prevents
auto-reload of the development server from working when source files change. A
simple workaround is to use [a little watcher
process](https://github.com/FrodeHus/docker-windows-volume-watcher/releases).

### The other way

You can also run docusurus locally. All that is needed is NodeJS and NPM. In the root folder of the project run `npm i` to fetch dependencies followed by `npm run start` to start serving the development environment of the Public Site. The disadvantage is that you will not catch errors caused by the security headers set by NGINX.

## Folder structure

The site content is organised within `/docs/src/`. In here you'll find:

- `/.vuepress/`: The Vuepress source folder containing the main site configuration.
- `/.vuepress/components/`: Custom user-created Vuepress components.
- `/.vuepress/public/`: All public content for the Public Site, such as images and general stylesheets.
- `/.vuepress/styles/`: Style override files for Vuepress. See the [CSS Section](#CSS) below.

But the interesting bits are the actual content:

- `/docs/`: General concepts (topics).
- `/guides/`: User-friendly, conversational guides on how to achieve specific objectives.
- `/references/`: Reference documentation for end-users.
- `/other/`: Documentation not directly related to any specific category.

## docusaurus
This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

[Create an application](https://docusaurus.io/docs/installation)
```bash
npx create-docusaurus@latest public-site classic --typescript
```

## docusaurus development

`npm start`
Starts the development server.

`npm run build`
Bundles your website into static files for production.

`npm run serve`
Serves the built website locally.

`npm run deploy`
Publishes the website to GitHub pages.

We recommend that you begin by typing:

`cd public-site`
`npm start`

## Production build

The production build is containerised in the project's `Dockerfile`. To run the
build image locally:

    docker build -t radix-public-site-prod .
    docker run --name radix-public-site-prod_container --rm -p 8080:8080 radix-public-site-prod

The web server will be available on &lt;http://localhost:8080&gt;

# Credits

trees by Made x Made from the Noun Project: &lt;https://thenounproject.com/term/trees/1723897/&gt;  
pot plant by Made x Made from the Noun Project: &lt;https://thenounproject.com/term/pot-plant/1724797/&gt;  
Tumbleweed by Megan Sorenson from the Noun Project: &lt;https://thenounproject.com/term/tumbleweed/1390797/&gt;  
