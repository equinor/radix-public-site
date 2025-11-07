FROM docker.io/node:22.16-alpine3.22 AS builder

WORKDIR /site
COPY . .
RUN npm install
RUN npm run build

FROM docker.io/nginxinc/nginx-unprivileged:1.29.2-alpine3.22
WORKDIR /site
COPY --from=builder /site/build /site
COPY /proxy/server.conf /etc/nginx/conf.d/default.conf
COPY /proxy/securityheaders /etc/nginx/conf.d/
EXPOSE 8080
USER 101