FROM oven/bun:1.1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/package.json
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.1-alpine AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["bun", "run", "apps/server/src/index.ts"]
