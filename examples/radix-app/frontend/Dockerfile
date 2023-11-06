#
# -- Base node image with app
#
FROM node:14-alpine AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json app.js ./
RUN mkdir -p ./bin ./routes
COPY bin bin
COPY public public
COPY views views
COPY routes routes

#
# -- Dependencies
#
FROM base as dependencies
WORKDIR /usr/src/app
RUN npm install --only=production
RUN cp -R node_modules node_modules_production
RUN npm install

#
# Release image
#
FROM base as release
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules_production ./node_modules
EXPOSE 3007
ENV NODE_ENV=production
USER 1000
ENTRYPOINT [ "npm", "start"]
