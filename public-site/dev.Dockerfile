FROM ruby:2.7-alpine

RUN apk add build-base nodejs

WORKDIR /site
COPY Gemfile* ./

RUN bundle install
