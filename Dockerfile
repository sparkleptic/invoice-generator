FROM alpine:3.7

RUN apk --update --no-cache add nodejs nodejs-npm

RUN mkdir -p /vuedocker

COPY src/ /vuedocker/src/
COPY package.json /vuedocker/
COPY webpack.config.js /vuedocker/
COPY index.html /vuedocker/

WORKDIR /vuedocker/

RUN npm install

EXPOSE 8080

CMD npx cross-env NODE_ENV=development webpack-dev-server --hot --host 0.0.0.0
