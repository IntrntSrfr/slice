FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

# production environment
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
