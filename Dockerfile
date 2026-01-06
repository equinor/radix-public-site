FROM docker.io/node:22.21-alpine3.23 AS builder

WORKDIR /site
COPY . .
RUN npm install --ignore-scripts
RUN npm run build

FROM docker.io/nginxinc/nginx-unprivileged:1.29.3-alpine3.22
WORKDIR /site
COPY --from=builder /site/build /site
COPY /proxy/server.conf /etc/nginx/conf.d/default.conf
COPY /proxy/securityheaders /etc/nginx/conf.d/
EXPOSE 8080
USER 101