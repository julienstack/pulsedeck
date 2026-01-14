# Stage 1: Build the Angular application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Debug: List environment files to verify existence
RUN ls -la src/environments

# Build the application for production
RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from build stage
# Angular 21 outputs to dist/<project-name>/browser
COPY --from=build /app/dist/dashboard/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
