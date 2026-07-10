FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

RUN npm ci

RUN npx prisma generate --schema=prisma/schema.prisma

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

FROM node:24-alpine
WORKDIR /app

RUN apk add --no-cache ca-certificates && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/tsconfig.json ./

RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && npx ts-node prisma/seed.ts && node dist/index.js"]
