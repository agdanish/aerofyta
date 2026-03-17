# Stage 1: Build dashboard
FROM node:22-alpine AS dashboard-build
WORKDIR /app/dashboard
COPY dashboard/package.json dashboard/package-lock.json ./
RUN npm ci
COPY dashboard/ ./
RUN npm run build

# Stage 2: Build agent (includes devDeps for tsc)
FROM node:22-alpine AS agent-build
WORKDIR /app/agent
RUN apk add --no-cache python3 make g++ linux-headers
COPY agent/package.json agent/package-lock.json ./
RUN npm ci
COPY agent/ ./
RUN npx tsc

# Stage 3: Production runtime
FROM node:22-alpine
WORKDIR /app

# Install native build tools for sodium-native
RUN apk add --no-cache python3 make g++ linux-headers

# Install agent production dependencies only
COPY agent/package.json agent/package-lock.json ./agent/
RUN cd agent && npm ci --omit=dev

# Copy compiled agent output
COPY --from=agent-build /app/agent/dist ./agent/dist

# Copy dashboard build output
COPY --from=dashboard-build /app/dashboard/dist ./dashboard/dist

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "agent/dist/index.js"]
