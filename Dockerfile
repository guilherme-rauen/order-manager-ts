FROM node:22.14.0-alpine3.21 AS base

WORKDIR /app

FROM base AS build 

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build:prod

FROM base

COPY --from=build /app /app

CMD ["node", "dist/src/index.js"]