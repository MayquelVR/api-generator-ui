FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/api-generator-ui/browser /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

RUN apk add --no-cache gettext

ENV BACKEND_HOST=backend
ENV BACKEND_PORT=8080

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '$$BACKEND_HOST $$BACKEND_PORT' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
