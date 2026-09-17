FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NITRO_PRESET=node-server
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV NITRO_HOST=0.0.0.0

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

CMD ["node", ".output/server/index.mjs"]
