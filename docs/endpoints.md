# Documentación de Endpoints - API Robin (v1.0.0)

Esta documentación detalla la totalidad de los endpoints disponibles en la API de Robin. 
**URL Base:** `http://localhost:3900/api/v1`

## 📋 Estándar de Respuesta

Toda respuesta de la API sigue una estructura uniforme:

### Respuesta Exitosa
```json
{
  "status": "success",
  "statusCode": 200,
  "data": { }, 
  "meta": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}
```
*`meta` solo está presente en endpoints con paginación.*

### Respuesta de Error
```json
{
  "status": "error",
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo X es obligatorio",
    "details": []
  }
}
```

---

## 🔐 Autenticación
La mayoría de los endpoints requieren un token JWT enviado en la cabecera:
`Authorization: Bearer <token>`

---

## 🚀 Endpoints

### 1. Autenticación (bajo `/users`, no hay prefijo `/auth` en el código)

#### Registrar Usuario
- **Ruta**: `POST http://localhost:3900/api/v1/users/register`
- **Acceso**: Público
- **Cuerpo**:
```json
{
  "name": "Juan",
  "surname": "Pérez",
  "nick": "juanp",
  "email": "juan@example.com",
  "password": "password123",
  "role": "donante" 
}
```
- `role` solo admite `beneficiario` o `donante`; si se envía `admin` (o cualquier otro valor), responde `400 VALIDATION_ERROR`. El rol `admin` solo se crea con `db/init.ts`.
- **Éxito**: `201 Created`
- **Errores**: `400` (Datos inválidos o rol no permitido), `409` (Email o Nick duplicado).

#### Iniciar Sesión
- **Ruta**: `POST http://localhost:3900/api/v1/users/login`
- **Acceso**: Público
- **Cuerpo**:
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```
- **Éxito**: `200 OK`
- **Errores**: `400` (Datos faltantes), `401` (Credenciales inválidas).

---

### 2. Usuarios (`/users`)

#### Ver Perfil de Usuario
- **Ruta**: `GET http://localhost:3900/api/v1/users/profile/{id}`
- **Parámetros**: `{id}` (ID del usuario).
- **Acceso**: Autenticado (Token)
- **Éxito**: `200 OK`
- **Errores**: `400` (ID mal formado), `404` (Usuario no encontrado).

#### Listar Usuarios
- **Ruta**: `GET http://localhost:3900/api/v1/users/list`
- **Acceso**: Autenticado (Token)
- **Éxito**: `200 OK`
- **Errores**: `400`.

#### Actualizar Perfil (y, opcionalmente, cambiar contraseña)
- **Ruta**: `PATCH http://localhost:3900/api/v1/users/update`
- **Acceso**: Autenticado (Token)
- **Cuerpo** (todos los campos son opcionales):
```json
{
  "address": "Calle Falsa 123",
  "phone": "+5912345678"
}
```
Para cambiar la contraseña, en vez de (o junto con) los campos anteriores:
```json
{
  "current_password": "claveActual123",
  "new_password": "claveNueva456"
}
```
- **Éxito**: `200 OK`
- **Errores**: `400` (Datos inválidos, o falta `current_password` al enviar `new_password`), `401` (`current_password` incorrecta), `404` (usuario no existe), `409` (Nick ya usado).

#### Subir Avatar
- **Ruta**: `POST http://localhost:3900/api/v1/users/upload`
- **Acceso**: Autenticado (Token)
- **Cuerpo**: `multipart/form-data` (campo `file`).
- **Éxito**: `200 OK`
- **Errores**: `400` (Sin archivo), `415` (Tipo no permitido).

#### Obtener Imagen de Avatar
- **Ruta**: `GET http://localhost:3900/api/v1/users/avatar/{file}`
- **Parámetros**: `{file}` (Nombre del archivo).
- **Acceso**: Público
- **Éxito**: `200 OK` (Archivo imagen).
- **Errores**: `404` (Imagen no encontrada).

#### Ver Publicaciones Guardadas
- **Ruta**: `GET http://localhost:3900/api/v1/users/saved-publications`
- **Acceso**: Autenticado (Token)
- **Params**: `page`, `limit` (opcionales).
- **Éxito**: `200 OK`
- **Errores**: `400`.

#### Guardar una Publicación
- **Ruta**: `POST http://localhost:3900/api/v1/users/saved-publications`
- **Acceso**: Autenticado (Token)
- **Cuerpo**: `{ "publication_id": "..." }`
- **Éxito**: `201 Created`
- **Errores**: `400` (Falta `publication_id`), `404` (La publicación no existe).

#### Quitar una Publicación Guardada
- **Ruta**: `DELETE http://localhost:3900/api/v1/users/saved-publications/{publicationId}`
- **Parámetros**: `{publicationId}`.
- **Acceso**: Autenticado (Token)
- **Éxito**: `204 No Content`. Operación idempotente: si no estaba guardada, también responde `204` (no hay chequeo de existencia).
- **Errores**: —

---

### 3. Publicaciones (`/publications`)

#### Crear Publicación
- **Ruta**: `POST http://localhost:3900/api/v1/publications`
- **Acceso**: Rol `beneficiario` (Token)
- **Cuerpo**:
```json
{
  "text": "Necesito ayuda para mis estudios",
  "necesidades": [
    { "name": "Cuadernos" },
    { "name": "Lápices" }
  ]
}
```
- **Éxito**: `201 Created`
- **Errores**: `400` (Faltan datos), `403` (Solo beneficiarios).

#### Listar Publicaciones
- **Ruta**: `GET http://localhost:3900/api/v1/publications`
- **Acceso**: Autenticado (Token)
- **Params**: `page`, `limit` (opcionales). `status` (opcional, solo tiene efecto para rol `admin`: `pendiente` | `aprobada` | `rechazada`; para cualquier otro rol se ignora y siempre devuelve `aprobada`). `search` (opcional): busca coincidencia de texto en la historia, en el nombre de una necesidad o en el nombre del autor.
- **Éxito**: `200 OK`. Cada publicación incluye `author: { name, nick, image }` con los datos públicos del beneficiario (además de `user_id`, que no cambia).
- **Errores**: `400`.

#### Detalle de Publicación
- **Ruta**: `GET http://localhost:3900/api/v1/publications/{id}`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Autenticado (Token)
- **Éxito**: `200 OK`. Igual que el listado, incluye `author: { name, nick, image }`.
- **Errores**: `400` (ID mal formado), `404` (No encontrada).

#### Editar Publicación
- **Ruta**: `PATCH http://localhost:3900/api/v1/publications/{id}`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Dueño de la publicación (Token)
- **Cuerpo**: `{ "text": "Nuevo texto..." }`
- **Éxito**: `200 OK`
- **Errores**: `400`, `403` (No autorizado), `404`.

#### Eliminar Publicación
- **Ruta**: `DELETE http://localhost:3900/api/v1/publications/{id}`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Dueño de la publicación (Token)
- **Éxito**: `204 No Content`
- **Errores**: `403` (No autorizado), `404`, `409` (Reservas activas).

#### Moderar Publicación
- **Ruta**: `PATCH http://localhost:3900/api/v1/publications/{id}/status`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Rol `admin` (Token)
- **Cuerpo**: `{ "status": "aprobada" }` o `{ "status": "rechazada" }`
- **Éxito**: `200 OK`
- **Errores**: `400`, `403`, `404`, `409` (Ya moderada).

#### Subir Imagen de Publicación
- **Ruta**: `PUT http://localhost:3900/api/v1/publications/{id}/image`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Dueño de la publicación (Token)
- **Cuerpo**: `multipart/form-data` (campo `file`).
- **Éxito**: `200 OK`
- **Errores**: `400`, `403`, `404`, `415` (Tipo no permitido).

#### Obtener Imagen de Publicación
- **Ruta**: `GET http://localhost:3900/uploads/publications/{file}` (archivo estático, fuera de `/api/v1`; el nombre viene en el campo `file` de la publicación).
- **Acceso**: Público
- **Éxito**: `200 OK` (archivo imagen)
- **Errores**: `404` (archivo no encontrado).

#### Publicaciones de un Usuario
- **Ruta**: `GET http://localhost:3900/api/v1/users/{id}/publications`
- **Parámetros**: `{id}` (ID del usuario).
- **Acceso**: Autenticado (Token)
- **Params**: `page`, `limit` (opcionales).
- **Éxito**: `200 OK`. Incluye todas las publicaciones de ese usuario, sin filtrar por `status` (si se consulta sobre uno mismo se ven las propias `pendiente`/`rechazada` también).
- **Errores**: `400`.

---

### 4. Reservaciones (`/reservations`)

#### Reservar un Ítem
- **Ruta**: `POST http://localhost:3900/api/v1/reservations`
- **Acceso**: Rol `donante` (Token)
- **Cuerpo**:
```json
{
  "publication_id": "6ae5b687461f2637882e28ca",
  "item_id": "6ae7b8b9f598b91e5c8cad76"
}
```
- **Éxito**: `201 Created`
- **Errores**: `400`, `403`, `409` (publicación no existe/no aprobada, o ítem no existe/no disponible: todos estos casos devuelven el mismo `409 NEED_NOT_AVAILABLE`, no hay un `404` distinto).

#### Mis Reservaciones
- **Ruta**: `GET http://localhost:3900/api/v1/reservations`
- **Acceso**: Autenticado (Token). Si el rol es `donante`, devuelve las reservas donde es el donante; si es `beneficiario`, las reservas de SUS publicaciones.
- **Params**: `page`, `limit`, `status` (opcionales: `reservado` | `entregado` | `cancelada`).
- **Éxito**: `200 OK`. Cada reserva incluye `donor: { name, nick, image }`, `beneficiary: { name, nick, image }`, `need_name` y `publication_text` (además de `donor_id`/`publication_id`, que no cambian).
- **Errores**: `400`.

#### Detalle de Reservación
- **Ruta**: `GET http://localhost:3900/api/v1/reservations/{id}`
- **Parámetros**: `{id}` (ID de reserva).
- **Acceso**: Participante (Donante/Beneficiario) o Admin (Token)
- **Éxito**: `200 OK`. Igual que el listado, incluye `donor`, `beneficiary`, `need_name`, `publication_text`.
- **Errores**: `403` (No autorizado), `404`.

#### Cambiar Estado de Reserva
- **Ruta**: `PATCH http://localhost:3900/api/v1/reservations/{id}/status`
- **Parámetros**: `{id}` (ID de reserva).
- **Acceso**: `{ "status": "cancelada" }` → solo el donante de la reserva. `{ "status": "entregado" }` → el donante o el beneficiario dueño de la publicación (cualquiera de los dos).
- **Éxito**: `200 OK`
- **Errores**: `400`, `403`, `404`, `409` (Transición inválida; p. ej. la reserva no está en `reservado`).

---

### 5. Notificaciones (`/notifications`)

#### Mis Notificaciones
- **Ruta**: `GET http://localhost:3900/api/v1/notifications`
- **Acceso**: Autenticado (Token)
- **Params**: `read` (`true`/`false`, opcional), `page`, `limit` (opcionales).
- **Éxito**: `200 OK`
- **Errores**: `400`.

#### Marcar como Leída
- **Ruta**: `PATCH http://localhost:3900/api/v1/notifications/{id}`
- **Parámetros**: `{id}` (ID de notificación).
- **Acceso**: Dueño de la notificación (Token)
- **Cuerpo**: `{ "read": true }` (solo se admite `true`).
- **Éxito**: `200 OK`
- **Errores**: `400` (valor distinto de `true`), `403`, `404`.

Las notificaciones las crea el propio servidor como efecto de otras acciones (reserva creada o cancelada, publicación aprobada o rechazada, entrega confirmada); no hay un endpoint para crearlas directamente.
