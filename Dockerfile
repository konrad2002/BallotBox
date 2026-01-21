# Use lightweight Node.js base image
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy package.json and node_modules (for runtime deps)
COPY package.json ./
COPY node_modules/ ./node_modules/

# Copy the built Next.js output
COPY .next/ ./.next/
COPY public/ ./public/

# Optionally copy next.config.js if needed at runtime
COPY next.config.js* ./

# Set environment
ENV NODE_ENV production
ENV PORT 3000

# Expose port
EXPOSE 3000

# Run the built app
CMD ["npx", "next", "start"]
