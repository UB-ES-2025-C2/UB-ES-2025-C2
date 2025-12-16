# Use the official Node image for the builder stage.
FROM node:25-alpine AS builder
ARG APP="frontend"
ARG VITE_API_URL="http://127.0.0.1:8000"

# Create the app directory.
RUN mkdir /${APP}

# Set the working directory inside the container.
WORKDIR /${APP}

# Copy the package.json files to the container.
COPY package.json package-lock.json ./

# Download dependencies.
RUN npm ci --include dev --include prod

# Copy the source of the project.
ADD ./src ./src

# Copy the public files of the project.
ADD ./public ./public

# Copy the necessary files to execute the frontend.
COPY index.html jsconfig.json vite.config.js ./

# Set the Vite API's URL.
ENV VITE_API_URL=${VITE_API_URL}

# Build the project.
RUN npm run build

# Use the official Nginx image for the production stage.
FROM nginx:alpine AS production
ARG APP="frontend"
ARG PORT="80"
ARG UID="988"

# Copy the nginx configuration.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build application.
COPY --from=builder /${APP}/dist /usr/share/nginx/html

# Expose the Vue port.
EXPOSE 80

# Change the stop singal.
STOPSIGNAL SIGQUIT

# Change the user.
# USER frontend:frontend

CMD ["nginx", "-g", "daemon off;"]
