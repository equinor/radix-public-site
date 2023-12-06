FROM nginxinc/nginx-unprivileged:1-alpine

WORKDIR /app
COPY /app .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8001
