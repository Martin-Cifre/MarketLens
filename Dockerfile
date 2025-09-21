# ---------- Stage 1: deps ----------
FROM node:20-alpine AS deps
# Paquetes del sistema útiles para bins nativos (ej. sharp)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos manifests (el * permite que no falle si no hay lock)
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Si hay package-lock => npm ci; si no => npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi


# ---------- Stage 2: build ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Traemos node_modules ya resueltos
COPY --from=deps /app/node_modules ./node_modules
# Copiamos el código fuente completo para construir
COPY . .

# Build (tu script `build` ya corre prisma generate + next build)
RUN npm run build


# ---------- Stage 3: runtime ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production

# Solo dependencias de producción
COPY package.json package-lock.json* ./
COPY --from=builder /app/prisma ./prisma
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copiamos artefactos y código necesario en runtime
# - .next y public para servir el frontend
# - server.ts y lo que importe (src/, prisma/, configs)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/db ./db
# (opcional, por si tu server/next los requiere)
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/.env.example ./.env.example

EXPOSE 3000
CMD ["npm", "start"]
