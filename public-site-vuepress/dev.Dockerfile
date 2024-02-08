FROM docker.io/node:21-alpine3.18

WORKDIR /site
COPY ./docs/package.json ./docs/package-lock.json /site/
RUN npm install
COPY ./docs .

CMD npm run dev
