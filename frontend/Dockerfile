# Dockerfile del frontend (React + Vite + TypeScript).
# Build multi-etapa: se compila a archivos estáticos en una etapa y se sirven
# con nginx en la otra (la imagen final no lleva Node ni node_modules).

# ---------------------------------------------------------------- Etapa 1: build
# Alpine es seguro aquí: a diferencia del backend (bcrypt compila un binding
# nativo), el frontend no tiene dependencias nativas, así que no hay riesgo
# de compatibilidad glibc/musl.
FROM node:25-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY index.html vite.config.ts ./
COPY public ./public
COPY src ./src
RUN npm run build

# ---------------------------------------------------------------- Etapa 2: runtime
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
