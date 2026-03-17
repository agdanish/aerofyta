# Stage 1: Build dashboard (Debian - rollup needs glibc native bindings)
FROM node:22 AS dashboard-build
WORKDIR /app/dashboard
COPY dashboard/package.json dashboard/package-lock.json ./
# Cache bust: force fresh install for glibc rollup bindings
RUN npm ci && npm ls rollup
COPY dashboard/ ./
RUN npm run build

# Stage 2: Build agent on Debian (sodium-native has prebuilts for linux-x64-glibc)
FROM node:22 AS agent-build
WORKDIR /app/agent
COPY agent/package.json agent/package-lock.json ./
RUN npm ci
COPY agent/ ./
RUN npx tsc
RUN npm prune --omit=dev

# Stage 3: Production runtime (Debian slim - has glibc for sodium-native)
FROM node:22-slim
WORKDIR /app

# Copy pre-built agent node_modules (with working sodium-native)
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
