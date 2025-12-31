# syntax=docker/dockerfile:1.7

############################
# Base
############################
FROM node:25.2.1-alpine3.23 AS base

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=true

WORKDIR /app

RUN corepack enable

############################
# pnpm store (global dependencies cache)
############################
FROM base AS pnpm-store

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm fetch

############################
# Builder
############################
FROM base AS build

ENV NODE_ENV=development

# Install protobuf for gRPC generator
RUN apk add --no-cache protobuf

COPY package.json pnpm-lock.yaml ./

# Install application dependencies
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY protocol ./protocol

# Build gRPC protocol
RUN mkdir -p generated && pnpm run protocol:generate

COPY . .

# Build the final application
RUN --mount=type=cache,id=nextjs-cache,target=/app/.next/cache \
    NODE_ENV=production pnpm run build

# Cleanup dependencies
RUN pnpm prune --prod \
 && rm -rf /pnpm/store \
 && rm -rf /root/.cache

############################
# Runtime
############################
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NODE_OPTIONS="--enable-source-maps=false"

EXPOSE 3000

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER nonroot

CMD ["server.js"]
