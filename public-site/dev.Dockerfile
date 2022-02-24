FROM node:16-alpine

WORKDIR /site
COPY ./docs/package.json ./docs/package-lock.json /site/
RUN npm install
COPY ./docs .

CMD npm run dev
