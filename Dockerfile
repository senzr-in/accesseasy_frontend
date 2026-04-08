# Base image
FROM node:18-alpine

# Container work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy full project
COPY . .

# Expose Vite port
EXPOSE 5173

# Start Vue app
CMD ["npm", "run", "dev"]
