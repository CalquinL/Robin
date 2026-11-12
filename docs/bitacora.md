# Bitácora de decisiones — Frontend (Hito 3)

## 2026-11-09 — El contrato real de la API difiere de la tabla de `CLAUDE.md` (sección 7)

**Motivo:** antes de escribir `apiClient` y los servicios, se revisó el código fuente del backend (`src/app.ts`, `src/routes/*.ts`, controladores) en vez de guiarse solo por `CLAUDE.md` o `docs/endpoints.md`, porque el backend tiene cambios sin commitear y ambos documentos están desactualizados.

**Diferencias encontradas (fuente: código, no documentación):**
1. **No existe el prefijo `/auth`.** Registro y login viven bajo `/users`: `POST /api/v1/users/register` y `POST /api/v1/users/login` (no `/api/v1/auth/...`).
2. **No existe `GET /users/me` ni `GET /users/{id}` para ver el perfil de otra persona.** Existe `GET /users/profile/:id`, pero el controlador hace `req.user?.id || req.params.id`: como la ruta exige token, siempre devuelve el perfil del usuario autenticado y **ignora** el `:id` de la URL. No hay forma de ver el perfil público de otro usuario con el backend actual.
3. **No existe `PATCH /users/me`.** Existe `PATCH /users/update`, que también ignora cualquier id y actualiza siempre al usuario autenticado (mismo comportamiento que "mi perfil", distinto nombre de ruta).
4. **Notificaciones no tienen ningún endpoint HTTP.** Existen el modelo (`src/models/notification.ts`) y un servicio interno (`src/services/notification.service.ts`) que las crea como efecto secundario de otras acciones (reservar, moderar, etc.), pero no hay `GET /notifications` ni `PATCH /notifications/{id}` expuestos. Los valores reales de `type` sí están definidos en `src/types/domain.ts`: `"confirmación" | "alerta pendiente" | "conflicto"`.
5. Publicaciones y reservas sí coinciden con la tabla de `CLAUDE.md` en rutas y verbos.

**Decisión (confirmada por el usuario el 2026-11-09):** construir `apiClient` y los servicios del frontend contra las rutas **reales** del código backend, no contra la tabla de `CLAUDE.md`. Se actualizará `CLAUDE.md` más adelante si el equipo decide alinear el backend al documento en vez de al revés.

**Qué queda bloqueado:**
- `NotificationsPage` (T10): no se puede construir contra datos reales hasta que el backend expone endpoints de notificaciones. Se retoma en su momento.
- Ver el perfil público de otro usuario (por ejemplo, el beneficiario de una publicación): no es posible con el backend actual. No bloquea el flujo principal (T0–T7), que no lo necesita.

**Cómo se aplica:** `src/services/auth.ts` llama a `/users/register`, `/users/login` y `/users/profile/:id` (pasando el propio id, aunque el backend lo ignore, por si se corrige en el futuro). El resto de los servicios (`publications`, `reservations`) se construirán respetando las rutas confirmadas en `src/routes/publication.ts` y `src/routes/reservation.ts`.

## 2026-11-09 — Puerto real del backend

El `.env.example` del backend fija `PORT=3900`, no `3000`. Se corrigió el proxy de Vite (`frontend/vite.config.ts`) que se había configurado con el puerto equivocado en la tarea T0.

## 2026-11-09 — Cambio en el backend: el admin puede listar publicaciones `pendiente`

**Motivo:** al retomar `AdminReviewPage`, se encontró que `GET /publications` tenía el filtro de estado fijo en el repositorio (`{ status: "aprobada" }`, sin forma de cambiarlo por parámetro). No existía ningún endpoint para que el admin obtuviera la lista de publicaciones `pendiente` que necesita moderar.

**Cambio aplicado (aprobado por el usuario):**
- `src/repositories/publication.repository.ts`: `findApproved(options)` → `findByStatus(status, options)` (recibe el estado en vez de tenerlo fijo).
- `src/services/publication.service.ts`: `listApprovedPublications(options)` → `listPublications(options, status = "aprobada")`.
- `src/controllers/publication.ts` (`listApproved`, mismo nombre y misma ruta — no se tocó `routes/publication.ts` ni `app.ts`): si `req.user.role === "admin"` y llega `?status=` con un valor válido, se usa ese estado; para cualquier otro rol se ignora el parámetro y se mantiene el comportamiento actual (siempre `aprobada`).

Es un cambio compatible según la sección 4 de `CLAUDE.md` (parámetro opcional, misma ruta, mismo verbo): el contrato público (`GET /publications` sin rol admin) no cambia.

**Validado en caliente contra Mongo real:** se creó una publicación `pendiente`, se confirmó que un `donante` con `?status=pendiente` sigue viendo solo `aprobada` (el parámetro se ignora), que un `admin` sí ve la pendiente, que `PATCH /publications/{id}/status` la aprueba y desaparece de la lista de pendientes, y que volver a moderarla da `409 INVALID_STATE_TRANSITION` como espera la sección 8.

## 2026-11-09 — Corrección de `tsconfig.json` del backend (no relacionada con el cambio anterior)

`npm run typecheck` fallaba con `Option 'moduleResolution=node10' has been removed`: el proyecto tiene `typescript@7.0.2` instalado, que eliminó la resolución `node10` (alias de `"node"`). Se cambió `moduleResolution` a `"node16"`, lo que a su vez exige que `module` sea `"Node16"` (antes `"CommonJS"`) — compatible porque `package.json` ya declara `"type": "commonjs"`, así que la salida compilada sigue siendo CommonJS normal. Se quitó `"ignoreDeprecations": "6.0"`, que ya no aplica (la opción no está deprecada, fue eliminada). Verificado: `npm run typecheck` y `npm run build` sin errores, y el `dist/app.js` generado usa `require()` normal.

Se agregó `dist/` a `.gitignore` en la raíz del proyecto (ya lo pedía la sección 16.6 de `CLAUDE.md`, pero faltaba).

## 2026-11-09 — Vulnerabilidad: cualquiera podía autoasignarse `admin` en el registro

**Hallazgo:** al probar `GET /publications?status=pendiente` con un usuario admin de prueba, se encontró que `POST /users/register` aceptaba `{"role":"admin"}` sin ninguna validación — `UserController.register` y `AuthService.register` solo verificaban que el campo no estuviera vacío, nunca que fuera uno de los roles permitidos. Esto contradice directamente la sección 5 de `CLAUDE.md` ("El rol admin NO se puede asignar en el registro") y el principio de mínimo privilegio de la sección 18.

**Corregido (aprobado por el usuario):**
- `src/types/domain.ts`: nuevo `REGISTERABLE_ROLES = ["beneficiario", "donante"]`.
- `src/services/auth.service.ts` (`register`): rechaza con `400 VALIDATION_ERROR` cualquier `role` fuera de esa lista, antes de tocar la base de datos.

**Validado en caliente:** `POST /users/register` con `role: "admin"` → `400 VALIDATION_ERROR`. Registro normal con `beneficiario`/`donante` sigue funcionando (sin regresión). El admin de prueba creado antes del fix (`admintest1@example.com`) queda en la base de datos local de desarrollo — no se eliminó porque es solo data de prueba, pero queda anotado por transparencia.

## 2026-11-09 — Cambios en el backend para el Feed: autor y servir la imagen de la publicación

**Motivo:** al construir el Feed (T5) se confirmó en el código (no en la documentación) que el feed no tenía forma de mostrar el nombre del beneficiario ni la imagen de la publicación.

**1. Autor (aprobado por el usuario):**
- `user_id` nunca se poblaba en las consultas (`Publication.paginate`/`findById` sin `.populate`), así que siempre llegaba como ObjectId plano — y de todas formas `GET /users/profile/:id` solo devuelve el perfil de quien hace la petición, nunca el de un tercero.
- Se agregó `findByIdWithAuthor` y se le agregó `populate` a `findByStatus` en `publication.repository.ts` — **ambos nuevos/aislados**, `findById` (el que usan `updatePublication`/`deletePublication`/`moderatePublication` para chequear propiedad) queda intacto para no romper esas comparaciones (`user_id.toString() !== userId` deja de funcionar si `user_id` viene poblado).
- `publication.service.ts`: nuevo `getPublicationWithAuthor` (usa el repositorio poblado), separado de `getPublicationById` (el de siempre, para lógica de negocio).
- `publication.controller.ts`: un solo `serializePublication` reemplaza los 6 bloques de armado de respuesta repetidos; detecta si `user_id` viene poblado y, si es así, agrega un campo nuevo `author: { name, nick, image }` **sin tocar `user_id`** (sigue siendo el id como string — cambio compatible, no se rompe nada que ya consuma la API).
- Aplica en `GET /publications` (listado) y `GET /publications/{id}` (detalle). No aplica en crear/editar/moderar/subir imagen (esos devuelven el documento recién escrito, sin poblar, tal como antes).

**2. Imagen de la publicación (aprobado por el usuario):**
- `PUT /publications/{id}/image` ya guardaba el archivo en `uploads/publications/`, pero no había ninguna ruta para servirlo de vuelta.
- `src/app.ts`: `app.use("/uploads/publications", express.static(...))`. Es tan público como ya es el feed que la muestra (no hay control de acceso en el diseño actual, igual que las imágenes de avatar).

**Validado en caliente:** `GET /publications` y `GET /publications/{id}` devuelven `author: { name, nick, image }` manteniendo `user_id` como string; la imagen responde `200` con `content-type: image/jpeg` en `http://localhost:3900/uploads/publications/{file}`; y se confirmó que editar/eliminar sigue chequeando la propiedad correctamente (dueño → `200`, no dueño → `403`) — el cambio no afectó esa lógica porque usa `findById` (sin poblar), no `findByIdWithAuthor`.

## 2026-11-09 — Frontend: Feed (T5)

- `types/publication.ts`: nuevo `PublicationAuthor` y campo `author?` en `Publication`.
- `frontend/vite.config.ts`: proxy `/uploads` además de `/api`, para que las imágenes de publicación carguen en desarrollo.
- `hooks/usePublications.ts`: hook genérico `{ data, meta, loading, error, reload }` con `page`, `limit` y `status` opcional. Reemplaza a `usePendingPublications` (ahora `AdminReviewPage` lo usa con `status: "pendiente"`) — mismo patrón, sin duplicar código.
- `utils/formatRelativeTime.ts`: reimplementación en React del comportamiento del mockup (`main.js`), tal como se anotó en el inventario.
- `components/PublicationCard.tsx`: tarjeta de publicación con datos reales (autor, texto, imagen real si existe o el marcador de posición si no, fecha relativa), enlaza al detalle.
- `pages/FeedPage.tsx`: los tres estados (carga/vacío/error), paginación simple con los botones Anterior/Siguiente usando `meta.page`/`meta.pages`, tarjeta de usuario en el aside izquierdo, y el acceso a "Crear publicación" (aside derecho e input superior) visible solo para `beneficiario`.

Verificado: `npm run build`/`lint` del frontend sin errores ni advertencias; feed probado contra la API real con dos publicaciones (una con imagen, otra sin).

## 2026-11-09 — Backend: `POST /reservations` no respetaba el rol `donante`

**Hallazgo:** al revisar `src/routes/reservation.ts` para construir el detalle/reserva (T6), `router.post("/", auth, ReservationController.create)` solo tenía `auth`, sin `roles(["donante"])` — cualquier rol autenticado (incluido `beneficiario` o `admin`) podía crear una reserva. El middleware `roles` ya existe y se usa igual en `publication.ts`.

**Corregido (aprobado por el usuario):** se agregó `roles(["donante"])` a esa ruta. `npm run typecheck` sin errores. Pendiente de probar en caliente (Mongo no estaba corriendo al momento de verificar).

**Anotado sin cambio:** `PublicationRepository.atomicReserveItem` no distingue "publicación no existe/no aprobada" de "ítem no disponible" — ambos casos devuelven `409 NEED_NOT_AVAILABLE`, nunca el `404` que describe la sección 8 de `CLAUDE.md`. No se corrige porque en el flujo real el botón de reservar siempre parte de una publicación ya cargada en pantalla (el 404 "de verdad" no es alcanzable desde la UI); solo puede darse una condición de carrera, que sí cae correctamente en 409.

## 2026-11-09 — Frontend: Detalle de publicación y reserva (T6)

- `services/reservations.ts`: `create(publicationId, itemId)` → `POST /reservations`.
- `services/publications.ts`: nuevo `getById`.
- `hooks/usePublication.ts`: igual que `usePublications` pero para un solo ítem.
- `styles/shared.css`: se agregaron `.badge`/`.badge-green`/`.badge-orange`, `.progress-bar`/`.progress-fill`/`.progress-text` (confirmado que T7 también los va a usar); se movieron `.story-image`/`.story-image-photo` desde `PublicationCard.css` a `shared.css` porque ahora las usan dos componentes distintos (la tarjeta del feed y el detalle).
- `pages/PublicationDetailPage.tsx`: barra de progreso, lista de necesidades con badge según estado real (`disponible`/`reservado`/`entregado`), botón "Reservar" solo visible para `donante` y solo en ítems `disponible` (el backend ya lo exige también, es defensa en profundidad). Maneja el `409` mostrando el mensaje ya mapeado en `errorMessages.ts` y recargando la publicación para reflejar el estado real.

**Validado en caliente (2026-11-10):** `beneficiario` intentando reservar → `403`; `donante` reserva → `201` (forma de respuesta coincide con el tipo `Reservation` del frontend, sin `donor_id`); reservar el mismo ítem de nuevo → `409 NEED_NOT_AVAILABLE`; el detalle de la publicación refleja el ítem en `reservado`. `npm run build`/`lint` del frontend y `npm run typecheck` del backend sin errores.

## 2026-11-10 — Backend: `GET /reservations` no servía para la vista del beneficiario

**Hallazgo:** al planear "Mis Donaciones" (T7), se confirmó en el código que `listUserReservations` solo llamaba a `ReservationRepository.findByDonor(userId, ...)` — es decir, `GET /reservations` siempre filtraba por `donor_id`. Un `beneficiario` nunca es `donor_id` de nada, así que esa ruta le devolvía siempre una lista vacía, sin forma de ver (ni confirmar) las reservas de sus propias publicaciones.

**Cambio aplicado (aprobado por el usuario), misma ruta `GET /reservations`:**
- `publication.repository.ts`: nuevo `findIdsByOwner(userId)` (ids de las publicaciones del usuario).
- `reservation.repository.ts`: nuevo `findByPublicationIds(ids, options)`.
- `reservation.service.ts` (`listUserReservations`): ahora recibe también el `role`; si es `beneficiario`, busca las reservas de sus publicaciones; para cualquier otro rol, el comportamiento es idéntico al de antes (por `donor_id`).
- `reservation.controller.ts` (`list`): pasa `req.user!.role` al service.

**Validado en caliente:** `donante` ve su propia reserva; `beneficiario` ve la reserva de su publicación (mismo registro, visto desde el otro lado); un `donante`/`beneficiario` sin reservas/publicaciones relacionadas ven `[]`. También se probó el resto del ciclo que usará T7: cancelar (solo el donante; cancelar siendo el beneficiario → `403`, correcto según la sección 8) devuelve el ítem a `disponible`; confirmar entrega (cualquiera de las dos partes, se probó desde el lado del beneficiario) deja el ítem en `entregado`; cancelar una reserva ya entregada → `409 INVALID_STATE_TRANSITION`.

## 2026-11-10 — Backend: `GET /reservations?status=` no estaba implementado

**Hallazgo:** `CLAUDE.md` sección 7 y `docs/endpoints.md` ya documentaban `status` como parámetro opcional de `GET /reservations`, pero el controller nunca leía `req.query.status` — no filtraba nada. No era una diferencia de documentación nueva, era una funcionalidad documentada y nunca implementada.

**Cambio aplicado (aprobado por el usuario), misma ruta:**
- `reservation.repository.ts` (`findByDonor`, `findByPublicationIds`): tercer parámetro opcional `status`, se agrega al filtro de Mongo solo si viene.
- `reservation.service.ts` (`listUserReservations`): nuevo parámetro `status`, se pasa al repositorio correspondiente según el rol.
- `reservation.controller.ts` (`list`): valida `req.query.status` contra `RESERVATION_STATUS` antes de pasarlo (si no es válido, se ignora y devuelve todas, igual que antes).

**Validado en caliente:** sin `status` devuelve todas; `?status=entregado` y `?status=cancelada` devuelven solo esas; `?status=reservado` da `[]` cuando no hay ninguna en ese estado — confirma que el filtro realmente se aplica en la consulta, no es un falso positivo.

## 2026-11-10 — Backend: `GET /reservations` (lista y detalle) ahora trae donante, beneficiario y nombre de la necesidad

**Motivo:** para que la vista del beneficiario en "Mis Donaciones" (T7) pueda mostrar el nombre del donante, el nombre de la necesidad y el contexto de la publicación, sin que el frontend tenga que hacer una petición extra por cada reserva (`GET /publications/{id}`).

**Cambio aplicado (aprobado por el usuario), mismas rutas (`GET /reservations`, `GET /reservations/{id}`):**
- `reservation.repository.ts`: populate anidado (`donor_id` con `name nick image`; `publication_id` con `text necesidades user_id`, y dentro de ese, `user_id` también poblado con `name nick image`) en `findByDonor`, `findByPublicationIds`, y un nuevo `findByIdWithDetails`.
- `reservation.service.ts` (`getReservationById`): la autorización sigue usando `findById` sin poblar (`donor_id.toString()`/`publication.user_id.toString()`, igual que antes); solo al final, ya autorizado, se pide la versión con detalles para mostrar.
- `reservation.controller.ts`: nuevo `serializeReservation` (mismo patrón que `serializePublication`) agrega campos nuevos — `donor: { name, nick, image }`, `beneficiary: { name, nick, image }`, `need_name`, `publication_text` — **sin tocar** `donor_id`/`publication_id` (siguen siendo el id como string). Aplica en `list` y `getById`; no en `create`/`updateStatus` (esos devuelven el documento recién escrito, sin poblar, y el frontend va a recargar la lista después de esas acciones).

**Validado en caliente:** la lista trae `donor`/`beneficiary`/`need_name`/`publication_text` tanto para el donante como para el beneficiario (mismo registro, visto desde los dos lados); `getById` igual; se confirmó que la autorización (403 para quien no participa) sigue funcionando sin cambios.

## 2026-11-10 — Frontend: Mis Donaciones (T7)

- `types/reservation.ts`: nuevo `ReservationPerson` y campos `donor?`/`beneficiary?`/`need_name?`/`publication_text?`.
- `services/reservations.ts`: `list({ status, page, limit })`, `updateStatus(id, status)`.
- `hooks/useReservations.ts`: mismo patrón que `usePublications`.
- `pages/MyDonationsPage.tsx`:
  - **Donante**: tabs Pendientes/Entregados/Todos (filtran en el servidor), agrupado por beneficiario (`reservation.beneficiary`), "Confirmar Entrega"/"Cancelar reserva" solo en `reservado`.
  - **Beneficiario**: lista plana, con el nombre real del donante (`reservation.donor`), solo "Confirmar Entrega" (cancelar es únicamente del donante, según la sección 8).
  - `RoleRoute` restringe `/my-donations` a `donante`/`beneficiario` (el admin no tiene esta pantalla).
- `styles/shared.css`: clases de tabs/agrupación/acciones del mockup (`.donations-tabs`, `.beneficiary-group`, `.btn-confirm`, `.btn-cancel`, etc.) y `.badge-red` nuevo para "Cancelada". Se movió `.view-subtitle` desde `PublicationDetailPage.css` a `shared.css` por reutilizarse en esta página también.

Verificado: `npm run build`/`lint` del frontend sin errores ni advertencias. Los endpoints que usa esta página ya quedaron validados en caliente en las entradas anteriores (listado por rol, filtro de estado, cancelar/confirmar, y ahora el enriquecimiento con `donor`/`beneficiary`/`need_name`).

## 2026-11-10 — Frontend: Crear publicación (T8)

- `types/publication.ts`: nuevo `CreatePublicationBody`.
- `services/publications.ts`: nuevo `create(body)` → `POST /publications`.
- `pages/CreatePublicationPage.tsx`: formulario nuevo (el mockup no tenía esta pantalla, solo un input/botón decorativos) — texto de la historia + lista dinámica de necesidades (agregar/quitar filas, mínimo una con nombre no vacío). Al crear, redirige al feed con un aviso de "pendiente de aprobación".
- `RoleRoute` restringe `/publications/new` a `beneficiario`.
- `styles/shared.css`: `.form-stack`/`.form-field`/`.form-error`/`.form-banner-*` se movieron desde `AuthLayout.css` (eran solo de Login/Register) porque ahora las usa también esta pantalla; se agregó soporte para `textarea` en `.form-field`.

**Validado en caliente:** `beneficiario` crea la publicación → `201`, nace `pendiente`; `donante` intentando crear → `403`; sin necesidades → `400`. `npm run build`/`lint` del frontend sin errores.

## 2026-11-10 — Frontend: T9 (Verificación del admin) cerrada

`AdminReviewPage` ya estaba construida (se adelantó junto con el fix de `?status=` del backend). Al retomar T9 se mejoró la tarjeta: antes solo mostraba el texto y la cantidad de necesidades; ahora muestra el nombre del beneficiario (`author.name`), el texto completo, el nombre de cada necesidad y hace cuánto está pendiente (`formatRelativeTime`) — necesario para que el admin pueda decidir con información real, no solo un conteo.

Revisada contra la "Definición de terminado" de la sección 13: datos reales, tres estados, errores traducidos, accesible solo para `admin` (nav + `RoleRoute`), sin lógica de negocio en el componente, build/lint en verde. Validado en caliente de nuevo tras el cambio: la lista trae todo lo que la tarjeta necesita; aprobar funciona y la publicación desaparece de pendientes.

Nota del usuario: se eliminó la sección 11 "Desarrollo y contenedor" de este documento — la containerización se hace más adelante, cuando la app esté funcional y atractiva, no ahora.

## 2026-11-10 — Backend: endpoints nuevos de Notificaciones (T10)

**Contexto:** se había decidido saltar Notificaciones (bloqueada, sin endpoints, prioridad más baja según la sección 7). El usuario pidió retomarla e implementar los endpoints nuevos de todas formas. **Importante:** `docs/endpoints.md` y `docs/informe-tecnico.md` (la documentación de H2 ya terminada) NO se actualizan todavía — el usuario va a editar la documentación H2/H3 en LaTeX cuando el backend y el frontend estén estables. Falta agregarles la sección de Notificaciones cuando llegue ese momento.

**Implementado (primera vez que se exponen estas rutas, antes solo existía el modelo y un service interno):**
- `src/models/notification.ts`: se agregó el plugin `mongoosePaginate` (lo tienen los otros modelos, a este le faltaba) y se usa la constante `NOTIFICATION_TYPE` de `types/domain.ts` en vez de un array literal repetido.
- `src/repositories/notification.repository.ts` (nuevo): `create`, `findByUser(userId, options, read?)`, `findById`, `markAsRead`.
- `src/services/notification.service.ts`: se corrigió para que dependa del repositorio en vez de importar el modelo de Mongoose directamente (la sección 3 de `CLAUDE.md` prohíbe que los services conozcan Mongoose/models). Nuevo `listUserNotifications` y `markAsRead` (este último separa "no existe" → 404 de "no es tuya" → 403, igual que el resto de la app).
- `src/controllers/notification.ts` y `src/routes/notification.ts` (nuevos): `GET /notifications` (`page`, `limit`, `read` opcionales) y `PATCH /notifications/{id}` (body `{ read: true }`).
- `src/app.ts`: se montó `/api/v1/notifications`.
- `src/services/publication.service.ts` (`moderatePublication`): se agregó la notificación al beneficiario que faltaba cuando se aprueba o rechaza su publicación (la sección 8 de `CLAUDE.md` ya lo pedía, nunca se había implementado). Aprobada → type `"confirmación"`; rechazada → type `"alerta pendiente"` (el enum de tipos es genérico, no hay un tipo específico para "rechazada").

**Validado en caliente:** moderar una publicación crea la notificación correcta para el beneficiario (confirmación/alerta pendiente); `GET /notifications` sin filtro, con `read=false` y con `read=true` devuelven lo esperado; marcar como leída funciona para el dueño y da `403` para cualquier otro usuario; las notificaciones de reservas (crear/cancelar/confirmar, que ya existían) siguen funcionando igual tras mover `notification.service.ts` al repositorio — sin regresión. `npm run typecheck`/`build` del backend sin errores.

## 2026-11-10 — Frontend: Notificaciones (T10)

- `types/notification.ts`, `services/notifications.ts` (`list`, `markRead`), `hooks/useNotifications.ts` (mismo patrón que los demás hooks de lista).
- `pages/NotificationsPage.tsx`: lista con los tres estados, cada notificación es un botón (accesible por teclado) que la marca como leída al hacer clic; "Marcar todas como leídas"; el `type` real de la API (`confirmación`/`alerta pendiente`/`conflicto`) se traduce a una etiqueta y un color (éxito/advertencia/peligro) — **no** se reprodujeron las pestañas "Reservas"/"Historias" del mockup, porque esa categorización no existe en el modelo real (ya se había anotado como discrepancia en el inventario).
- `Navbar`: el badge de notificaciones no leídas, que estaba hardcodeado en `0` desde T2, ahora pide `GET /notifications?read=false&limit=1` y usa `meta.total`.
- **Limitación aceptada:** el badge del `Navbar` se pide una sola vez al montar (el `Layout` no se vuelve a montar al navegar entre pantallas), así que no se actualiza solo cuando se leen notificaciones en `NotificationsPage` — se actualiza recién en la próxima recarga completa. No se resolvió con un context compartido para no agregar complejidad extra; se puede revisar en el pulido final (T12) si molesta en la demo.

Verificado: `npm run build`/`lint` del frontend sin errores ni advertencias. El contrato ya había quedado validado en caliente en la entrada anterior (backend).

## 2026-11-10 — Vulnerabilidad crítica: `PATCH /users/update` aceptaba cualquier campo (mass assignment)

**Hallazgo:** al revisar el endpoint antes de construir `ProfilePage` (T11), se encontró que `UserController.update` pasa `req.body` completo a `userService.updateProfile`, que a su vez lo pasa completo a `userRepository.update` → `User.findByIdAndUpdate(id, updateData)`, **sin filtrar ningún campo**. Se probó en caliente: `PATCH /users/update` con `{"role":"admin"}` devolvía `200` con el usuario ya con `role: "admin"` — cualquier usuario autenticado podía autoasignarse admin (o cambiar `verified`, `email`, etc.) sin pasar por el registro.

**Corregido (aprobado por el usuario):**
- `src/services/user.service.ts` (`updateProfile`): ahora construye un objeto nuevo solo con los campos permitidos por la sección 7 de `CLAUDE.md` (`name`, `surname`, `nick`, `address`, `phone`) y descarta cualquier otro campo del body, sin importar qué venga.

**Validado en caliente:** `PATCH /users/update` con `{"role":"admin","verified":true,"email":"otro@evil.com"}` → `200`, pero el usuario queda exactamente igual (rol, verificación y correo sin cambios). La edición normal (`name`, `address`, `phone`) sigue funcionando sin regresión.

**Nota:** el código de error de `CLAUDE.md` para nick duplicado es `NICK_ALREADY_EXISTS`, pero el `errorHandler` solo traduce la clave duplicada de Mongo (código 11000) a un genérico `CONFLICT` — nunca se distingue cuál campo colisionó. No se corrige ahora porque el mensaje genérico ya es seguro para mostrar al usuario (no filtra detalles técnicos); queda anotado como discrepancia menor de documentación. Se agregó `CONFLICT` a `errorMessages.ts` del frontend ("Ese dato ya está en uso por otra cuenta") para que no caiga en el mensaje genérico de servidor.

## 2026-11-10 — Frontend: Perfil (T11)

- `services/users.ts` (nuevo): `getMe(userId)` (se movió desde `auth.ts`, donde no correspondía) y `updateMe(body)` → `PATCH /users/update`.
- `context/AuthContext.ts`/`AuthProvider.tsx`: nuevo `refreshUser()` — refresca el `user` del contexto después de editar el perfil, para que el nombre se actualice en el `Navbar`/Feed sin recargar la página.
- `hooks/useProfile.ts`, `pages/ProfilePage.tsx`: vista/edición con los tres estados, validación de campos obligatorios (nombre, apellido, apodo), errores del servidor traducidos.
- **Botón "Cerrar Sesión" agregado** — se revisó y no existía ningún botón de logout en toda la app hasta ahora; queda en el aside de Perfil, junto a "Editar Perfil".

**Validado en caliente:** `GET /users/profile/{id}` y `PATCH /users/update` con los campos exactos del formulario; nick duplicado → `409 CONFLICT` con el mensaje ya traducido. `npm run build`/`lint` del frontend sin errores.

## 2026-11-10 — Cambiar contraseña: mismo endpoint, sin ruta nueva

**Motivo:** el usuario preguntó por qué "Cambiar Contraseña" (estaba en el mockup) no estaba — en ese momento no había ningún endpoint para eso. Se decidió agregarlo reutilizando `PATCH /users/update` en vez de crear una ruta nueva, para no sumarle una entrada más a la tabla de endpoints de la documentación de H2 (que el usuario prefiere dejar quieta hasta la revisión en LaTeX).

**Backend (aprobado por el usuario):**
- `src/repositories/user.repository.ts`: nuevo `findByIdWithPassword(id)` (el único lugar donde se necesita el hash, para compararlo — `findById`/`update` siguen excluyendo `password` como siempre).
- `src/services/user.service.ts` (`updateProfile`): si el body trae `new_password`, exige también `current_password`; lo compara con `bcrypt.compare` contra el hash guardado — si no coincide, `401 INVALID_CREDENTIALS`; si coincide, hashea la nueva con `bcrypt` (mismo costo que en el registro) antes de guardarla. Sin `new_password` en el body, el comportamiento no cambia en nada.

**Frontend:**
- `types/user.ts`: nuevo `ChangePasswordBody`. `services/users.ts`: nuevo `changePassword(body)` (mismo `PATCH /users/update`).
- `components/ChangePasswordForm.tsx` (nuevo, componente separado con su propio estado): contraseña actual, nueva y confirmación (coincidencia validada en el cliente); se agregó a `ProfilePage` debajo de los datos del perfil.

**Validado en caliente:** contraseña actual incorrecta → `401`; correcta → `200`; login con la contraseña vieja deja de funcionar, con la nueva funciona. `npm run typecheck`/`build` del backend y `build`/`lint` del frontend sin errores.

## 2026-11-10 — T12: pulido de estados, validación y accesibilidad

Auditoría de todo lo construido (T0-T11) contra las secciones 7, 9 y 12 de `CLAUDE.md`. Solo cambios de frontend, sin tocar el backend ni el contrato de ningún endpoint.

**Encontrado y corregido:**
- **Foco de teclado invisible**: `.form-field input/select/textarea`, el input de búsqueda del `Navbar` y el input de "necesidad" en `CreatePublicationPage` tenían `outline: none` sin ningún reemplazo visible — violaba "foco visible" de la sección 12. Se agregó un `outline` visible al enfocar (y un `box-shadow` en el contenedor del buscador, que por diseño no tiene borde propio).
- **Texto alternativo vacío en imágenes de contenido**: `PublicationCard` y `PublicationDetailPage` tenían `alt=""` en la foto real de la publicación (correcto solo para decorativas) — se cambió a un texto descriptivo (`Imagen de la publicación de {autor}`).
- **`NotificationsPage` sin protección contra doble clic**: ni "marcar como leída" ni "marcar todas" deshabilitaban el botón mientras la petición estaba en curso. Se agregó `pendingId`/`isMarkingAll`, igual que en el resto de las pantallas con acciones.
- **`NotFoundPage` seguía con el placeholder de T0** (`<div>NotFoundPage</div>`, nunca se había terminado) — ahora tiene un mensaje real y un enlace de vuelta al feed.
- **Faltaba `maxLength`** ("largos máximos" de la sección 7) en todos los campos de texto de los formularios (registro, perfil, cambio de contraseña, crear publicación). El backend no tiene ningún límite de longitud en estos campos (se revisó el schema de Mongoose), así que estos límites son una medida de buena práctica del cliente, no reflejan una validación del servidor.
- **`FormEvent` de React estaba deprecado** (`@deprecated FormEvent doesn't actually exist`, según el propio `.d.ts` de `@types/react` 19.3): se reemplazó por `SubmitEvent` en los 5 formularios que lo usaban. No cambia nada en tiempo de ejecución, solo el tipo.

**Revisado sin encontrar problemas:** sin `console.log` ni `dangerouslySetInnerHTML` en todo `src/`; ningún `fetch()` fuera de `services/` (la regla de capas del frontend se mantiene); ninguno de los datos fuera de alcance del mockup (Estadísticas Globales, ONG's aliadas, Guardados) se filtró al código real; dirección/teléfono de otros usuarios nunca se expone en ningún tipo de datos del frontend (ni siquiera `PublicationAuthor`/`ReservationPerson` los incluyen); las rutas restringidas por rol (`RoleRoute`) cubren exactamente lo que pide la tabla de la sección 8.

**No verificado en esta pasada** (sin navegador en esta sesión): que se vea bien en pantalla angosta, y el contraste de color de `--gris-texto` (`#777` sobre blanco, usado para texto secundario) — es un color ya definido en el mockup del Hito 1, no se cambió unilateralmente.

Verificado: `npm run build`/`lint` del frontend sin errores ni advertencias nuevas, en cada paso de esta tarea. No se tocó el backend, así que no hizo falta volver a probar en caliente contra la API — ningún cambio de esta tarea afecta las llamadas HTTP.

## 2026-11-10 — Backend: "Guardados" (funcionalidad nueva pedida por el usuario)

**Motivo:** el usuario pidió explícitamente agregar un botón "Guardados" (estaba en el mockup, se había dejado fuera de alcance por falta de endpoint) visible para los 3 roles, que permite guardar publicaciones y verlas todas en el perfil.

**Implementado (rutas nuevas, no hay nada existente que reutilizar):**
- `src/models/user.ts`: nuevo campo `saved_publications: ObjectId[]` (embebido, igual criterio que el resto del modelo mixto).
- `src/repositories/user.repository.ts`: `findSavedPublicationIds`, `addSavedPublication` (`$addToSet`, idempotente), `removeSavedPublication` (`$pull`, idempotente).
- `src/repositories/publication.repository.ts`: nuevo `findByIds` (con autor poblado, mismo patrón que `findByIdWithAuthor`).
- `src/services/user.service.ts`: `savePublication` (valida que la publicación exista, 404 si no), `unsavePublication`, `listSavedPublications` (pagina en memoria el arreglo de ids, más reciente primero, y pide esos ids a `publicationRepository.findByIds`).
- `src/controllers/user.ts` + `src/routes/user.ts`: `GET /users/saved-publications` (mismo formato que `GET /publications`, con `author`), `POST /users/saved-publications` (`{ publication_id }`, idempotente), `DELETE /users/saved-publications/{publicationId}` (idempotente).
- Se extrajo `serializePublication` de `publication.controller.ts` a `src/utils/serializePublication.ts` para reutilizarlo también en `user.controller.ts` (antes estaba duplicada la lógica de detectar si `user_id` viene poblado).

**Regresión encontrada y corregida de paso:** al revisar `UserController.upload` para este trabajo, se encontró que el fix de seguridad de T11 (whitelist de campos en `updateProfile`) había roto en silencio la subida de avatar — `upload()` llamaba a `updateProfile(userId, { image: fileName })`, pero `image` no está en la lista de campos permitidos, así que el cambio nunca se guardaba (sin error, solo no pasaba nada). Se agregó `userService.updateAvatar(userId, fileName)`, separado del whitelist genérico porque el nombre de archivo siempre viene de multer (confiable), nunca de texto libre del usuario.

**Validado en caliente:** guardar, guardar de nuevo (idempotente, no duplica), listar (orden más reciente primero, con `author`/`necesidades`), quitar, quitar de nuevo (idempotente), guardar un id que no existe → `404`. Se confirmó que el fix de `role` en `PATCH /users/update` sigue funcionando (sin regresión). `npm run typecheck`/`build` del backend sin errores.

**Documentación:** igual que con Notificaciones, no se tocó `docs/endpoints.md` ni `docs/informe-tecnico.md` todavía — queda pendiente agregar `GET/POST/DELETE /users/saved-publications` junto con la sección de Notificaciones cuando se haga la revisión conjunta en LaTeX.

## 2026-11-10 — Frontend: "Guardados" (los 3 roles)

- `services/savedPublications.ts`: `list`, `save`, `unsave`.
- `context/SavedPublicationsContext.ts` + `SavedPublicationsProvider.tsx` + `hooks/useSavedPublications.ts`: cargan el set de ids guardados una sola vez (hasta 50, el máximo que permite `limit` en el servidor — si algún día se guardan más, las siguientes no reflejan su estado hasta recargar; aceptable para el alcance actual) y exponen `isSaved`/`toggleSave` para que cualquier tarjeta sepa su estado sin pedirlo de nuevo. Montado en `main.tsx` dentro de `AuthProvider`.
- `hooks/useSavedPublicationsList.ts`: lista paginada completa (con `author`/`necesidades`), para la vista de "Publicaciones Guardadas" del perfil.
- `PublicationCard` y `PublicationDetailPage`: botón "Guardar"/"Guardado" (resalta con `btn-primary` cuando está guardada, sin necesidad de una clase CSS nueva).
- `FeedPage` y `ProfilePage`: botón "Guardados" en el recuadro de usuario (visible para los 3 roles, sin restricción de `RoleRoute`) → `Link` a `/profile?view=saved`.
- `ProfilePage`: si la URL trae `?view=saved`, muestra la lista de guardados (reutilizando `PublicationCard`, con sus tres estados y paginación) en vez de los datos del perfil; la lista se filtra en vivo por `isSaved` del contexto, así que si se quita una publicación desde ahí mismo, desaparece al instante sin esperar a recargar.
- `.btn-back` se movió de `PublicationDetailPage.css` a `shared.css` (ahora lo usan dos pantallas).

Verificado: `npm run build`/`lint` del frontend sin errores ni advertencias. El contrato contra la API ya había quedado validado en caliente en la entrada anterior (backend).

## 2026-11-10 — "Novedades" en el aside derecho del Feed (en vez de "Alertas Relevantes")

**Motivo:** el usuario pidió poblar el aside derecho del feed (vacío desde T2) con el contenido del mockup — pero "Alertas Relevantes" y "Estadísticas Globales" chocan con las secciones 1/15 ("Fuera de alcance") y 3.3.4 ("no datos ficticios") de `CLAUDE.md`. Se acordó con el usuario reemplazar cada sección por una versión con datos reales en vez de inventados. Esta entrada es solo "Novedades" — "Resumen" (necesita un endpoint `GET /stats` nuevo) y "Marcas aliadas" quedan para después, a pedido del usuario.

**Implementado (sin backend nuevo):** `FeedPage` ahora pide `GET /notifications?page=1&limit=3` (mismo endpoint de T10, sin cambios) y muestra las 3 notificaciones más recientes del usuario en una tarjeta "Novedades", cada una enlazando a `/notifications`. No reemplaza ninguna sección fuera de alcance con datos falsos — es la actividad real del propio usuario.

**Validado en caliente:** la consulta devuelve exactamente los 3 mensajes esperados, en el orden correcto (más reciente primero). `npm run build`/`lint` del frontend sin errores.

**Pendiente (a pedido explícito del usuario, no implementado todavía):** "Resumen" (necesitaría `GET /stats` nuevo con conteos reales: publicaciones aprobadas, necesidades disponibles, entregas completadas) y "Marcas aliadas" (placeholders con iniciales, ya que la app no tiene ningún concepto de "marca aliada" en su modelo).

## 2026-11-10 — Backend: búsqueda real en `GET /publications` (`?search=`)

**Motivo:** el buscador del navbar (`placeholder="Buscar historias, necesidades, beneficiarios..."`) era decorativo desde el mockup, sin ningún comportamiento (ya se había anotado en el inventario). El usuario pidió hacerlo funcional.

**Implementado (parámetro opcional nuevo en una ruta existente, mismo criterio de compatibilidad que `?status=`):**
- `src/utils/escapeRegex.ts` (nuevo): escapa caracteres especiales de regex antes de usar texto del usuario en un `$regex` de Mongo — evita inyección de regex y ReDoS.
- `src/repositories/user.repository.ts`: nuevo `findIdsByNameMatch(text)` — ids de usuarios cuyo `name` coincide (case-insensitive), para poder buscar publicaciones por el nombre del beneficiario.
- `src/repositories/publication.repository.ts` (`findByStatus`): tercer parámetro opcional `search: { text, matchingUserIds }`; si viene, agrega un `$or` que busca en `text` (la historia), `necesidades.name`, y `user_id` (usando los ids ya resueltos del paso anterior).
- `src/services/publication.service.ts` (`listPublications`): nuevo parámetro `searchText`; si viene, resuelve los ids de usuarios coincidentes (`userRepository.findIdsByNameMatch`) antes de pedirle al repositorio la lista filtrada.
- `src/controllers/publication.ts` (`listApproved`): lee `req.query.search` y lo pasa tal cual (el servicio decide qué hacer si viene vacío).

**Validado en caliente:** búsqueda por texto de la historia, por nombre de necesidad, y por nombre del beneficiario — cada una devuelve exactamente lo esperado; búsqueda sin resultados → lista vacía; caracteres especiales de regex (`.`, `*`, `(`, `)`, `[`, `]`, `+`) no rompen el servidor (quedan escapados). `npm run typecheck`/`build` del backend sin errores.

## 2026-11-10 — Frontend: buscador funcional en el `Navbar`

- `services/publications.ts`/`hooks/usePublications.ts`: nuevo parámetro `search`.
- `Navbar.tsx`: el input de búsqueda pasó de decorativo a controlado, envuelto en un `<form role="search">`; al enviar (Enter), navega a `/?search=<texto>` (o a `/` si queda vacío). El valor se sincroniza con el `?search=` de la URL actual (si ya hay una búsqueda activa y se navega a otra pantalla y se vuelve, el input la refleja).
- `FeedPage.tsx`: lee `?search=` de la URL, lo pasa a `usePublications`, reinicia la paginación a la página 1 cuando cambia la búsqueda, y el estado vacío muestra un mensaje específico ("No encontramos resultados para...") en vez del genérico.

Verificado: `npm run build`/`lint` del frontend sin errores ni advertencias. El contrato contra la API ya había quedado validado en caliente en la entrada anterior (backend).

## 2026-11-11 — Perfil: publicaciones relacionadas al lado de la información personal

**Motivo:** el usuario pidió que, en la página de perfil, junto al recuadro de información personal, se muestren las publicaciones con las que el usuario ha interactuado, con un título y un filtro distinto por rol:
- `admin` → "Has moderado:" → solo publicaciones `aprobada` o `rechazada` (las que ya pasaron por moderación, de cualquier admin — el modelo no registra qué admin moderó cada una).
- `donante` → "Has donado a:" → solo publicaciones donde el donante tiene al menos una reserva con estado `entregado` (confirmada).
- `beneficiario` → "Mis publicaciones:" → solo sus propias publicaciones (cualquier estado).

**Implementado sin agregar ningún endpoint nuevo**, combinando endpoints ya existentes desde el frontend (`src/hooks/useProfilePublications.ts`):
- Admin: `GET /publications?status=aprobada` + `GET /publications?status=rechazada` (el admin ya podía pedir cualquier estado), mezclados y ordenados por fecha.
- Donante: `GET /reservations?status=entregado` (ya filtra por el donante autenticado) → de ahí se sacan los `publication_id` únicos → `GET /publications/{id}` por cada uno (ya público para cualquier autenticado, sin restricción de estado).
- Beneficiario: `GET /users/{id}/publications` (endpoint que ya existía en el backend según la tabla de la Sección 7, pero nunca se había conectado al frontend).

**Un fix chico en un endpoint existente (no nuevo, no rompe nada porque nadie lo consumía todavía):** `GET /users/{id}/publications` no poblaba el autor ni pasaba por `serializePublication` como el resto de los endpoints que devuelven publicaciones (`GET /publications`, `GET /publications/{id}`, Guardados). Se corrigió `publicationRepository.findByUserId` (agrega `populate` de `user_id`) y `publication.controller.ts#listByUser` (usa `serializePublication`) para que la forma de la respuesta sea idéntica a la de los demás endpoints — así se pudo reutilizar el componente `PublicationCard` sin cambios. Es un campo opcional agregado (`author`), compatible con la Sección 4 (no requiere `/v2`).

**Frontend:** `ProfilePage.tsx` ahora envuelve la info personal (vista o edición) y el nuevo panel en un grid de dos columnas (`profile-content-grid`, 380px + 1fr, una sola columna en pantallas angostas). El panel (`RelatedPublicationsPanel`) tiene los tres estados estándar (carga/vacío/error) y reutiliza `PublicationCard`. Se oculta mientras se está cambiando la contraseña (ese modo ya reemplaza toda la columna de información).

**Validado en caliente** con cuentas de prueba descartables (`qa.bene.*`, `qa.donor.*`, un admin de prueba creado directo en Mongo porque no había credenciales de admin a mano): se creó una publicación, se aprobó una y se rechazó otra (admin ve ambas en su lista), se reservó y confirmó la entrega de un ítem (donante ve la publicación en su lista), y se confirmó que `GET /users/{id}/publications` ahora devuelve `author` igual que el resto de los endpoints. `npm run typecheck`/`build` del backend y `npm run build`/`lint` del frontend, todos limpios.

## 2026-11-11 — Tres correcciones de backend encontradas al actualizar el informe de Hito 2

**Motivo:** al adaptar `docs/informe-Hito2.md` para que describa el backend tal como quedó implementado, se comparó cada regla de negocio del documento (y de la Sección 8 de `CLAUDE.md`) contra el código real y aparecieron tres brechas. Se le presentaron las opciones al usuario antes de tocar código; decidió corregir las tres.

1. **`DELETE /publications/{id}` no chequeaba reservas activas.** La Sección 8 de `CLAUDE.md` y el propio informe de Hito 2 ya daban por hecho el 409 "reservas activas", pero `publicationService.deletePublication` borraba sin verificar nada. Se agregó `reservationRepository.hasActiveReservations(publicationId)` (usa `Reservation.exists({publication_id, status:"reservado"})`) y el service ahora lanza `AppError("PUBLICATION_HAS_ACTIVE_RESERVATIONS", 409, ...)` antes de borrar si existe al menos una reserva `reservado` sobre esa publicación.
2. **`GET /users/profile/:id` ignoraba el `:id` de la ruta.** El controlador hacía `req.user?.id || req.params.id`, y como `req.user` siempre existe después de `auth`, el `:id` de la URL nunca se usaba: el endpoint siempre devolvía el perfil del usuario autenticado, sin importar a quién se pidiera. Se corrigió a `req.params.id` directamente, para que cualquier autenticado pueda ver el perfil de cualquier otro usuario (como dice la Sección 7 de `CLAUDE.md`). El frontend no se ve afectado: ya llamaba a este endpoint pasando su propio id.
3. **`GET /users/list/:page` era una ruta duplicada con paginación por path**, heredada de la base de red social — justo el patrón que la Sección 10 de `CLAUDE.md` (punto 3) pedía corregir y que había quedado sin tocar. Se eliminó la ruta; `GET /users/list?page=&limit=` (que ya existía y usa el mismo controlador) cubre el mismo caso con el estilo de paginación del resto de la API. Nada del frontend la usaba.

**No se tocó** el caso de `POST /reservations` devolviendo 409 tanto si la publicación/ítem no existen como si ya está reservado (sin un 404 distinto): el usuario pidió documentar ese comportamiento tal cual es, no cambiarlo.

**Validado en caliente** contra el backend corriendo: perfil de otro usuario ahora se ve correctamente (antes devolvía el propio), `/users/list/1` da 404, borrar una publicación con una reserva `reservado` activa da 409 `PUBLICATION_HAS_ACTIVE_RESERVATIONS`, y borrar una sin reservas activas sigue dando 204 (sin regresión). `npm run typecheck`/`build` del backend, limpios.

## 2026-11-11 — `db/init.js` estaba roto desde la migración a TypeScript (sin script npm)

**Motivo:** al escribir la sección de persistencia del informe de Hito 2, se encontró que `db/init.js` todavía hacía `require("./src/models/user")` etc. — válido cuando los modelos eran `.js`, pero desde la migración a TypeScript esos archivos usan `import`/`export`/genéricos, que `require()` no puede parsear. Además no existía ningún script `npm run db:init`: la Sección 2 del hito exige un "script de creación reproducible" (10 pts) y ese script, tal como estaba, no podía ejecutarse en ningún equipo.

**Cambio aplicado:** se reescribió como `db/init.ts` (import/export, tipado), eliminando `db/init.js`. Mismo comportamiento que antes (limpia las 4 colecciones, crea el admin inicial `admin@robin.com` / `admin123`) más `syncIndexes()` explícito en cada modelo, para que la sincronización de índices (email y nick únicos) sea un paso verificable del script y no solo un efecto secundario implícito de Mongoose al conectar. Se agregó `"db:init": "tsx db/init.ts"` a `package.json`, siguiendo el mismo patrón que `npm run dev` (ambos corren TypeScript directo con `tsx`, sin paso de compilación).

**Importante:** el script sigue siendo destructivo a propósito (borra las colecciones antes de recrearlas) — es un script de "base desde cero", no una migración incremental. Se avisó al usuario antes de ejecutarlo contra la base de desarrollo.

**Validado en caliente** (con autorización del usuario, porque borra datos): `npm run db:init` corrió limpio contra la base de desarrollo real, el admin pudo iniciar sesión con las credenciales que imprime el script, y el índice único de `email` sigue funcionando (un registro con el correo del admin dio 409 `EMAIL_ALREADY_EXISTS`). `npm run typecheck`/`build` del backend, limpios (el script queda fuera del `include` de `tsconfig.json`, que sigue acotado a `src/`, así que no afecta la compilación del servidor).

## 2026-11-11 — `CORS_ORIGIN` estaba en `.env.example` pero el código no lo usaba

**Motivo:** al revisar la sección 9 de `CLAUDE.md` ("CORS habilitado... limitado al origen indicado en CORS_ORIGIN") contra `src/app.ts`, se encontró `app.use(cors())` sin ninguna opción — acepta cualquier origen, la variable de entorno nunca se leía.

**Cambio aplicado:** `app.use(cors({ origin: process.env.CORS_ORIGIN }))`. Si la variable no está definida, el paquete `cors` cae en su comportamiento por defecto (permitir cualquier origen), igual que antes — el fix no puede "romper" nada por sí solo, solo lo hace configurable de verdad.

**De paso:** `.env.example` tenía `CORS_ORIGIN=http://localhost:3000`, que no corresponde a ningún puerto real del proyecto (el frontend corre en `5173` vía Vite). Se corrigió a `http://localhost:5173`. No se tocó el `.env` real (no se abre ni se muestra, por la sección 9 de `CLAUDE.md`) — si ese archivo tiene un valor viejo o no tiene la variable, el usuario debería revisarlo y ajustarlo a mano.

**Validado en caliente:** con el backend corriendo, una petición con `Origin: http://localhost:5173` y otra con `Origin: http://evil.example.com` devolvieron la misma cabecera `Access-Control-Allow-Origin: *` — señal de que el `.env` real no tiene `CORS_ORIGIN` definido (o lo tiene como `*`), no de que el fix no funcione: el código ya lee la variable; falta que el `.env` real la fije a un origen concreto para que la restricción sea efectiva. `npm run typecheck`/`build` del backend, limpios.

## 2026-11-11 — `db/init.ts` ahora siembra datos de prueba (beneficiario, donante, publicación aprobada)

**Motivo:** al armar el inventario del Hito 3 se encontró que la base de datos, tras `npm run db:init`, solo tenía al admin — ningún beneficiario ni donante de prueba. El manual de uso del Hito 3 (sección 6 del nuevo `CLAUDE.md`) exige "usuarios y datos de prueba" reproducibles por rol, y sin esto habría que registrarse a mano antes de poder probar el flujo principal (reservar un ítem).

**Cambio aplicado:** `db/init.ts` ahora, después de crear el admin, crea:
- `beneficiario@robin.com` / `beneficiario123` (rol `beneficiario`).
- `donante@robin.com` / `donante123` (rol `donante`).
- Una publicación del beneficiario anterior, ya `aprobada` (se salta la moderación a propósito, porque es un script de datos iniciales, no una petición HTTP), con dos necesidades `disponible`: "Mochila escolar" y "Set de cuadernos y lápices".

Sigue siendo el mismo script destructivo de siempre (borra las 4 colecciones antes de recrear todo), solo que ahora deja algo más que un usuario vacío.

**Validado en caliente:** `npm run db:init` corrió limpio, los tres logins (`admin`, `beneficiario@robin.com`, `donante@robin.com`) funcionaron, y `GET /publications` como donante devolvió la publicación de prueba aprobada con sus dos necesidades `disponible` — lista para reservar sin configurar nada a mano. `npm run typecheck`/`build` del backend, limpios.

**Documentación:** se actualizó la sección "Scripts y credenciales" de `docs/informe-Hito2.md` para describir estos tres registros nuevos (antes solo mencionaba la creación del admin).

## 2026-11-11 — Actualización de los documentos previos (`endpoints.md`, `informe-tecnico.md`, `modelo-datos.md`, `persistencia-credenciales.md`)

**Motivo:** el inventario de la Fase 0 del Hito 3 encontró que estos cuatro documentos (anteriores a `informe-Hito2.md`) estaban desactualizados respecto al código real: rutas bajo `/auth` que no existen (la auth vive bajo `/users`), sin Notificaciones ni Guardados, ruta de `publications de un usuario` apuntando al mount redundante en vez del canónico, `.env.example` con valores viejos, árbol de `src/` sin los archivos de notificaciones ni los nuevos `utils/`, y el recorrido de la petición de reserva sin el middleware de rol ni el repositorio correcto. El usuario pidió actualizarlos en vez de archivarlos.

**Cambios aplicados** (mismo criterio que ya se usó para `informe-Hito2.md`, verificado contra el código real en cada caso):
- `docs/endpoints.md`: rutas de auth corregidas a `/users/register`/`/users/login`; se quitó `/users/list/{page}` (eliminada esta sesión); se agregaron Guardados (3 endpoints) y Notificaciones (2 endpoints); `search` agregado a `GET /publications`; ruta canónica `/users/{id}/publications`; `PATCH /users/update` con el cambio de contraseña; `POST /reservations` sin el 404 que no existe; acceso de `PATCH /reservations/{id}/status` separado por cancelar (solo donante) vs entregar (cualquiera de las dos partes).
- `docs/informe-tecnico.md`: mismas correcciones de endpoints que arriba, más el árbol de `src/` (notification.* en cada capa, `serializePublication.ts`/`escapeRegex.ts` en utils, sin `validators/`), el recorrido de la petición de reserva (agregado el middleware de rol, corregido el repositorio a `publication.repository.ts`) y sus fragmentos de código.
- `docs/modelo-datos.md`: agregado `saved_publications` a Users y una nota sobre guardados como referencias con `$addToSet`/`$pull`.
- `docs/persistencia-credenciales.md`: mismas correcciones de modelo de datos, script `db/init.ts` (ahora con datos de prueba) y `.env.example`; además, una tabla de "Índices" que describía índices compuestos inventados (`{status:1,created_at:-1}` etc.) que **no existen** en los esquemas — se verificó con `grep -i index src/models` (sin resultados) y consultando `db.collection.indexes()` de verdad. El usuario eligió corregir solo la documentación (no agregar los índices al código); la tabla ahora dice la verdad y queda un recuadro "Por completar" declarando la deuda técnica.

**No se tocó** el código de los esquemas para agregar índices compuestos — decisión explícita del usuario, documentación ajustada a la realidad en su lugar.

## 2026-11-11 — Fase 1 del informe final del Hito 3: esqueleto creado

**Motivo:** con el inventario (Fase 0) cerrado y las tres decisiones pendientes resueltas, el usuario dio luz verde para pasar a la Fase 1 del flujo de trabajo definido en la sección 3 del nuevo `CLAUDE.md` ("Informe final del Hito 3"): crear el documento con portada, índice y los capítulos de la sección 4, con los datos del inventario y marcas `[POR COMPLETAR]` donde falta información real.

**Creado:** `docs/informe/informe-final-robin.tex` (mismo preámbulo y estilos que `docs/informe-Hito2.md`, estructura nueva de 9 secciones + 3 anexos según la sección 4 del `CLAUDE.md`) y `docs/manual.md` (versión independiente del capítulo de manual, para que no haga falta abrir el PDF completo para instalar el producto).

**Lo que se llenó con datos reales del inventario** (no narrativa, solo hechos verificables): tabla de endpoints (24, por recurso), tabla de roles, árbol de capas de backend y frontend, diagrama general cliente/servidor/base, diagrama de capas, recorrido completo de una reserva (clic → ... → UI), tabla de cambios desde el Hito 2, bitácora resumida, tabla de validación cliente/servidor, tabla de código de error → mensaje, usuarios y datos de prueba, fallas frecuentes, inventario de datos personales, y la lista de limitaciones declaradas.

**Lo que quedó `[POR COMPLETAR]` a propósito** (narrativa que exige redacción y revisión capítulo por capítulo en la Fase 2, o datos que genuinamente no existen todavía): introducción, lecciones aprendidas, conclusión, decisión de despliegue (sección 8 del `CLAUDE.md` ya advertía que esto no estaba implementado), capturas de pantalla (no existen en el repo), colección de pruebas tipo Postman (no existe; se usó `curl` manual), prueba de instalación en equipo limpio (no se hizo), y partes del Anexo B que requieren verificar artículos de la Ley 21.719 contra el texto vigente en bcn.cl antes de citarlos.

**Verificado antes de escribir** (no se inventó nada): se corrió de nuevo `grep -rnE "mongoose|models/|repositories/" src/controllers`, `grep -rnE "req\.|res\.|mongoose" src/services` y `grep -rn "fetch(" frontend/src/pages frontend/src/components` — los tres vacíos, tal como se afirma en el documento.

**Errores de LaTeX encontrados y corregidos al compilar el esqueleto** (no existían en `informe-Hito2.md`, son nuevos de este documento):
1. Un nodo TikZ de forma `cylinder` con texto en dos líneas sin `align=center` → "LaTeX Error: Not allowed in LR mode".
2. El carácter `·` dentro de bloques `language=tree` (que no tienen ese carácter mapeado, a diferencia del estilo general) → "Invalid UTF-8 byte sequence"; se cambió por comas en esos dos bloques.
3. Una `}` pegada justo después de `\end{verbatim}` en la misma línea, que el entorno `verbatim` descarta silenciosamente (deja un grupo sin cerrar) → se bajó a su propia línea.
4. Tres celdas de tablas con contenido monoespaciado largo e irrompible desbordando la columna (hasta 63pt) → se achicó el tipo de letra en esas celdas puntuales o se ampliaron columnas.

**Validado:** el documento compila limpio con `pdflatex` (dos pasadas, 29 páginas, sin errores, sin referencias indefinidas) usando imágenes de reemplazo para `portada.jpg`/`logo_umayor.png` (las reales no están en el repositorio; el usuario las aporta al compilar en su máquina). El PDF de prueba se generó solo en el directorio de trabajo temporal, no se copió a `docs/`, porque mostraría la portada y el logo de reemplazo en vez de los reales.

**Pendiente:** esperar la revisión del usuario antes de pasar a la Fase 2 (redacción capítulo por capítulo de las secciones marcadas `[POR COMPLETAR]`).

## 2026-11-11 — Fase 2 del informe final: redacción de los capítulos con base real

**Motivo:** el usuario pidió avanzar con todo lo que se pudiera redactar de la Fase 2, y eliminar explícitamente "Lecciones aprendidas".

**Cambios aplicados en `docs/informe/informe-final-robin.tex`:**
- Se escribió la **Introducción** completa (problema, promesa, alcance entregado, hoja de ruta), en pasado, sin repetir el Hito 2 textualmente.
- Se escribió la **Conclusión**, en pasado, sin promesas nuevas sobre lo entregado.
- Se escribió "**Qué decidió el equipo, no la IA**" (Anexo A) con ejemplos reales de esta sesión: los 4 bugs que el equipo decidió corregir en vez de solo documentar, la decisión de documentar (no implementar) los índices faltantes, agregar datos de prueba al script, actualizar los documentos viejos, usar `informe-Hito2.md` como plantilla, y el alcance/diseño de cada funcionalidad nueva del frontend.
- Se escribió el **Glosario** completo (Anexo C): términos de dominio (necesidad, publicación, moderación, reserva, reserva atómica, confirmación manual, guardados) y técnicos (sobre de respuesta, `AppError`, capa).
- Se resolvió una celda `[POR COMPLETAR]` de la tabla de trazabilidad: las notificaciones ya estaban en la tabla de endpoints del Hito 2 (en papel), pero no se había verificado que estuvieran implementadas — se implementaron y conectaron a una pantalla recién en este hito.
- Se **eliminó** la sub-sección "Lecciones aprendidas" (pedido explícito del usuario), no solo se dejó vacía.

**Lo que sigue `[POR COMPLETAR]` a propósito, porque redactarlo sería inventar** (ninguno se tocó):
- Capturas de pantalla (sección 2.2, 5.3, Anexo C) — no existen en el repositorio.
- Colección de pruebas tipo Postman (Anexo C) — no existe; se usó `curl` manual.
- Decisión de despliegue (sección 3.6) — Docker no está implementado; la sección 8 del `CLAUDE.md` pide explícitamente dejarlo así hasta que exista un plan real.
- Prueba de instalación en equipo limpio (sección 6) — no se hizo.
- Artículos exactos de la Ley 21.719 (Anexo B) — no se citó ninguno sin verificar contra bcn.cl.
- Dos celdas de la tabla de trazabilidad sobre qué prometía exactamente el Hito 1 respecto a Docker y pruebas automatizadas — no se tiene el documento original del Hito 1 para confirmarlo con certeza.

**Validado:** el documento compila limpio con dos pasadas de `pdflatex` (30 páginas, sin errores, sin referencias indefinidas, mismos ~17 overfull boxes menores de antes, ninguno nuevo).

**Pendiente:** revisión del usuario sobre lo redactado, y decidir qué hacer con los puntos genuinamente faltantes antes de considerar el informe cerrado.
