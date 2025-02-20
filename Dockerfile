# syntax=docker/dockerfile:1

# As of `mediaplex@1.0.0`, this project supports musl on x86_64 & aarch64(ARM)
FROM node:lts-alpine as base

# Required by `discord-player`
RUN apk update && apk add ffmpeg

USER node

WORKDIR /home/node/app

COPY --chown=node:node . .

FROM base as build
ENV NODE_ENV=development

# Ignore scripts to avoid generating artifacts unnecessary for build step (config.json)
RUN npm clean-install && npm run build --ignore-scripts

FROM base as app
ENV NODE_ENV=production

COPY --from=build /home/node/app/build ./build

RUN npm clean-install

CMD ["npm", "start"]
