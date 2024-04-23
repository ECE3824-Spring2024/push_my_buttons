# DOCKERFILE
#
# Image: Frontend
#
# Purpose: Runs a React frontend served by nginx

# use Node runtime as the base image
FROM node:16 as build

# set the working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install Javascript dependencies
RUN npm install

# copy all React app files
COPY ./src ./src
COPY ./public ./public

# build the app
RUN npm run build

# use Nginx to serve the frontend
FROM nginx:alpine

# copy build files to nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY deployment/nginx.default.conf /etc/nginx/conf.d/default.conf

# run the production application
CMD ["nginx", "-g", "daemon off;"]
