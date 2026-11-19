# Archivo de instrucciones — Robin

Con este archivo se levanta el **producto funcional completo** (frontend + backend + base de datos), usando Docker. Para el detalle completo paso a paso, ver [manual de uso e instalación](docs/manual-uso-instalacion.md).

## Video promocional

[ESPACIO PARA EL LINK DEL VIDEO PROMOCIONAL]

## Requisitos

- Docker Desktop (probado con Docker 29.6.2 y Docker Compose v5.3.1; cualquier versión reciente de Compose v2 debería servir).
- Nada más: Node, MongoDB y npm quedan dentro de los contenedores.

## Pasos

```bash
git clone https://github.com/CalquinL/Robin.git
cd Robin
cp .env.example .env
docker compose up --build -d
docker compose run --rm db-init    # ADVERTENCIA: borra la base y la recrea desde cero
```

La app queda en `http://localhost:8080`. `docker compose run --rm db-init` solo hace falta correrlo una vez (o cuando se quiera resetear la base a los datos de prueba); no se levanta solo con `docker compose up`.

## Datos de prueba

`docker compose run --rm db-init` deja la plataforma poblada desde el primer arranque: publicaciones aprobadas y pendientes, necesidades en distintos estados, reservas y notificaciones.

| Correo | Contraseña | Rol | Para probar |
|---|---|---|---|
| `admin@robin.com` | `admin123` | admin | Moderar publicaciones pendientes |
| `beneficiario@robin.com` | `beneficiario123` | beneficiario | Dueño de las publicaciones de prueba; ver reservas y notificaciones |
| `donante@robin.com` | `donante123` | donante | Ver "Mis donaciones"; reservar, cancelar o confirmar entrega |

## Fallas frecuentes

| Falla | Causa | Solución |
|---|---|---|
| Error de conexión a la API de Docker al correr `docker compose up` | Docker Desktop no está corriendo | Abrirlo y esperar a que termine de iniciar antes de reintentar |
| Las imágenes de las publicaciones dan `404` | La carpeta `uploads/publications/` del host está vacía (se monta directo, no se copia nada dentro de la imagen) | Confirmar que las imágenes de prueba estén ahí antes de levantar los contenedores |
| El backend no logra conectarse a Mongo justo al arrancar | El contenedor de Mongo todavía no terminó de inicializar | No debería pasar (`backend` espera a que `mongo` esté healthy); si ocurre, revisar `docker compose logs mongo` |
