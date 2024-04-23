# Use an official Node runtime as the base image
FROM node:16 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the current directory contents into the container
COPY . .

# Build the app
RUN npm run build

# Use Nginx to serve the frontend
FROM nginx:alpine

# Copy build files to Nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY deployment/nginx.default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
