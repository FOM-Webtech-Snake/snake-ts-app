FROM node:22-alpine AS builder
LABEL authors=["fbnystn","ludwig258","MJoners"]

# Set the working directory + App Version
WORKDIR /app
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
COPY tsconfig*.json ./
COPY webpack.*.cjs ./
COPY .env ./
COPY src ./src
COPY public ./public

# Install dependencies
RUN npm install && \
    echo "Building with version ${APP_VERSION}" && \
    npm run build

# Use a lightweight image for the final output to minimize image size
FROM node:22-alpine

# Set the working directory + App Version
WORKDIR /app
ARG APP_VERSION
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

# Switch to a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Define the command to run the server
CMD ["node", "dist/server/index.js"]
