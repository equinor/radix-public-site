FROM docker.io/node:20.11.1-alpine3.19 as builder

WORKDIR /site
COPY . .
RUN npm install -g npm@10.6.0
RUN npm install
RUN npm run build

EXPOSE 8080
USER 1000
CMD ["npm", "run", "serve"]