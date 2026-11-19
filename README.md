# Robin

Plataforma web de wishlist solidaria: personas naturales publican su historia y una lista de necesidades concretas (bienes, no dinero). Un administrador verifica cada publicación antes de que sea visible, y los donantes reservan y entregan directamente uno de esos bienes, con confirmación manual de la entrega.

Proyecto del curso INGT1003 Arquitectura de Desarrollo Móvil y Web, Universidad Mayor. Producto completo: backend (API REST), frontend (React) y despliegue con Docker.

## Video promocional

[ESPACIO PARA EL LINK DEL VIDEO PROMOCIONAL]

## 🚀 Cómo levantarlo

Con Docker Desktop instalado:

```bash
git clone https://github.com/CalquinL/Robin.git
cd Robin
cp .env.example .env
docker compose up --build -d
docker compose run --rm db-init
```

Abre `http://localhost:8080`. Guía completa, cuentas de prueba y fallas frecuentes: [`docs/archivo-instrucciones.md`](docs/archivo-instrucciones.md) (resumen) o [`docs/manual-uso-instalacion.md`](docs/manual-uso-instalacion.md) (detalle completo).

## 🛠️ Tecnologías

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, TypeScript
- **Frontend:** React, Vite, TypeScript
- **Despliegue:** Docker, docker-compose, nginx

## 📁 Estructura del proyecto

```
src/            # Backend: routes, controllers, services, repositories, models
frontend/src/   # Frontend: pages, components, hooks, services
db/             # Script de inicialización de la base de datos
docs/           # Documentación, manuales e informes
```

## 📚 Documentación

- Interfaz de la API (rutas, parámetros, códigos de estado): [`docs/interfaz-programacion.md`](docs/interfaz-programacion.md)
- Manual de uso e instalación completo: [`docs/manual-uso-instalacion.md`](docs/manual-uso-instalacion.md)
- Informe técnico del Hito 2: [`docs/informe-Hito2.pdf`](docs/informe-Hito2.pdf)
- Informe final del Hito 3: [`docs/informe-Hito3.pdf`](docs/informe-Hito3.pdf)
- Bitácora de decisiones: [`docs/bitacora.md`](docs/bitacora.md)

## 🔐 Autenticación

La API utiliza JWT. Incluye el token en el header de las peticiones protegidas:
`Authorization: Bearer <token>`

## 👤 Autor
Lucas Calquín — Estudiante de Ing. Civil en Computación e Informática, Universidad Mayor
