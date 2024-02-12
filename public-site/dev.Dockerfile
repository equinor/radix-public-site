FROM docker.io/node:21-alpine3.18

WORKDIR /site
COPY ./src/package.json ./src/package-lock.json /site/
RUN npm install
COPY ./src .

CMD npm run dev
