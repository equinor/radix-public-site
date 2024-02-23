FROM docker.io/node:20.11.1-alpine3.19 as builder

WORKDIR /site
COPY . .
RUN npm install -g npm@10.4.0 && npm install
RUN npm run build

FROM docker.io/nginxinc/nginx-unprivileged:1.25.2-alpine
WORKDIR /site
COPY --from=builder /site/build /site
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
USER 101
