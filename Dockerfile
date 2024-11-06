FROM node:20-slim

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Asegurar permisos correctos y cambiar al usuario node
RUN mkdir -p dist && chown -R node:node .
USER node

# Copy source code
COPY --chown=node:node . .

# Build directamente con TypeScript
RUN npx tsc

# Clean up dev dependencies
RUN npm ci --omit=dev

# Expose port
EXPOSE 8080

# Start the server
CMD [ "npm", "start" ]