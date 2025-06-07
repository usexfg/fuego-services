FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Expose port (default 3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"] 