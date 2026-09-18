FROM oven/bun:1.3.14-alpine AS deps
WORKDIR /app

COPY package.json bun.lock tsconfig.json vite.config.ts ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY packages/schemas/package.json packages/schemas/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

RUN bun install --frozen-lockfile --ignore-scripts

FROM deps AS builder
WORKDIR /app

COPY . .
RUN cd apps/backend && bun run build

FROM oven/bun:1.3.14-alpine AS prod-deps
WORKDIR /app

COPY package.json bun.lock tsconfig.json vite.config.ts ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY packages/schemas/package.json packages/schemas/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

RUN bun install --frozen-lockfile --ignore-scripts --production --filter @repo/backend --filter @repo/schemas

FROM oven/bun:1.3.14-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/drizzle ./apps/backend/drizzle
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/packages ./packages

EXPOSE 3001
CMD ["bun", "apps/backend/dist/main.js"]
