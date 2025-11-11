# Use the official Python image for the builder stage.
FROM python:3.14-alpine AS builder
ARG PORT="8000"
ARG SECRET_KEY="django-insecure-abcdef123456"
ARG UID="988"

# Copy UV from the UV image.
COPY --from=ghcr.io/astral-sh/uv:latest --chown=backend:backend /uv /uvx /bin/

# Create the app directory.
RUN mkdir /app

# Set the working directory inside the container.
WORKDIR /app

# Copy the Django project to the container.
ADD ./music_space /app/music_space
COPY ./pyproject.toml ./manage.py ./README.md /app/

# Set environment variables.
# Prevents Python from buffering stdout and stderr.
ENV PYTHONUNBUFFERED=1

# Run this command to synchronize all dependencies.
RUN ["/bin/uv", "sync", "--no-dev", "--group", "prod"]

# Use the official Python image for the production stage.
FROM python:3.14-alpine AS production
ARG PORT
ARG SECRET_KEY
ARG UID

# Set environment variables.
# Prevents Python from buffering stdout and stderr.
ENV PYTHONUNBUFFERED=1
# Secret key for the Django database.
ENV SECRET_KEY=${SECRET_KEY:-"django-insecure-abcdef123456"}
# Deactivate debug mode for Django.
ENV DJANGO_DEBUG="0"
# Allowed hosts for Django.
ENV DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,backend"
# Port for Django
ENV DJANGO_PORT=${PORT:-"8000"}

# Copy the built app from the builder stage
COPY --from=builder /app /app

# Set the working directory inside the container.
WORKDIR /app

# Expose the Django port.
EXPOSE ${PORT}

# Change the user.
# USER backend:backend -> Failed canonicalization of Python.

# Change the stop singal.
STOPSIGNAL SIGQUIT

# Activate the virtual environment.
RUN source ./.venv/bin/activate

# Start the application using Gunicorn.
CMD ["sh", "-c", "./.venv/bin/gunicorn --bind 0.0.0.0:$DJANGO_PORT --workers 3 music_space.wsgi:application"]
