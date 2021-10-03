FROM node:16.6.0-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY . ./

RUN yarn --prod

CMD yarn start:prod

EXPOSE 8080
