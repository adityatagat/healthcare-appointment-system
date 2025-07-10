# Use Node.js 22 LTS as base image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Bundle app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the port the app runs on
EXPOSE 3002

# Command to run the application
CMD ["npm", "start"]
