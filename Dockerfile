FROM node:20-slim

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Asegurar permisos correctos
RUN mkdir -p dist && chown -R node:node .

# Cambiar al usuario node
USER node

# Copy source code
COPY --chown=node:node . .

# Limpiar dist y construir
RUN rm -rf dist && npm run build

# Clean up dev dependencies
RUN npm ci --omit=dev

# Expose port
EXPOSE 8080

# Start the server
CMD [ "npm", "start" ]