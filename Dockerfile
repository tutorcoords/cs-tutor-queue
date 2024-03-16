# Stage 1: Build client
FROM node:lts-alpine as build

COPY ./client/package*.json ./

RUN npm install

COPY ./client .

RUN npm run build

# Stage 2: Build server
FROM node:lts-alpine

COPY --from=build /dist ./client-dist

COPY ./server/package*.json ./

RUN npm install

COPY ./server .

EXPOSE 3000

RUN npm run build

CMD ["node", "dist/index.js"]