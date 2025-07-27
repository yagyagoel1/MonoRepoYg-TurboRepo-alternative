# Use a proper base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install git and required packages
RUN apk add --no-cache git

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN npm install -g serve
# Copy only lockfiles and configuration first to leverage cache
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./

# Create workspace directories and copy package.json files
COPY apps/frontend/package.json ./apps/frontend/
COPY  packages/test/package.json ./packages/test/
COPY apps/nexttest/package.json ./apps/nexttest/
COPY packages/ui/package.json ./packages/ui/

# Set pnpm store location
RUN pnpm config set store-dir /pnpm-store

# Install dependencies with proper architecture handling
RUN pnpm install  

# Copy rest of the project
COPY . .

# Build the app
RUN pnpm run build

# Expose port
EXPOSE 3000

# Set non-root user for safety (optional, uncomment if necessary)
# RUN adduser -D appuser
# USER appuser

# Start the application
CMD ["pnpm","run", "start"]
