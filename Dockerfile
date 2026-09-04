FROM node:24-bookworm-slim AS base

WORKDIR /app

RUN corepack enable


# Development/build dependencies
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile


# Build
FROM deps AS build

COPY tsconfig.json ./
COPY src ./src
COPY viewer ./viewer
COPY data ./data

RUN pnpm build


# Production dependencies
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-prod,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile


# Runtime
FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3334

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/viewer ./viewer
COPY --from=build /app/data ./data
COPY package.json ./

EXPOSE 3334

CMD ["node", "dist/server.js"]