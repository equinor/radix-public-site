FROM node:alpine

WORKDIR /site
COPY ./docs .
RUN npm install -D vuepress vuepress-plugin-fulltext-search
#COPY ./docs/package*.json .

CMD ls; npm run docs:dev