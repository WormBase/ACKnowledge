FROM node:18-slim as build-stage
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV NODE_OPTIONS="--openssl-legacy-provider"
COPY src/frontend/author_portal .
RUN npm install --legacy-peer-deps --silent
RUN npm run build --production
# Remove auto-generated service worker files to prevent stale caching
RUN rm -f /usr/src/app/build/service-worker.js /usr/src/app/build/precache-manifest.*.js

FROM nginx:1.15.2-alpine

COPY --from=build-stage /usr/src/app/build/ /var/www

COPY src/frontend/author_portal/nginx.conf /etc/nginx/nginx.conf

# production environment
EXPOSE 5002
ENTRYPOINT ["nginx","-g","daemon off;"]