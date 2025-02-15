# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]