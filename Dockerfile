# --- Stage 1: Build Stage ---
FROM oven/bun:1-alpine AS builder
WORKDIR /graxon/app

# Copy package files and lockfile
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Vite application
# Vite looks for VITE_* env vars during this step
RUN bun run build

# --- Stage 2: Production Stage ---
FROM nginx:1.25-alpine AS runner
WORKDIR /usr/share/nginx/html

# Clean the default nginx public files
RUN rm -rf ./*

# Copy the static build artifacts from the builder stage
COPY --from=builder /graxon/app/dist .

# Copy a custom nginx configuration if you have one (Optional but recommended for SPA routing)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
