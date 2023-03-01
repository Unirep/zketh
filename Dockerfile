FROM node:16-buster

COPY . /src

WORKDIR /src

RUN yarn && rm -rf packages/frontend

RUN yarn loadBeta

RUN echo "module.exports = {}" > config.js

FROM node:16-buster

COPY --from=0 /src /src
WORKDIR /src/packages/relay

CMD ["npm", "start"]
