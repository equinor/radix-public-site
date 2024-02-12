FROM docker.io/node:21-alpine3.18 as builder

WORKDIR /site
COPY ./src .
RUN npm install
RUN npm run build

FROM docker.io/nginxinc/nginx-unprivileged:1.25.2-alpine
WORKDIR /site
COPY --from=builder /site/src/.vuepress/dist /site
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER 101
