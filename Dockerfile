FROM node:22-alpine AS builder
LABEL authors=["fbnystn","ludwig258","MJoners"]

# Set the working directory in the container
WORKDIR /app

# Accept the APP_VERSION as a build argument
ARG APP_VERSION
# Set the version as an environment variable
ENV APP_VERSION=${APP_VERSION}

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the TypeScript project and the Webpack bundle
RUN echo "Building with version ${APP_VERSION}" && npm run build

# Use a lightweight image for the final output to minimize image size
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Accept the APP_VERSION as a build argument
ARG APP_VERSION
# Set the version as an environment variable
ENV APP_VERSION=${APP_VERSION}

# Copy the node_modules and the dist folder from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy any other necessary files for running the server (e.g., .env)
COPY --from=builder /app/.env ./.env

# Expose the port specified in the .env file (fallback to 3000 if not specified)
ARG PORT=8081
ENV PORT=$PORT
EXPOSE ${PORT}

# Define the command to run the server
CMD ["node", "dist/server/index.js"]
