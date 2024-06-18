FROM docker.io/node:20.14.0-alpine3.20 as builder

WORKDIR /site
COPY . .
RUN npm install
RUN npm run build

EXPOSE 8080
USER 1000
CMD ["npm", "run", "serve"]