# Stage 1: Build dashboard
FROM node:22-alpine AS dashboard-build
WORKDIR /app/dashboard
COPY dashboard/package.json dashboard/package-lock.json ./
RUN npm ci
COPY dashboard/ ./
RUN npm run build

# Stage 2: Build agent (compile TS + native modules)
FROM node:22-alpine AS agent-build
WORKDIR /app/agent
RUN apk add --no-cache python3 make g++ linux-headers
COPY agent/package.json agent/package-lock.json ./
RUN npm ci --build-from-source
COPY agent/ ./
RUN npx tsc
# Prune devDependencies after compilation
RUN npm prune --omit=dev

# Stage 3: Production runtime (slim)
FROM node:22-alpine
WORKDIR /app

# Copy pre-built agent node_modules (with compiled sodium-native)
COPY --from=agent-build /app/agent/node_modules ./agent/node_modules
COPY --from=agent-build /app/agent/package.json ./agent/package.json

# Copy compiled agent output
COPY --from=agent-build /app/agent/dist ./agent/dist

# Copy agent non-compiled files needed at runtime
COPY agent/contracts ./agent/contracts
COPY agent/circuits ./agent/circuits
COPY agent/SKILL.md ./agent/SKILL.md
COPY agent/SOUL.md ./agent/SOUL.md

# Copy dashboard build output
COPY --from=dashboard-build /app/dashboard/dist ./dashboard/dist

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "agent/dist/index.js"]
