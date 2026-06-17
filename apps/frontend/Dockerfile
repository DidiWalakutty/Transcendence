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
RUN cd apps/frontend && bun run generate-routes
RUN cd apps/frontend && bun run build

FROM oven/bun:1.3.14-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/apps/frontend/.output ./.output

EXPOSE 3000
CMD ["bun", "./.output/server/index.mjs"]
