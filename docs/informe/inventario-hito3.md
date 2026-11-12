# Inventario Hito 3 — Robin

Generado por inspección directa del repositorio (código, no documentación previa). Fecha: 2026-11-11. Este archivo es insumo de la Fase 0 del flujo de trabajo definido en `CLAUDE.md`; no es parte del informe final.

## 1. Árbol de carpetas por capa

### Backend (`src/`)

```
src/
├── server.ts
├── app.ts
├── routes/            user.ts · publication.ts · reservation.ts · notification.ts
├── middlewares/       auth.ts · roles.ts · upload.ts · errorHandler.ts
├── controllers/       user.ts · publication.ts · reservation.ts · notification.ts
├── services/          auth.service.ts · user.service.ts · publication.service.ts ·
│                      reservation.service.ts · notification.service.ts · jwt.ts
├── repositories/      user.repository.ts · publication.repository.ts ·
│                      reservation.repository.ts · notification.repository.ts
├── models/            user.ts · publication.ts · reservation.ts · notification.ts
├── types/             domain.ts · express.d.ts
├── utils/             AppError.ts · response.ts · serializePublication.ts · escapeRegex.ts
└── database/          connection.ts
```

- `src/config/` y `src/validators/` **no existen** (se probó que estaban vacías y sin referencias; se eliminaron del disco).
- `src/helpers/validate.ts` (heredado de la base de red social) ya no existe: estaba sin uso, se confirmó con `grep -rn "helpers" src` sin resultados, y se borró.
- Hay exactamente un service + un repository + un controller por recurso (`user`, `publication`, `reservation`, `notification`), como pide la sección 3 de `CLAUDE.md`. `auth` no tiene repository propio (usa `user.repository.ts`).

### Frontend (`frontend/src/`)

```
frontend/src/
├── pages/        LoginPage · RegisterPage · FeedPage · PublicationDetailPage ·
│                 MyDonationsPage · CreatePublicationPage · AdminReviewPage ·
│                 NotificationsPage · ProfilePage · NotFoundPage
├── components/   Header · Navbar · Layout · Loading · EmptyState · ErrorMessage ·
│                 ProtectedRoute · RoleRoute · PublicationCard · AuthLayout ·
│                 ChangePasswordForm
├── hooks/        useAuth · usePublications · usePublication · useReservations ·
│                 useNotifications · useProfile · useProfilePublications ·
│                 useSavedPublications · useSavedPublicationsList
├── services/     apiClient · auth · users · publications · reservations ·
│                 notifications · savedPublications
├── context/      AuthContext/AuthProvider · SavedPublicationsContext/Provider
├── types/        domain · api · user · publication · reservation · notification
├── utils/        errorMessages · formatRelativeTime · jwt (decode + expiración, solo lectura)
└── styles/       global.css · shared.css (+ un .css por página/componente)
```

- `frontend/mockup/` **no existe** en el repo actual: el Hito 1 se adaptó pantalla por pantalla directamente en `src/`, no quedó una copia de solo lectura del mockup estático. `docs/mockup-inventario.md` sí existe y documenta ese mockup original.
- No hay carpeta `frontend/public/` con contenido propio más allá de lo que generó Vite.

## 2. Endpoints reales (24, verificado con `grep` sobre `src/routes/*.ts`)

**Users** (`/api/v1/users`, 10 rutas)
| Verbo | Ruta | Acceso | Controller |
|---|---|---|---|
| POST | `/register` | Público | `UserController.register` |
| POST | `/login` | Público | `UserController.login` |
| GET | `/profile/:id` | Autenticado | `UserController.profile` |
| GET | `/list` | Autenticado | `UserController.list` |
| PATCH | `/update` | Autenticado | `UserController.update` |
| POST | `/upload` | Autenticado | `UserController.upload` |
| GET | `/avatar/:file` | Público | `UserController.avatar` |
| GET | `/saved-publications` | Autenticado | `UserController.listSaved` |
| POST | `/saved-publications` | Autenticado | `UserController.savePublication` |
| DELETE | `/saved-publications/:publicationId` | Autenticado | `UserController.unsavePublication` |

**Publications** (`/api/v1/publications`, 8 rutas; la última se monta además bajo `/api/v1/users/:id/publications`)
| Verbo | Ruta | Acceso | Controller |
|---|---|---|---|
| POST | `/` | beneficiario | `PublicationController.create` |
| GET | `/` | Autenticado | `PublicationController.listApproved` |
| GET | `/:id` | Autenticado | `PublicationController.getById` |
| PATCH | `/:id` | Dueño | `PublicationController.update` |
| DELETE | `/:id` | Dueño | `PublicationController.remove` |
| PATCH | `/:id/status` | admin | `PublicationController.moderate` |
| PUT | `/:id/image` | Dueño | `PublicationController.uploadImage` |
| GET | `/users/:id/publications` | Autenticado | `PublicationController.listByUser` |

**Reservations** (`/api/v1/reservations`, 4 rutas)
| Verbo | Ruta | Acceso | Controller |
|---|---|---|---|
| POST | `/` | donante | `ReservationController.create` |
| GET | `/` | Autenticado | `ReservationController.list` |
| GET | `/:id` | Participante o admin | `ReservationController.getById` |
| PATCH | `/:id/status` | Participante | `ReservationController.updateStatus` |

**Notifications** (`/api/v1/notifications`, 2 rutas)
| Verbo | Ruta | Acceso | Controller |
|---|---|---|---|
| GET | `/` | Autenticado | `NotificationController.list` |
| PATCH | `/:id` | Dueño | `NotificationController.markRead` |

El detalle completo de parámetros, cuerpos y códigos de error por endpoint ya quedó documentado en `docs/informe-Hito2.md` (sección "Diseño de API REST") tras la revisión de esta sesión; para el Hito 3 ese capítulo se resume y solo se marca lo que cambió.

**Discrepancia encontrada:** `README.md` (raíz) describe un contrato viejo (`/auth/register`, `/users/me`, sin notificaciones ni guardados, `.env.example` con valores de hace dos hitos). `docs/endpoints.md` también parece anterior a Notificaciones/Guardados/búsqueda. Ninguno de los dos coincide hoy con el código. Pendiente decidir en qué documento se consolida la fuente de verdad.

## 3. Pantallas reales del frontend

| Página | Ruta | Acceso | Endpoints que llama |
|---|---|---|---|
| `LoginPage` | `/login` | Público | `POST /users/login` |
| `RegisterPage` | `/register` | Público | `POST /users/register` |
| `FeedPage` | `/` | Autenticado | `GET /publications` (con `search`), `GET /notifications` |
| `PublicationDetailPage` | `/publications/:id` | Autenticado | `GET /publications/:id`, `POST /reservations` |
| `CreatePublicationPage` | `/publications/new` | solo `beneficiario` (`RoleRoute`) | `POST /publications` |
| `MyDonationsPage` | `/my-donations` | `donante` y `beneficiario` (`RoleRoute`) | `GET /reservations`, `PATCH /reservations/:id/status` |
| `AdminReviewPage` | `/admin/review` | solo `admin` (`RoleRoute`) | `GET /publications?status=pendiente`, `PATCH /publications/:id/status` |
| `NotificationsPage` | `/notifications` | Autenticado | `GET /notifications`, `PATCH /notifications/:id` |
| `ProfilePage` | `/profile` | Autenticado | `GET /users/profile/:id`, `PATCH /users/update`, `POST /users/upload`, `GET /users/saved-publications`, `GET /users/:id/publications`, `GET /publications?status=` (admin), `GET /reservations?status=entregado` (donante) |
| `NotFoundPage` | `*` | — | ninguno (ruta no encontrada) |

Todas excepto Login/Register están dentro de `ProtectedRoute` (exige sesión) y comparten `Layout` (Header + Navbar + asides).

## 4. Variables de entorno

**Backend — `.env.example` (raíz)**
```
PORT=3900
MONGODB_URI=mongodb://localhost:27017/robin_db
JWT_SECRET=JWT_SECRET
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads/publications
```
`CORS_ORIGIN` se usa realmente en `app.ts` (`cors({ origin: process.env.CORS_ORIGIN })`); `UPLOAD_DIR` figura en el ejemplo pero el código tiene las rutas de subida escritas directo (`uploads/publications/`, `uploads/users/`), no lee esa variable — discrepancia a resolver o documentar.

**Frontend — `frontend/.env.example`**
```
VITE_API_URL=/api/v1
```
En desarrollo, `vite.config.ts` además proxea `/api` y `/uploads` hacia `http://localhost:3900` para evitar problemas de CORS en el navegador durante `npm run dev`.

## 5. Usuarios y datos de prueba

Estado real de la base de datos ahora mismo (consultado directo, sin abrir `.env`): **un solo usuario**, el admin creado por `npm run db:init`:

| Email | Password | Rol | Origen |
|---|---|---|---|
| `admin@robin.com` | `admin123` | `admin` | Hardcodeado en `db/init.ts`, se recrea cada vez que se corre el script |

**No hay ningún beneficiario ni donante de prueba seedeado.** Durante esta sesión se crearon cuentas descartables por `POST /users/register` para probar funcionalidades, pero `db/init.ts` las borra (es un script "desde cero"). Si el manual (sección 6, B3) debe listar "usuarios y datos de prueba" con los tres roles, falta decidir: ¿se amplía `db/init.ts` para que además cree un beneficiario, un donante y una publicación aprobada de ejemplo? Sin eso, probar el flujo principal como donante exige registrarse manualmente antes de poder reservar algo.

## 6. Tests existentes

**No hay pruebas automatizadas en ningún lado del repo.**
- Backend: `"test": "echo \"Error: no test specified\" && exit 1"` en `package.json` — placeholder que falla, no ejecuta nada.
- Frontend: no hay Vitest, Jest ni Testing Library instalados; `frontend/package.json` solo tiene `dev`, `build`, `lint`, `preview`. No existe ningún archivo `*.test.*` ni `*.spec.*` en el repo (confirmado con `find`).
- Toda la verificación hecha hasta ahora fue manual: `curl` contra el backend corriendo y uso real en el navegador contra el frontend corriendo. Esto se reportará así en la sección "Qué se probó y cómo" (no se puede afirmar "tests unitarios" porque no existen).

## 7. Otros hallazgos relevantes para el informe

- **Docker:** no hay `Dockerfile` ni `docker-compose.yml` en el repo. Confirma la sección 8 del `CLAUDE.md` ("Docker no implementado").
- **`docs/` tiene documentos previos que no se tocaron en esta inspección:** `docs/endpoints.md` (243 líneas), `docs/informe-tecnico.md` (262 líneas), `docs/modelo-datos.md` (33 líneas), `docs/persistencia-credenciales.md` (167 líneas), además de `docs/informe-Hito2.md` (el documento LaTeX ya actualizado en esta sesión) y `docs/bitacora.md` (bitácora completa de decisiones). Falta decidir cuáles siguen vigentes y cuáles se reemplazan por el informe final del Hito 3.
- **Script de base de datos:** `db/init.ts` (antes `db/init.js`, estaba roto desde la migración a TypeScript; se corrigió en esta sesión) borra las 4 colecciones, sincroniza índices (`email` y `nick` únicos en `users`, verificado con `db.collection.indexes()`) y crea el admin. No existe ningún script de "datos de prueba" separado del de inicialización.
- **README.md de la raíz** describe el estado del Hito 2 temprano (antes de TypeScript incluso en algunos detalles) y no al proyecto actual; se actualizará como parte del manual (sección 6 del nuevo `CLAUDE.md`).

---

## 8. Decisiones ya resueltas (actualización posterior al inventario)

Las tres preguntas que quedaron abiertas al cerrar la Fase 0 ya se resolvieron:

1. **Datos de prueba:** `db/init.ts` ahora crea, además del admin, un `beneficiario` (`beneficiario@robin.com` / `beneficiario123`), un `donante` (`donante@robin.com` / `donante123`) y una publicación de ese beneficiario ya `aprobada` con dos necesidades `disponible` ("Mochila escolar", "Set de cuadernos y lápices"). Validado en caliente: los tres logins funcionan y `GET /publications` como donante devuelve la publicación de prueba lista para reservar. Documentado en `docs/bitacora.md` y en la sección "Scripts y credenciales" de `docs/informe-Hito2.md`.
2. **Documentos previos:** se actualizaron (no se archivaron) `docs/endpoints.md`, `docs/informe-tecnico.md`, `docs/modelo-datos.md` y `docs/persistencia-credenciales.md` para que coincidan con el código real (rutas de auth bajo `/users`, Notificaciones y Guardados agregados, árbol de `src/` al día, recorrido de la petición de reserva corregido). De paso se encontró y corrigió una afirmación falsa en `persistencia-credenciales.md`: describía índices compuestos que no existen en los esquemas (solo `email`/`nick` tienen índice único); el usuario decidió corregir la documentación y declarar la deuda técnica, sin tocar el código de los modelos.
3. **Plantilla de estilo:** confirmado — el informe final del Hito 3 usa `docs/informe-Hito2.md` como base de estilo y estructura LaTeX.

Con esto, el inventario queda cerrado. Falta que el usuario dé luz verde explícita para pasar a la **Fase 1 (esqueleto del informe final)**.
