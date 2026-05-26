# Multi-stage build for efficient container size
FROM node:22-alpine AS builder

# Build arguments
ARG VERSION="unknown"
ARG COMMIT_SHA="unknown"
ARG BUILD_DATE="unknown"
# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies. node-threatlocker is vendored locally via a file:
# dependency; the build context must include the sibling node-threatlocker dir.
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies in builder stage
RUN npm prune --omit=dev

# Production stage
FROM node:22-alpine AS production

# Create a non-root user for security
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 -G mcp

# Set working directory
WORKDIR /app

# Copy package files and built application from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p /app/logs && chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose port
EXPOSE 8080

# Health check against the actual HTTP endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV MCP_TRANSPORT=http
ENV MCP_HTTP_PORT=8080
ENV MCP_HTTP_HOST=0.0.0.0
ENV AUTH_MODE=gateway

# Define volume for logs
VOLUME ["/app/logs"]

# Start the application
CMD ["node", "dist/http.js"]

# Build arguments for runtime
ARG VERSION="unknown"
ARG COMMIT_SHA="unknown"
ARG BUILD_DATE="unknown"

# Labels for metadata
LABEL io.modelcontextprotocol.server.name="io.github.w159/threatlocker-mcp"
LABEL maintainer="w159"
LABEL version="${VERSION}"
LABEL description="ThreatLocker MCP Server - Model Context Protocol server for ThreatLocker Portal API"
LABEL org.opencontainers.image.title="threatlocker-mcp"
LABEL org.opencontainers.image.description="Model Context Protocol server for ThreatLocker Portal API integration"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${COMMIT_SHA}"
LABEL org.opencontainers.image.source="https://github.com/w159/threatlocker-mcp"
LABEL org.opencontainers.image.documentation="https://github.com/w159/threatlocker-mcp/blob/main/README.md"
LABEL org.opencontainers.image.url="https://github.com/w159/threatlocker-mcp/pkgs/container/threatlocker-mcp"
LABEL org.opencontainers.image.vendor="w159"
LABEL org.opencontainers.image.licenses="Apache-2.0"