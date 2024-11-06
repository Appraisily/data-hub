FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Clean up dev dependencies after build
RUN npm ci --omit=dev

# Expose port
EXPOSE 8080

# Start the server
CMD [ "npm", "start" ]