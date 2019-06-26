FROM node:8.2.1 as build-stage
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY src/frontend/curator_dashboard .
RUN npm install --silent
RUN npm run build --production

FROM nginx:1.15.2-alpine

COPY --from=build-stage /usr/src/app/build/ /var/www

COPY src/frontend/curator_dashboard/public/e403.html /etc/nginx/html/e403.html
COPY src/frontend/curator_dashboard/nginx.conf /etc/nginx/nginx.conf

# production environment
EXPOSE 5001
ENTRYPOINT ["nginx","-g","daemon off;"]