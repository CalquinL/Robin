# Interfaz de programación — API Robin (v1.0.0)

**Base:** `/api/v1` · **Auth:** `Authorization: Bearer <token>` · `401`/`500` aplican a todo endpoint autenticado y no se repiten abajo.

**Sobre de respuesta** — éxito: `{ status, statusCode, data, meta? }` · error: `{ status, statusCode, error: { code, message, details? } }`

## Auth (bajo `/users`)

| Verbo | Ruta | Cuerpo | Éxito | Error |
|---|---|---|---|---|
| POST | `/users/register` | `{name,surname,nick,email,password,role}` | 201 | 400, 409 |
| POST | `/users/login` | `{email,password}` | 200 | 400, 401 |

## Users

| Verbo | Ruta | Parámetros | Cuerpo | Éxito | Error |
|---|---|---|---|---|---|
| GET | `/users/profile/{id}` | `id` | — | 200 | 400, 404 |
| GET | `/users/list` | — | — | 200 | 400 |
| PATCH | `/users/update` | — | `{address?,phone?}` o `{current_password,new_password}` | 200 | 400, 401, 404, 409 |
| POST | `/users/upload` | — | `multipart/form-data` (`file`) | 200 | 400, 415 |
| GET | `/users/avatar/{file}` | `file` | — | 200 | 404 |
| GET | `/users/saved-publications` | `page,limit` | — | 200 | 400 |
| POST | `/users/saved-publications` | — | `{publication_id}` | 201 | 400, 404 |
| DELETE | `/users/saved-publications/{publicationId}` | `publicationId` | — | 204 | — |
| GET | `/users/{id}/publications` | `id; page,limit` | — | 200 | 400 |

## Publications

| Verbo | Ruta | Parámetros | Cuerpo | Éxito | Error |
|---|---|---|---|---|---|
| POST | `/publications` | — | `{text, necesidades:[{name}]}` | 201 | 400, 403 |
| GET | `/publications` | `page,limit,status?,search?` | — | 200 | 400 |
| GET | `/publications/{id}` | `id` | — | 200 | 400, 404 |
| PATCH | `/publications/{id}` | `id` | `{text}` | 200 | 400, 403, 404 |
| DELETE | `/publications/{id}` | `id` | — | 204 | 403, 404, 409 |
| PATCH | `/publications/{id}/status` | `id` | `{status: aprobada\|rechazada}` | 200 | 400, 403, 404, 409 |
| PUT | `/publications/{id}/image` | `id` | `multipart/form-data` (`file`) | 200 | 400, 403, 404, 415 |

## Reservations

| Verbo | Ruta | Parámetros | Cuerpo | Éxito | Error |
|---|---|---|---|---|---|
| POST | `/reservations` | — | `{publication_id,item_id}` | 201 | 400, 403, 409 |
| GET | `/reservations` | `page,limit,status?` | — | 200 | 400 |
| GET | `/reservations/{id}` | `id` | — | 200 | 403, 404 |
| PATCH | `/reservations/{id}/status` | `id` | `{status: cancelada\|entregado}` | 200 | 400, 403, 404, 409 |

## Notifications

| Verbo | Ruta | Parámetros | Cuerpo | Éxito | Error |
|---|---|---|---|---|---|
| GET | `/notifications` | `read?,page,limit` | — | 200 | 400 |
| PATCH | `/notifications/{id}` | `id` | `{read: true}` | 200 | 400, 403, 404 |

Detalle completo (reglas de negocio, casos especiales por rol en documentación Hito 2): [informe-Hito2](/docs/informe-Hito2.pdf). 
