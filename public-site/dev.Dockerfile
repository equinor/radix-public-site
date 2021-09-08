FROM node:alpine

WORKDIR /site
COPY ./docs .
RUN npm install -D vuepress vuepress-plugin-fulltext-search

CMD npm run dev