# Dockerfile del backend (Node + Express + TypeScript).
# Build multi-etapa: compila TS a JS en una etapa, corre solo el resultado en la otra
# (la imagen final no lleva el compilador de TypeScript ni las devDependencies).

# ---------------------------------------------------------------- Etapa 1: build
FROM node:25-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# El cache mount guarda el store de npm entre builds sucesivos (no queda dentro
# de la imagen, así que no afecta el peso final, solo acelera los rebuilds).
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
COPY db ./db
RUN npm run build

# Esta etapa ("build") es la que usa docker-compose para el servicio db-init:
# a diferencia de "runtime", todavía tiene las devDependencies (incluye tsx,
# necesario para correr db/init.ts, que no entra a la compilación de tsc).

# ---------------------------------------------------------------- Etapa 2: runtime
FROM node:25-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
# Esta etapa instala su propio node_modules (no se copia el de "build"), por lo
# que el cache de npm sí quedaría dentro de la imagen final si no se limpia en
# la misma capa que el install.
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=build /app/dist ./dist

# El puerto real lo define PORT (.env); 3900 es el valor de .env.example.
EXPOSE 3900

CMD ["node", "dist/server.js"]
