FROM node:18.18.2-alpine3.18 as base

WORKDIR /app

FROM base as build 

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM base

COPY --from=build /app /app

CMD ["node", "dist/src/main.js"]