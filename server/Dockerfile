FROM node:alpine as build

RUN apk update && apk upgrade && adduser -D svelteuser

WORKDIR /jam

COPY . /jam

RUN yarn install && yarn build

FROM node:alpine

RUN apk update && apk upgrade && apk add dumb-init

WORKDIR /jam

COPY --from=build /jam  ./

EXPOSE 8080

ENV HOST=0.0.0.0 PORT=8080 NODE_ENV=production

CMD ["dumb-init","node","build/index.js"]
