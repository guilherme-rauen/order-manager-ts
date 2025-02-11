FROM node:22.13.1-alpine3.21 as base

WORKDIR /app

FROM base as build 

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build:prod

FROM base

COPY --from=build /app /app

CMD ["node", "dist/src/index.js"]