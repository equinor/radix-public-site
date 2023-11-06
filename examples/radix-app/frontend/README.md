# WWW - a node Express front-end

A small web front-end that queries the Echo module for Radix runtime information. Part of the Radix Example Workshop 1

## Pre-requisites

The WWW app expects the "echo" to be available "somewhere". Depending on how you develop, you need to tell WWW where to find this by using the ECHO_URL environment variable. The default value is localhost:3000

## Local node development





Install dependencies
```
npm install
```
Run the application
```
npm start
```
Run the application dev mode - automatic restart of server when changes in source code are detected.
```
npm run dev
```
Run a vulnerability check on dependencies
```
npm audit
```
Lint the Javascript code
```
npm run lint
```
Run the application in debug mode - extensive logging
```
npm run debug
```

### Environment variables

The echo application use the following environment variables:

* ```PORT``` to define which local port to listen to. Default is port 3001.
* ```NODE_ENV``` with values ```development``` or ```production``` (used by the Express framework)
* ```ECHO_URL``` to define url for ECHO server. Example: ECHO_URL=http://localhost:3000 (default)

## Local docker development - build and run WWW

To build the image for the WWW app
```
docker build -t www .
```

To run the WWW app in Docker
```
docker run -it --name=www --env ECHO_URL=http://localhost:3000 --rm -p 3001:3001 www
```
(replace ```-it``` with ```-d``` to run in detached mode)

Remember that ```localhost``` for stuff running inside a container is the container itself and not the host. There are of course different ways to work with this - Google and docker networking are cool tips
