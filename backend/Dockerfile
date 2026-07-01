FROM node:20-alpine AS dev

RUN apk add --no-cache yarn

WORKDIR /app

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["yarn", "start:dev"]

FROM node:20-alpine AS deps

RUN apk add --no-cache yarn

WORKDIR /app

COPY package.json yarn.lock* .yarnrc* ./
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --network-timeout 600000 --production=false

FROM deps AS build

COPY nest-cli.json tsconfig.json ./
COPY src ./src
RUN yarn build

FROM node:20-alpine AS prod

RUN apk add --no-cache yarn

WORKDIR /app

COPY package.json yarn.lock* .yarnrc* ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN mkdir -p uploads

EXPOSE 3000

CMD ["yarn", "start:prod"]
