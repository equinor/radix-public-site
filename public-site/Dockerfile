FROM node:16-alpine as builder

WORKDIR /site
COPY ./docs .
RUN npm install
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.25-alpine
WORKDIR /site
COPY --from=builder /site/src/.vuepress/dist /site
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER 101
