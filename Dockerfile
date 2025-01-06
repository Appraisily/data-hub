FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Start the server
CMD [ "node", "dist/index.js" ]