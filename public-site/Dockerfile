FROM node:alpine as builder
WORKDIR /site
COPY ./docs .

FROM nginxinc/nginx-unprivileged:1.18-alpine
WORKDIR /site
COPY --from=builder /site/src/.vuepress/dist /site
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER 101