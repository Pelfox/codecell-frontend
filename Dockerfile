# syntax=docker/dockerfile:1.7

############################
# pnpm tooling
############################
FROM node:lts-alpine3.23 AS pnpm

# Set environment variables
ENV PNPM_HOME=/pnpm \
    PATH=$PNPM_HOME:$PATH \
    NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# Enable Corepack and pnpm 
RUN corepack enable && \
    corepack prepare pnpm@latest --activate

WORKDIR /app

############################
# dependencies installation
############################
FROM pnpm AS dependencies

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

############################
# build
############################
FROM pnpm AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN --mount=type=cache,id=grpc-generated,target=/app/generated \
    pnpm protocol:generate

RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm build

############################
# runtime
############################
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

# Next.js standalone output
COPY --from=build --chown=65532:65532 /app/.next/standalone ./
COPY --from=build --chown=65532:65532 /app/.next/static ./.next/static
COPY --from=build --chown=65532:65532 /app/public ./public

EXPOSE 3000

CMD ["server.js"]
