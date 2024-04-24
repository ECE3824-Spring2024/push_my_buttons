# DOCKERFILE
#
# Image: Backend
#
# Purpose: Runs a Flask backend served by Gunicorn

# use Python runtime as the base image
FROM python:3.9

# set the working directory
WORKDIR /app

# copy requirements.txt and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# tell Flask it is being served in production environment
ENV FLASK_ENV production

# copy the server script into the container
COPY backend_server.py .

# run the production application
CMD ["gunicorn", "-b", "0.0.0.0:5000", "backend_server:server"]
