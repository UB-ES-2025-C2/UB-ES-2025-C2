# Use the official Node image for the builder stage.
FROM node:25-alpine AS build
ARG PORT="80"
ARG UID="988"
ARG VITE_API_URL="https://localhost:8000"

# Create the app directory.
RUN mkdir /app

# Set the working directory inside the container.
WORKDIR /app

# Copy the package.json files to the container.
COPY package*.json ./

# Download dependencies.
RUN npm ci

# Copy the rest of the project.
COPY . .

# Set the Vite API's URL.
ENV VITE_API_URL=$VITE_API_URL

# Build the project.
RUN npm run build

# Use the official Nginx image for the production stage.
FROM nginx:alpine AS production
ARG PORT
ARG UID

# Add a user for the runner.
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid ${UID} \
    "frontend"

# Copy the build application
COPY --chown=frontend:frontend --from=build /app/dist /usr/share/nginx/html

# Expose the Vue port.
EXPOSE 80
# Currently only 80 works. ${PORT}

# Change the stop singal.
STOPSIGNAL SIGQUIT

# Change the user.
# USER frontend:frontend

CMD ["nginx", "-g", "daemon off;"]
