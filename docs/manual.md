# Manual de uso e instalación — Robin

Versión independiente del capítulo 6 del informe final (`docs/informe/informe-final-robin.tex`), para que cualquiera pueda instalar y usar el producto sin abrir el PDF completo.

## Requisitos

- Node.js ([POR COMPLETAR: confirmar versión exacta usada en desarrollo, `node -v`]).
- MongoDB corriendo en `localhost:27017`. Se levanta a mano (no hay contenedor todavía).
- npm.

## Instalación

### Backend

```bash
npm install
cp .env.example .env
npm run db:init    # ADVERTENCIA: borra la base y la recrea desde cero
npm run dev
```

El servidor queda en `http://localhost:3900`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

El frontend queda en `http://localhost:5173` (con proxy automático de `/api` y `/uploads` hacia el backend).

**[POR COMPLETAR: esta instalación no se probó en un equipo limpio — sin Node ni MongoDB preinstalados. Antes de entregar, probarla en una máquina aparte o declarar explícitamente que no se probó, como exige la sección 6 del `CLAUDE.md`.]**

## Variables de entorno

**Backend (`.env.example`):**
```
PORT=3900
MONGODB_URI=mongodb://localhost:27017/robin_db
JWT_SECRET=JWT_SECRET
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads/publications
```

**Frontend (`frontend/.env.example`):**
```
VITE_API_URL=/api/v1
```

## Usuarios y datos de prueba

`npm run db:init` crea tres cuentas ficticias:

| Correo | Contraseña | Rol | Para probar |
|---|---|---|---|
| `admin@robin.com` | `admin123` | admin | Moderar publicaciones pendientes |
| `beneficiario@robin.com` | `beneficiario123` | beneficiario | Crear/editar publicaciones; ya tiene una aprobada con dos necesidades disponibles |
| `donante@robin.com` | `donante123` | donante | Reservar, cancelar, confirmar entrega |

## Guía de uso del flujo principal

1. Entrar a `http://localhost:5173` e iniciar sesión como `donante@robin.com`.
2. Ver el feed (incluye la publicación de prueba del beneficiario).
3. Abrir el detalle de la publicación.
4. Reservar una de las dos necesidades disponibles.
5. Ir a "Mis donaciones" y verla ahí.
6. Recargar la página: la reserva sigue apareciendo (el token persiste en `localStorage`).

Para probar moderación: iniciar sesión como `admin@robin.com`, crear una publicación nueva con `beneficiario@robin.com` (nace `pendiente`) y aprobarla o rechazarla desde "Moderar".

## Fallas frecuentes

| Falla | Causa | Solución |
|---|---|---|
| `MongooseServerSelectionError: ECONNREFUSED` al arrancar el backend | MongoDB no está corriendo | Levantar `mongod` antes de `npm run dev` |
| El backend no arranca en el puerto 3900 | Otro proceso ya está usando ese puerto (otra instancia de `npm run dev`) | Encontrar y detener el proceso anterior |
| El frontend no recibe respuesta de la API | El proxy de `vite.config.ts` apunta a `http://localhost:3900`; si el backend corre en otro puerto, el proxy queda roto | Ajustar `vite.config.ts` o levantar el backend en el puerto esperado |

## Referencias

- Tabla completa de endpoints: `docs/endpoints.md`.
- Modelo de datos: `docs/modelo-datos.md`.
- Bitácora de decisiones: `docs/bitacora.md`.
