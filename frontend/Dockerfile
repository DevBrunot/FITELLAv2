FROM node:20-alpine AS dev

RUN apk add --no-cache yarn

WORKDIR /app

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["yarn", "dev", "--host", "0.0.0.0"]

FROM node:20-alpine AS deps

RUN apk add --no-cache yarn

WORKDIR /app

COPY package.json yarn.lock* .yarnrc* ./
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --network-timeout 600000 --production=false

FROM deps AS build

COPY . .
RUN yarn build

FROM nginx:1.27-alpine AS prod

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
