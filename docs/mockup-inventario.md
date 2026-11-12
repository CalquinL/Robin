# Inventario del mockup (Hito 1) — base para el frontend (Hito 3)

Fuente: `frontend/mockup/` (`index.html`, `detail.html`, `donations.html`, `notifications.html`, `profile.html`, `styles.css`, `main.js`, `assets/`). Esta carpeta es solo de lectura (regla 3.1 de `CLAUDE.md`).

El mockup no usa autenticación real: simula el rol actual con un `<select>` en el header y clases CSS (`role-donor`, `role-beneficiary`, `role-admin`) que se muestran u ocultan por JS. **No hay pantallas de login ni de registro** en el mockup — hay que diseñarlas desde cero (ver sección 6).

## 1. Pantallas y elementos

### 1.1 `index.html` — Feed
- Header: logo, selector de rol (`#role-select`).
- Navbar: buscador (sin comportamiento real), accesos a Feed/Donaciones/Notificaciones/Perfil, contador de notificaciones no leídas.
- Aside izquierdo: tarjeta de usuario actual (avatar con inicial, nombre, botones "Editar Perfil" y "Guardados").
- Contenido principal: input "crear publicación" (solo visible para `role-beneficiary`, sin acción real) + lista de `story-card` (tarjetas de publicación): avatar, nombre, rol, tiempo relativo, insignia "Historia verificada", descripción, placeholder de imagen (emoji 🖼️), botón "Ver Necesidades".
- Aside derecho: botón "+ Crear Nueva Publicación" (sin acción), "Alertas Relevantes" (texto fijo), "Estadísticas Globales" (texto fijo), "ONG's aliadas" (logos).

### 1.2 `detail.html` — Detalle de publicación
- Botón "← Volver al Feed".
- Columna izquierda: avatar, nombre, insignia de verificación, descripción, placeholder de imagen.
- Columna derecha: barra de progreso (% de necesidades no disponibles) y lista de necesidades (`story-item`): nombre, badge de estado (Disponible/Reservado/Entregado) y botón "Reservar" (deshabilitado si no está disponible).
- Lee el id de publicación desde `?id=` en la URL.

### 1.3 `donations.html` — Mis donaciones
Tres vistas excluyentes según el rol (`role-view`):
- **Donante**: tabs "Pendientes / Entregados / Todos"; ítems agrupados por beneficiario (`beneficiary-group`), cada ítem con nombre, fecha relativa, badge de estado y botones "Confirmar Entrega" / "Cancelar reserva" cuando está pendiente.
- **Beneficiario**: lista plana de sus necesidades con el donante asociado y badge de estado.
- **Admin**: lista de "solicitudes" (nombre del solicitante) con botones "Verificar" / "Rechazar" — es la única pantalla de moderación que existe en el mockup, embebida aquí (no es una página aparte).
- Aside derecho (solo donante): "Tu impacto" (métricas fijas) y progreso hacia una medalla.

### 1.4 `notifications.html` — Notificaciones
- Tabs de filtro: Todas / Reservas / Historias (`data-filter`).
- Botón "Marcar todas como leídas".
- Lista de notificaciones con ícono según `status` (success/info/warning/danger), texto, tiempo relativo, punto de "no leída".
- Estado vacío con ícono 🔔 y mensaje.

### 1.5 `profile.html` — Perfil
- Aside izquierdo: avatar grande + botón "cambiar foto" (solo `alert`, sin subida real), nombre, rol, botón "Editar Perfil"; tarjeta "Logros" (6 medallas fijas); tarjeta "Configuración" (links "Cambiar Contraseña" y "Cerrar Sesión", sin acción real).
- Contenido principal: "Actividad Reciente" (lista filtrada por rol) que, en modo edición, se reemplaza por un formulario con Nombre/Email/Dirección/Teléfono y botón "Guardar Cambios".
- Solo visible para `role-beneficiary`: tarjeta "Publicaciones Activas" (sus propias publicaciones con el estado de cada necesidad).

## 2. Datos escritos a mano (no deben llegar al código final)
- Usuario fijo: "Usuario de Robin", `usuario@ejemplo.com`, dirección y teléfono de ejemplo.
- 2 publicaciones de ejemplo (María Fernández / Centro de Salud San José) con sus necesidades.
- 7 notificaciones y 7 actividades de ejemplo con fechas y textos fijos.
- Métricas de "Tu impacto" (12 personas, 45 donaciones, 60% hacia la medalla) y "Estadísticas Globales" (1.245 ítems donados).
- Alertas del aside derecho del feed (inundaciones, incendio, refugio).
- Lista de "solicitudes" de moderación (6 nombres fijos, sin relación con ninguna publicación real del estado).
- 6 medallas de logros en el perfil, todas con la misma imagen (`medallaBronce.png`).

Todo esto se reemplaza por datos de la API; nada de esto se conserva como contenido de interfaz.

## 3. Comportamientos hechos con JS (`main.js`) a reimplementar con estado de React
- `role-select`: cambia `state.currentRole` y lo guarda en `localStorage` (`robinRole`); oculta/muestra elementos `role-donor|role-beneficiary|role-admin` y las vistas `.role-view`. **Esto se descarta**: el rol real vendrá del token (`AuthContext`), no de un selector manual.
- `renderProfile` / `toggleEditMode`: alterna entre vista de actividad y formulario de edición; guarda los campos en memoria (sin persistencia real).
- `formatRelativeTime`: calcula "hace X min/horas/días" a partir de un timestamp — se puede reimplementar como utilidad en `utils/`.
- `updateNotificationCounter`: cuenta no leídas y actualiza el badge del navbar.
- `renderNotifications` + filtro por tabs: filtra por `category` y ordena por `timestamp` desc.
- `markAllAsRead`: marca todas como leídas.
- `renderDetail`: lee `?id=` de la URL, pinta datos de la publicación, calcula el % de progreso, pinta la lista de necesidades y conecta el botón "Reservar".
- `handleReserve`: cambia el estado de la necesidad a `reserved` en memoria y muestra un `alert`.
- Tabs de "Mis donaciones" (pendientes/entregados/todos): filtra ítems por `data-status` y oculta grupos vacíos.
- Botón "Confirmar Entrega": cambia el estado del ítem a `delivered` en el DOM directamente.
- Botón "Cancelar reserva": pide `confirm()` y elimina el ítem del DOM.
- Todo lo anterior usa `document.querySelector` / `innerHTML` / `alert` / `confirm`, lo que está prohibido en el código final (regla 3.3.5): se reimplementa con `useState`/hooks y llamadas reales a la API, y los `alert`/`confirm` se reemplazan por mensajes de error/confirmación en la interfaz.

## 4. Clases CSS y variables de diseño reutilizables
Variables (`:root` en `styles.css`): `--verde-principal`, `--verde-claro`, `--naranja-principal`, `--naranja-oscuro`, `--gris-claro`, `--gris-borde`, `--gris-texto`, `--blanco`. Van a `src/styles/global.css`.

Clases reutilizables más importantes: `.card-box`, `.avatar-circle`, `.badge` + `.badge-green`/`.badge-orange`, `.badge-verified`, `.btn-action` + `.btn-primary`/`.btn-secondary`, `.progress-bar`/`.progress-fill`/`.progress-text`, `.story-card`/`.story-header`/`.story-content`/`.story-image`/`.story-items`/`.story-item`, `.donation-item`, `.notification-item`/`.activity-item` (con variantes `[data-status]`), `.nav-btn`, `.tab-btn`/`.filter-tab`, `.empty-state-content`.

Layout: `.container` es un grid de 3 columnas (260px / 1fr / 300px) que colapsa a 1 columna en `max-width: 1000px` (regla de responsive ya definida). `.profile-container` usa un grid de 2 columnas.

## 5. Recursos externos
- Tipografía: pila de fuentes del sistema (`'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`); no hay fuentes externas.
- Íconos: SVG inline estilo Tabler/Feather, sin librería ni CDN.
- Imágenes en `frontend/mockup/assets/`:
  - `robinApp_Logo (1).png` — el HTML referencia `assets/robinApp_Logo.png` (sin el "(1)"): **el archivo no coincide con el nombre esperado**, hay que renombrarlo o volver a exportarlo antes de usarlo.
  - `medallaBronce.png` — usada en "Logros" (perfil) y "Tu impacto" (donaciones), ambas fuera de alcance (ver sección 6).
  - Referenciadas en el HTML pero **no incluidas** en `assets/`: `techoLogo.png`, `unicefLogo.jpg`, `wwf-panda-logo.jpg` (sección "ONG's aliadas", también fuera de alcance).
  - Licencia/crédito: no hay información de licencia para ninguna imagen. Si se necesita el logo para el frontend real, confirmar con el equipo que tienen derecho a usarlo.

## 6. Fuera de alcance (sección 1 y 15 de `CLAUDE.md`) presente en el mockup
No se migran al frontend real:
- "Estadísticas Globales" (feed).
- "ONG's aliadas" (feed).
- "Logros" / medallas (perfil) y "Tu impacto" con medalla de hito (donaciones).

## 7. Discrepancias entre el mockup y el contrato real de la API (a resolver antes de construir, no en silencio)
1. **Login/registro**: no existen en el mockup; hay que diseñarlos de cero para `LoginPage`/`RegisterPage`.
2. **Creación de publicación**: el input del feed y el botón "+ Crear Nueva Publicación" no tienen formulario ni lógica en el mockup; `CreatePublicationPage` se construye sin referencia directa de UI.
3. **Verificación del admin**: en el mockup es una de las tres vistas de `donations.html` (no una página separada) y su lista de "solicitudes" no corresponde a ninguna publicación real. La tabla de `CLAUDE.md` la define como `AdminReviewPage` aparte con `GET /publications?status=pendiente` — ese filtro por query **no está confirmado** en la sección 7 del backend (dice "SOLO aprobadas" sin parámetro de estado para admin); falta confirmar cómo el admin obtiene las pendientes.
4. **Estados de necesidad**: el mockup usa `available`/`reserved` (inglés); la API usa `disponible`/`reservado`/`entregado` (español). Hay que mapear, no copiar los valores.
5. **Notificaciones**: el mockup filtra por `category` (`reservations`/`stories`) y usa `status` visual (`success`/`info`/`warning`/`danger`) con un campo `link` de navegación. El modelo de la API solo tiene `type` (`confirmación | alerta pendiente | conflicto` — aún `[confirmar valores]` en `CLAUDE.md`), `message`, `read`. No hay campo de severidad visual ni de link, y los valores de `type` siguen sin confirmar. Bloquea reproducir los filtros y colores tal cual.
6. **Edición de perfil**: el mockup edita Nombre/Email/Dirección/Teléfono; la API (`PATCH /users/me`) permite `name, surname, nick, address, phone` (no `email`, sí `surname`/`nick` que el mockup no contempla).
7. **Tabs de "Mis donaciones"**: el mockup tiene Pendientes/Entregados/Todos; el modelo de reserva real agrega el estado `cancelada`, que el mockup no muestra como tab (las reservas canceladas simplemente se eliminan del DOM).
8. **Foto de perfil / imagen de publicación**: el mockup no implementa subida real (solo `alert`); la API expone `PUT /publications/{id}/image` para la imagen de publicación, pero no hay endpoint de foto de perfil de usuario en la sección 7 — el botón "cambiar foto" del perfil no tiene con qué conectarse todavía.

Los puntos 3, 5 y 8 quedan pendientes de tu confirmación antes de construir las pantallas que dependen de ellos (`AdminReviewPage`, `NotificationsPage`, foto de perfil).
