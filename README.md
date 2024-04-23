# The Great Debate
ECE 3824 Final Project: Question Response Monitoring using a Cloud-connected IoT Device

The purpose of this project is to deploy a full-stack web app using Docker and the AWS Cloud.
The app consists of three services:
- Database (Redis) hosted by the Redis Cloud
- Backend (Flask) hosted on an EC2 instance using Docker (production served by gunicorn)
- Frontend (React) hosted on an EC2 instance using Docker (production served by nginx)
# Building and Deploying with Docker
First, clone this repository onto your local machine.
To start the application, use `docker-compose`:
```
docker-compose up -d --build
```
To stop and remove the containers, specify `down`:
```
docker-compose down
```

# Accessing the Website
To access the query web interface, simply visit `localhost:3000`. 
Type the following into your browser of choice (no port number is required):
```
localhost:3000
```
