# Use lightweight Node.js base image
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./
COPY node_modules/ ./node_modules/
COPY prisma/ ./prisma/

# Generate Prisma client for Alpine Linux
RUN npx prisma generate

# Copy the built Next.js output
COPY .next/ ./.next/
COPY public/ ./public/

# Copy next.config if needed at runtime
COPY next.config.* ./

# Set environment
ENV NODE_ENV production
ENV PORT 3000

# Expose port
EXPOSE 3000

# Run the built app
CMD ["npx", "next", "start"]
