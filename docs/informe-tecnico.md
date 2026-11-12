# Informe Técnico de la API - Robin (v1.0.0)

Este documento describe la arquitectura, el contrato de la API y los estándares de implementación del backend de la plataforma Robin.

---

## 1. Especificación de Endpoints

### 🔐 Autenticación (bajo `/users`; no existe un prefijo `/auth`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/users/register` | `{name, surname, nick, email, password, role}` (`role`: `beneficiario`\|`donante`) | Público | 201 | 400, 409 |
| POST | `/users/login` | `{email, password}` | Público | 200 | 400, 401 |

### 👤 Usuarios (`/users`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| GET | `/users/profile/{id}` | — | Autenticado | 200 | 400, 404 |
| GET | `/users/list` | Query: `page, limit` | Autenticado | 200 | 400 |
| PATCH | `/users/update` | `{name, surname, nick, address, phone}` opcionales; `{current_password, new_password}` opcionales para cambiar clave | Autenticado | 200 | 400, 401, 404, 409 |
| POST | `/users/upload` | `multipart/form-data` (campo `file`) | Autenticado | 200 | 400, 415 |
| GET | `/users/avatar/{file}` | — | Público | 200 | 404 |
| GET | `/users/saved-publications` | Query: `page, limit` | Autenticado | 200 | 400 |
| POST | `/users/saved-publications` | `{publication_id}` | Autenticado | 201 | 400, 404 |
| DELETE | `/users/saved-publications/{publicationId}` | — | Autenticado | 204 | — |
| GET | `/users/{id}/publications` | Query: `page, limit` | Autenticado | 200 | 400 |

### 📦 Publicaciones (`/publications`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/publications` | `{text, necesidades: [{name}]}` | Beneficiario | 201 | 400, 403 |
| GET | `/publications` | Query: `page, limit, status` (solo admin), `search` | Autenticado | 200 | 400 |
| GET | `/publications/{id}` | — | Autenticado | 200 | 400, 404 |
| PATCH | `/publications/{id}` | `{text, necesidades}` | Dueño | 200 | 400, 403, 404 |
| DELETE | `/publications/{id}` | — | Dueño | 204 | 403, 404, 409 (reservas activas) |
| PATCH | `/publications/{id}/status` | `{status}` | Admin | 200 | 400, 403, 404, 409 |
| PUT | `/publications/{id}/image` | `multipart/form-data` | Dueño | 200 | 400, 403, 404, 415 |

### 🤝 Reservaciones (`/reservations`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/reservations` | `{publication_id, item_id}` | Donante | 201 | 400, 403, 409 |
| GET | `/reservations` | Query: `status, page, limit` | Autenticado | 200 | 400 |
| GET | `/reservations/{id}` | — | Participante/Admin | 200 | 403, 404 |
| PATCH | `/reservations/{id}/status` | `{status}`: `cancelada` (solo donante) o `entregado` (dueño o donante) | Participante | 200 | 400, 403, 404, 409 |

### 🔔 Notificaciones (`/notifications`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| GET | `/notifications` | Query: `read, page, limit` | Autenticado | 200 | 400 |
| PATCH | `/notifications/{id}` | `{read: true}` | Dueño | 200 | 400, 403, 404 |

> `POST /reservations` nunca devuelve `404`: si la publicación o el ítem no existen, el repositorio no encuentra coincidencia en el `findOneAndUpdate` atómico y el servicio responde el mismo `409 NEED_NOT_AVAILABLE` que usa para "ya está reservado".

---

## 2. Gestión de Respuestas y Errores

### Tabla de Códigos de Estado
| Código | Uso en la API |
|---|---|
| **200** | Consulta o modificación exitosa. |
| **201** | Recurso creado exitosamente (User, Publication, Reservation). |
| **204** | Recurso eliminado exitosamente (sin cuerpo). |
| **400** | Petición mal formada, campos faltantes o IDs inválidos. |
| **401** | Token ausente, inválido o expirado. |
| **403** | Usuario autenticado pero sin permisos (Rol o Propiedad). |
| **404** | Recurso no encontrado. |
| **409** | Conflicto de estado (Ej: Ítem ya reservado o transición inválida). |
| **415** | Tipo de archivo no permitido en subidas. |
| **500** | Error inesperado del servidor. |

### Formato de Respuesta Estándar
Todas las respuestas utilizan un "sobre" JSON para consistencia:

**Éxito:**
```json
{ 
  "status": "success", 
  "statusCode": 200, 
  "data": { ... }, 
  "meta": { "page": 1, "limit": 10, "total": 100, "pages": 10 } 
}
```

**Error:**
```json
{ 
  "status": "error", 
  "statusCode": 409, 
  "error": { "code": "NEED_NOT_AVAILABLE", "message": "...", "details": [] } 
}
```

---

## 3. Ejemplos de Carga Útil (Payloads)

### Caso: Reservar un ítem (Éxito)
**Petición:** `POST /api/v1/reservations`
```json
{
  "publication_id": "6ae5b687461f2637882e28ca",
  "item_id": "6ae7b8b9f598b91e5c8cad76"
}
```
**Respuesta:** `201 Created`
```json
{
  "status": "success",
  "statusCode": 201,
  "data": {
    "_id": "6ae8fc710a6623739cc888ff",
    "publication_id": "6ae5b687461f2637882e28ca",
    "item_id": "6ae7b8b9f598b91e5c8cad76",
    "status": "reservado",
    "reserved_at": "2026-11-02T21:11:13.743Z"
  }
}
```

### Caso: Error de Permisos (Forbidden)
**Petición:** `DELETE /api/v1/publications/{id}` (Siendo un usuario que no es el dueño).
**Respuesta:** `403 Forbidden`
```json
{
  "status": "error",
  "statusCode": 403,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para eliminar esta publicación",
    "details": []
  }
}
```

---

## 4. Arquitectura y Responsabilidades

### Diagrama de Flujo de Capas
`routes` $\rightarrow$ `middlewares` $\rightarrow$ `controllers` $\rightarrow$ `services` $\rightarrow$ `repositories` $\rightarrow$ `models` $\rightarrow$ `MongoDB`

### Estructura de Carpetas
```text
src/
├── server.ts                  # 🚀 Arranque (Entry Point)
├── app.ts                     # ⚙️ Configuración Global (Express, Middlewares Globales)
│
├── routes/                    # 🟢 CAPA: ROUTES (Asocia Verbo/Ruta → Controller)
│   ├── user.ts                # Rutas de usuarios (incluye guardados y /users/:id/publications)
│   ├── publication.ts         # Rutas de publicaciones
│   ├── reservation.ts         # Rutas de reservas
│   └── notification.ts        # Rutas de notificaciones
│
├── middlewares/               # 🌑 CAPA: MIDDLEWARES (Validación de Token, Rol y Payload)
│   ├── auth.ts                # Verificación de JWT
│   ├── roles.ts              # Control de acceso por rol
│   ├── upload.ts              # Manejo de archivos de avatar (Multer)
│   └── errorHandler.ts       # Manejador global de errores
│
├── controllers/               # 🟢 CAPA: CONTROLLERS (HTTP → Servicio → Respuesta)
│   ├── user.ts                # Lógica de entrada/salida de Usuarios
│   ├── publication.ts         # Lógica de entrada/salida de Publicaciones
│   ├── reservation.ts        # Lógica de entrada/salida de Reservas
│   └── notification.ts        # Lógica de entrada/salida de Notificaciones
│
├── services/                  # 🟠 CAPA: SERVICES (Lógica de Negocio y Permisos de Propiedad)
│   ├── auth.service.ts        # Lógica de autenticación
│   ├── user.service.ts        # Reglas de negocio de Usuarios
│   ├── publication.service.ts # Reglas de negocio de Publicaciones
│   ├── reservation.service.ts  # Reglas de negocio de Reservas
│   ├── notification.service.ts # Reglas de negocio de Notificaciones
│   └── jwt.ts                 # Gestión de tokens (Lógica de servicio)
│
├── repositories/               # 🌑 CAPA: REPOSITORIES (Consultas Atómicas y Persistencia)
│   ├── user.repository.ts      # Consultas MongoDB de Usuarios
│   ├── publication.repository.ts # Consultas MongoDB de Publicaciones
│   ├── reservation.repository.ts # Consultas MongoDB de Reservas
│   └── notification.repository.ts # Consultas MongoDB de Notificaciones
│
├── models/                    # 🌑 CAPA: MODELS / MongoDB (Esquemas y Tipos)
│   ├── user.ts                # Esquema de Usuario
│   ├── publication.ts         # Esquema de Publicación
│   ├── reservation.ts          # Esquema de Reserva
│   └── notification.ts         # Esquema de Notificación
│
├── types/                     # 🛠️ TIPADO (Específico de TypeScript)
│   ├── domain.ts              # Tipos y Enums del dominio (Roles, Estados)
│   └── express.d.ts           # Extensión de Request para incluir req.user
│
├── utils/                     # 🛠️ Soporte: Utilidades transversales
│   ├── response.ts            # Constructor del sobre de respuesta
│   ├── AppError.ts            # Clase de errores de negocio
│   ├── serializePublication.ts # Serialización compartida de publicaciones (autor poblado)
│   └── escapeRegex.ts         # Escapa texto de usuario antes de usarlo en un $regex de Mongo
│
└── database/                  # ⚙️ Configuración de Base de Datos
    └── connection.ts           # Gestión de conexión a MongoDB
```
> No hay una carpeta `validators/` separada: la validación de entrada ocurre inline en controllers/services con `AppError`. `src/helpers/validate.ts`, heredado de la base original, quedó sin uso tras la migración a TypeScript y se eliminó del repositorio.

### 🔄 Recorrido de una Petición (Ejemplo: Reservar Ítem)

A continuación se describe la travesía de una petición `POST /api/v1/reservations`.

| Capa | Archivo | ¿Qué ocurre? | Si falla... |
| :--- | :--- | :--- | :--- |
| **Routes** | `routes/reservation.ts` | Recibe la petición y verifica que el verbo sea `POST`. Encadena `auth`, `roles(["donante"])` y el controlador. | — |
| **Middleware** | `middlewares/auth.ts` | Extrae el token Bearer, lo valida y adjunta el usuario al objeto `req.user`. | **401 Unauthorized**: Token inválido o ausente. |
| **Middleware** | `middlewares/roles.ts` | Verifica que `req.user.role` sea `donante`. | **403 Forbidden**: Si el rol autenticado no es donante. |
| **Controller**| `controllers/reservation.ts` | Extrae `publication_id` e `item_id` del cuerpo. Llama al servicio de reservas. | **400 Bad Request**: Si faltan campos obligatorios (lanza `AppError`). |
| **Service** | `services/reservation.service.ts`| Pide la reserva atómica al repositorio de publicaciones y, si hay coincidencia, crea el documento de reserva y notifica al beneficiario. | **409 Conflict**: Si el repositorio no encontró coincidencia (publicación no aprobada, o ítem inexistente/no disponible). |
| **Repository**| `repositories/publication.repository.ts` + `repositories/reservation.repository.ts` | Ejecuta el `findOneAndUpdate` atómico sobre la publicación y, si tuvo éxito, inserta el documento de reserva. | **500 Internal Error**: Fallo de conexión o error de base de datos. |
| **Models** | `models/publication.ts` | Mongoose traduce la condición y el `$set` a una operación atómica de MongoDB. | — |
| **Response** | `utils/response.ts` | El controlador recibe el resultado y usa `sendSuccess` para envolver la data en el sobre estándar. | — |

#### 💻 Fragmentos Relevantes del Flujo

```typescript
// 1. ROUTE: Definición del endpoint
// src/routes/reservation.ts
router.post("/", auth, roles(["donante"]), ReservationController.create);
// Enlace: Ruta -> Auth -> Rol -> Controller

// 2. CONTROLLER: Traducción HTTP -> Servicio
// src/controllers/reservation.ts
async create(req: Request, res: Response, next: NextFunction) {
    try {
        const { publication_id, item_id } = req.body;
        if (!publication_id || !item_id) {
            throw new AppError("VALIDATION_ERROR", 400, "El publication_id y el item_id son obligatorios");
        }
        const donorId = req.user!.id; // viene del token, no del cuerpo
        const reservation = await reservationService.createReservation(donorId, publication_id, item_id);
        sendSuccess(res, { _id: reservation._id, publication_id: reservation.publication_id,
            item_id: reservation.item_id, status: reservation.status, reserved_at: reservation.reserved_at }, 201);
    } catch (error) {
        next(error); // Propaga el error al errorHandler
    }
}

// 3. SERVICE: Reglas de negocio y validación de estado
// src/services/reservation.service.ts
async createReservation(donorId, publicationId, itemId) {
    // Actualización condicionada: solo marca "reservado" si la publicación está
    // "aprobada" y el ítem sigue "disponible". Si no, no devuelve nada.
    const publication = await publicationRepository.atomicReserveItem(publicationId, itemId);
    if (!publication) {
        throw new AppError("NEED_NOT_AVAILABLE", 409, "La necesidad fue reservada");
    }
    try {
        const reservation = await reservationRepository.create({ publication_id: publicationId, item_id: itemId, donor_id: donorId, status: "reservado" });
        await notificationService.createNotification(publication.user_id.toString(), "confirmación", "Un donante ha reservado el ítem...");
        return reservation;
    } catch (error) {
        // Sin transacciones multi-documento: si falla la creación de la reserva,
        // se revierte manualmente el ítem a "disponible".
        await publicationRepository.updateItemStatus(publicationId, itemId, "disponible");
        throw error;
    }
}

// 4. REPOSITORY: Operación atómica en MongoDB
// src/repositories/publication.repository.ts
async atomicReserveItem(publicationId, itemId) {
    return await Publication.findOneAndUpdate(
        { _id: publicationId, status: "aprobada",
          necesidades: { $elemMatch: { _id: itemId, status: "disponible" } } },
        { $set: { "necesidades.$.status": "reservado" } },
        { new: true }
    ).select("-__v");
}
```


### Reglas de Oro de la Arquitectura
1. **Dependencia Unidireccional**: Las capas solo pueden llamar a la capa inmediatamente inferior.
2. **Aislamiento de Express**: Los `services` y `repositories` no conocen `req` ni `res`.
3. **Centralización de Errores**: Solo el `errorHandler` middleware construye la respuesta de error final.
4. **Capa de Persistencia**: Los controladores nunca acceden a los modelos; deben pasar por el servicio y el repositorio.

---

## 5. Persistencia y Credenciales

### Modelo de Datos
- **Usuarios**: Colección independiente. Incluye `saved_publications` (referencias a `Publication`, para "Guardados").
- **Publicaciones**: Colección con necesidades **embebidas** (para optimizar lecturas del feed).
- **Reservaciones**: Colección independiente vinculando Donante e Ítem.
- **Notificaciones**: Colección independiente para alertas (`type`: `confirmación` | `alerta pendiente` | `conflicto`).

### Manejo de Credenciales
- **Cero Hardcoding**: Todas las credenciales (`MONGODB_URI`, `JWT_SECRET`) residen en el archivo `.env`.
- **Seguridad**: El archivo `.env` está incluido en `.gitignore`.
- **Reproducibilidad**: Se proporciona un archivo `.env.example` con las claves necesarias para el despliegue.
