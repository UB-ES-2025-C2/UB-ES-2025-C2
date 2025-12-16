# Use the official Python image for the builder stage.
FROM python:3.14-alpine AS builder
ARG APP="backend"

# Copy UV from the UV image.
COPY --from=ghcr.io/astral-sh/uv:latest --chown=backend:backend /uv /uvx /bin/

# Create the app directory.
RUN mkdir /${APP}

# Set the working directory inside the container.
WORKDIR /${APP}

# Copy the Django project to the container.
ADD ./music_space ./music_space
COPY pyproject.toml manage.py README.md ./

# Set environment variables.
# Prevents Python from buffering stdout and stderr.
ENV PYTHONUNBUFFERED=1

# Run this command to synchronize all dependencies.
RUN ["/bin/uv", "sync", "--no-dev", "--group", "prod"]

# Use the official Python image for the production stage.
FROM python:3.14-alpine AS production
ARG APP="backend"
ARG PORT="80"
ARG UID="988"

# Set environment variables.
# Prevents Python from buffering stdout and stderr.
ENV PYTHONUNBUFFERED=1
# Deactivate debug mode for Django.
ENV DJANGO_DEBUG="0"
# Port for Django
ENV DJANGO_PORT=${PORT}

# Copy the built app from the builder stage
COPY --from=builder /${APP} /${APP}

# Set the working directory inside the container.
WORKDIR /${APP}

# Activate the virtual environment.
RUN source ./.venv/bin/activate

# Expose the Django port.
EXPOSE ${PORT}

# Change the stop singal.
STOPSIGNAL SIGQUIT

# Change the user.
# USER backend:backend -> Failed canonicalization of Python.

# Start the application using Gunicorn.
CMD ["sh", "-c", "./.venv/bin/gunicorn --bind 0.0.0.0:$DJANGO_PORT --workers 3 music_space.wsgi:application"]
