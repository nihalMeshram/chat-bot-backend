# Base image for building the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy the rest of the source files
COPY . .

# Build the app
RUN npm run build

# ===============================
# ===== Production Image ========
# ===============================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled output and assets from builder
COPY --from=builder /app/dist ./dist

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
