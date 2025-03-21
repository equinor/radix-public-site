FROM node:18-alpine3.16 AS build

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

# install app dependencies
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY --chown=101 --from=build /app/dist /usr/share/nginx/html

COPY ./100-inject-envvars.sh /docker-entrypoint.d/100-inject-envvars.sh
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

USER 101

EXPOSE 8001
