FROM docker.io/node:21-alpine3.18 as builder

WORKDIR /site
COPY . .
RUN npm install
RUN npm run build

CMD npm run dev
