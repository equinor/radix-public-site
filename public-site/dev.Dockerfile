FROM node:16-alpine

WORKDIR /site
COPY ./docs .
RUN npm install

CMD npm run dev
