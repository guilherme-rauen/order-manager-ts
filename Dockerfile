FROM node:20.9.0-alpine3.18 as base

WORKDIR /app

FROM base as build 

COPY package.json package-lock.json ./

RUN npm ci

COPY ./src/infrastructure/db/prisma/schema.prisma ./src/infrastructure/db/prisma/

RUN npm run prisma:generate

COPY . .

RUN npm run build:prod

FROM base

COPY --from=build /app /app

CMD ["node", "dist/src/index.js"]