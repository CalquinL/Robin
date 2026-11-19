# Manual de uso e instalación — Robin

Versión independiente del capítulo de manual del informe final (`docs/informe/informe-final-robin.tex`), para que cualquiera pueda instalar y usar el producto sin abrir el PDF completo. La única forma de instalación soportada es con **Docker**.

## Requisitos

- Docker Desktop (probado con Docker 29.6.2 y Docker Compose v5.3.1; cualquier versión reciente de Compose v2 debería servir).
- Nada más: Node, MongoDB y npm quedan dentro de los contenedores.

## Instalación

```bash
git clone https://github.com/CalquinL/Robin.git
cd Robin
cp .env.example .env
docker compose up --build -d
docker compose run --rm db-init    # ADVERTENCIA: borra la base y la recrea desde cero
```

La app queda en `http://localhost:8080` (nginx sirve el frontend y reenvía `/api` y `/uploads` al backend; no hace falta exponer el puerto del backend aparte). `docker compose run --rm db-init` solo hace falta correrlo una vez (o cuando se quiera resetear la base a los datos de prueba); no se levanta solo con `docker compose up`.

Para bajar los contenedores sin perder los datos: `docker compose down` (sin `-v`; con `-v` sí se borra todo, incluida la base).

**[POR COMPLETAR: esta instalación no se probó todavía en un equipo limpio de verdad — sin Docker Desktop preinstalado, en otra máquina física. Lo que sí se probó en profundidad, en la máquina de desarrollo, es la secuencia completa de comandos contra una base de datos vacía, incluyendo reinicio de los contenedores sin perder datos.]**

### Variables de entorno

**Backend (`.env.example`):**
```
PORT=3900
MONGODB_URI=mongodb://localhost:27017/robin_db
JWT_SECRET=JWT_SECRET
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads/publications
```
`docker-compose.yml` sobrescribe `MONGODB_URI` automáticamente a `mongodb://mongo:27017/robin_db` (el nombre del servicio de Mongo en la red interna) — no hace falta tocar el `.env` para eso. El resto de las variables sí se toman del `.env` tal cual.

**Frontend (`frontend/.env.example`):**
```
VITE_API_URL=/api/v1
```
Este archivo no se usa con Docker: nginx (`frontend/nginx.conf`) reenvía `/api` y `/uploads` al backend dentro de la misma red, así que el valor por defecto (`/api/v1`, ruta relativa) ya funciona sin configurar nada.

## Usuarios y datos de prueba

`docker compose run --rm db-init` crea tres cuentas ficticias y deja la plataforma poblada desde el primer arranque: publicaciones aprobadas con fotos y necesidades en distintos estados (disponible, reservada, entregada), publicaciones pendientes de moderar, reservas y notificaciones ya generadas para los tres roles.

| Correo | Contraseña | Rol | Para probar |
|---|---|---|---|
| `admin@robin.com` | `admin123` | admin | Moderar publicaciones pendientes; ver notificaciones de moderación |
| `beneficiario@robin.com` | `beneficiario123` | beneficiario | Dueño de todas las publicaciones de prueba (aprobadas y pendientes); ver reservas y notificaciones sobre sus necesidades |
| `donante@robin.com` | `donante123` | donante | Ver reservas ya hechas en "Mis donaciones"; reservar una necesidad disponible nueva; cancelar o confirmar entrega |

## Guía de uso del flujo principal

1. Entrar a `http://localhost:8080` e iniciar sesión como `donante@robin.com`.
2. Ver el feed (incluye varias publicaciones aprobadas del beneficiario de prueba, con foto).
3. Abrir el detalle de una publicación con una necesidad `disponible`.
4. Reservarla.
5. Ir a "Mis donaciones" y verla ahí junto con las reservas que ya trae el seed.
6. Recargar la página: la reserva sigue apareciendo (el token persiste en `localStorage`).

Para probar moderación: iniciar sesión como `admin@robin.com` y entrar a "Moderar" — ya hay publicaciones pendientes del seed para aprobar o rechazar.

## Fallas frecuentes

| Falla | Causa | Solución |
|---|---|---|
| `error during connect... docker API at npipe://./pipe/docker_engine` al correr `docker build`/`docker compose up` | Docker Desktop no está corriendo | Abrir Docker Desktop y esperar a que termine de iniciar antes de reintentar |
| El backend no logra conectarse a Mongo justo al arrancar el stack | El contenedor de Mongo todavía no terminó de inicializar | No debería pasar: `docker-compose.yml` ya hace que `backend` espere a que `mongo` esté `healthy` antes de arrancar. Si igual ocurre, revisar `docker compose logs mongo` |
| Las imágenes de las publicaciones dan `404` a través de `http://localhost:8080/uploads/...` | La carpeta `uploads/publications/` del host no existe o está vacía (el `docker-compose.yml` la monta directo, no copia nada dentro de la imagen) | Confirmar que las imágenes de prueba estén en `uploads/publications/` en el host antes de levantar los contenedores |

## Referencias

- Tabla completa de endpoints: [interfaz-programacion.md](/docs/interfaz-programacion.md).
- Modelo de datos: [modelo_de_datos](/db/Modelo_de_datos.png).
