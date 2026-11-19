# SkillVibes Backend

API REST de **SkillVibes**, un marketplace de tutorías y mentorías 1 a 1 enfocado en programación y desarrollo de software. Conecta a estudiantes que necesitan aprender o resolver dudas técnicas con tutores especializados en lenguajes, frameworks, bases de datos y arquitectura.

Proyecto final de **Electiva 1**, construido con **NestJS**, **TypeORM** y **PostgreSQL**.

## Tecnologías

| Herramienta | Uso |
|---|---|
| NestJS 11 | Framework backend (módulos, controladores, servicios, inyección de dependencias) |
| TypeORM + PostgreSQL 16 | Persistencia de datos mediante entidades |
| class-validator / class-transformer | Validación de DTOs y serialización de respuestas |
| Passport + JWT | Autenticación con token |
| bcrypt | Cifrado de contraseñas |
| Docker Compose | Base de datos local |

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Postman, Insomnia o similar para probar la API

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/benavidesandres/Skill_vibe_backend.git
cd Skill_vibe_backend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env

# 4. Levantar PostgreSQL con Docker
docker compose up -d

# 5. Ejecutar la API en modo desarrollo
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api/v1`.

## Configuración de la base de datos

La base de datos corre en un contenedor de Docker definido en `docker-compose.yml`. Usa las mismas variables del `.env`, así que la API y el contenedor siempre tienen las mismas credenciales.

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | Puerto expuesto en tu PC |
| `DB_USERNAME` | `skillvibes` | Usuario |
| `DB_PASSWORD` | `skillvibes` | Contraseña |
| `DB_NAME` | `skillvibes_db` | Nombre de la base de datos |
| `DB_SYNCHRONIZE` | `true` | Crea/actualiza las tablas a partir de las entidades (solo desarrollo) |
| `JWT_SECRET` | — | Secreto para firmar los tokens (cámbialo) |
| `JWT_EXPIRES_IN` | `1d` | Tiempo de vida del token |
| `VIDEO_BASE_URL` | `http://localhost:3000` | URL desde la que se sirve `sala.html`; es la base de los links de videollamada (la barra final se ignora) |

> **¿Ya tienes PostgreSQL instalado en tu PC?** Ocupa el puerto 5432 y la API se conectará a esa instalación en lugar de Docker (error *"password authentication failed"*). Cambia `DB_PORT=5433` en tu `.env` y ejecuta `docker compose up -d --force-recreate`.

Comandos útiles:

```bash
docker compose ps        # ver el estado del contenedor
docker compose stop      # detener la base de datos
docker compose down -v   # eliminar contenedor y datos (empezar desde cero)
```

## Estructura del proyecto

```
src/
├── config/
│   └── database.config.ts       # Configuración de TypeORM desde el .env
├── modules/
│   ├── auth/                    # Registro, login y protección de rutas con JWT
│   │   ├── decorators/          # @CurrentUser()
│   │   ├── dto/                 # RegisterDto, LoginDto
│   │   ├── guards/              # JwtAuthGuard
│   │   ├── interfaces/          # JwtPayload, AuthResponse
│   │   └── strategies/          # JwtStrategy (Passport)
│   ├── users/                   # Entidad User y gestión de usuarios
│   │   ├── dto/
│   │   ├── entities/
│   │   └── enums/
│   ├── skills/                  # Ofertas de tutoría, catálogo y perfil público del tutor
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── enums/
│   │   └── interfaces/
│   ├── bookings/                # Reservas y su flujo de estados
│   ├── reviews/                 # Reseñas y rating de las ofertas
│   ├── video/                   # VideoRoomProvider y la sala simulada
│   └── recommendations/
├── common/
│   └── transformers/            # decimalTransformer (decimal de PostgreSQL a number)
├── app.module.ts
└── main.ts                      # Prefijo /api/v1, ValidationPipe, serialización global y public/
public/
└── sala.html                    # Sala de videollamada simulada, en /sala.html
```

`public/` se sirve como archivos estáticos desde la raíz (`http://localhost:3000/sala.html`), fuera del prefijo `/api/v1` y sin token.

## Endpoints

Las rutas marcadas con 🔒 requieren el header:

```
Authorization: Bearer <accessToken>
```

### Autenticación — `/api/v1/auth`

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| POST | `/auth/register` | Crea una cuenta y devuelve un token | 201 |
| POST | `/auth/login` | Inicia sesión y devuelve un token | 200 |
| GET | `/auth/profile` 🔒 | Datos del usuario autenticado | 200 |

**Registro** — `POST /api/v1/auth/register`

```json
{
  "fullName": "Ana Pérez",
  "email": "ana@correo.com",
  "password": "12345678",
  "role": "student"
}
```

`role` es opcional: `student` (por defecto) o `tutor`. También se puede enviar `bio` (máximo 500 caracteres), que se muestra en el perfil público del tutor.

**Login** — `POST /api/v1/auth/login`

```json
{
  "email": "ana@correo.com",
  "password": "12345678"
}
```

Respuesta de registro y login:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "43d60641-62b0-4152-a70a-c624538e147b",
    "fullName": "Ana Pérez",
    "email": "ana@correo.com",
    "role": "student",
    "isActive": true,
    "createdAt": "2026-11-19T02:57:54.271Z",
    "updatedAt": "2026-11-19T02:57:54.271Z"
  }
}
```

La contraseña se guarda cifrada con bcrypt y **nunca** se incluye en las respuestas.

### Usuarios — `/api/v1/users` 🔒

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| GET | `/users` | Lista todos los usuarios | 200 |
| GET | `/users/:id` | Obtiene un usuario por id | 200 |
| PATCH | `/users/:id` | Actualiza la propia cuenta (campos parciales) | 200 |
| DELETE | `/users/:id` | Elimina la propia cuenta | 204 |

### Ofertas de tutoría — `/api/v1/skills`

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| GET | `/skills` | Catálogo de ofertas activas, con filtros y paginación | 200 |
| GET | `/skills/mine` 🔒 tutor | Ofertas del tutor autenticado, también las pausadas | 200 |
| GET | `/skills/:id` | Detalle de una oferta | 200 |
| GET | `/skills/:id/reviews` | Reseñas de una oferta | 200 |
| POST | `/skills` 🔒 tutor | Publica una oferta | 201 |
| PATCH | `/skills/:id` 🔒 tutor | Edita o pausa una oferta propia | 200 |
| DELETE | `/skills/:id` 🔒 tutor | Elimina una oferta propia | 204 |

**Publicar** — `POST /api/v1/skills`

```json
{
  "title": "React desde cero",
  "description": "Componentes, hooks y manejo de estado",
  "category": "frontend",
  "level": "beginner",
  "technology": "React",
  "pricePerHour": 25.5
}
```

- `category`: `frontend`, `backend`, `mobile`, `database`, `devops`, `data` u `other`.
- `level`: `beginner`, `intermediate` o `advanced`.
- Para pausar una oferta: `PATCH /skills/:id` con `{ "isActive": false }`. Una oferta pausada no sale en el catálogo ni se puede reservar.

**Filtros del catálogo** (todos opcionales):

| Parámetro | Ejemplo | Descripción |
|---|---|---|
| `search` | `react` | Busca en título, descripción y tecnología |
| `category` | `backend` | Categoría |
| `level` | `beginner` | Nivel |
| `technology` | `NestJS` | Tecnología exacta (sin distinguir mayúsculas) |
| `minPrice`, `maxPrice` | `10`, `50` | Rango de precio por hora |
| `tutorId` | `uuid` | Ofertas de un tutor |
| `sort` | `price_asc` | `recent` (por defecto), `price_asc`, `price_desc` o `rating` |
| `page`, `limit` | `1`, `10` | Paginación (`limit` máximo 50) |

Ejemplo: `GET /api/v1/skills?search=react&minPrice=10&sort=price_asc&page=1`

```json
{
  "data": [
    {
      "id": "d731d575-719e-4397-ae9a-d017ec7d219a",
      "title": "React desde cero",
      "category": "frontend",
      "level": "beginner",
      "technology": "React",
      "pricePerHour": 25.5,
      "averageRating": 4,
      "reviewsCount": 1,
      "tutor": { "id": "d7dfdfa8-...", "fullName": "Tutor Uno", "bio": "Dev React" }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Tutores — `/api/v1/tutors`

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| GET | `/tutors/:id` | Perfil público: nombre, bio, ofertas activas y rating general | 200 |

El rating general es el promedio de todas sus ofertas, ponderado por la cantidad de reseñas de cada una.

### Reservas — `/api/v1/bookings` 🔒

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| POST | `/bookings` 🔒 estudiante | Reserva una oferta | 201 |
| GET | `/bookings/mine` | Estudiante: sus reservas. Tutor: las reservas de sus ofertas | 200 |
| GET | `/bookings/:id` | Detalle (solo el estudiante y el tutor de la reserva) | 200 |
| PATCH | `/bookings/:id/status` | Cambia el estado de la reserva | 200 |

**Reservar** — `POST /api/v1/bookings`

```json
{
  "skillId": "d731d575-719e-4397-ae9a-d017ec7d219a",
  "scheduledAt": "2026-12-10T15:00:00Z",
  "hours": 2,
  "message": "Quiero repasar useEffect"
}
```

`hours` va de 1 a 4 y la fecha tiene que ser futura. `totalPrice` se calcula al reservar (precio por hora × horas) y no cambia si el tutor edita el precio después.

**Cambiar estado** — `PATCH /api/v1/bookings/:id/status` con `{ "status": "confirmed" }`

| Quién | Desde | Hacia |
|---|---|---|
| Tutor | `pending` | `confirmed` o `rejected` |
| Tutor | `confirmed` | `completed` |
| Estudiante | `pending` o `confirmed` | `cancelled` |

Cualquier otro cambio responde 400.

### Reseñas — `/api/v1/reviews`

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| POST | `/reviews` 🔒 estudiante | Reseña una reserva completada | 201 |

```json
{
  "bookingId": "68dccba5-2283-49b7-930b-e0af6176c161",
  "rating": 4,
  "comment": "Explica muy claro"
}
```

`rating` va de 1 a 5. Solo hay una reseña por reserva, y al guardarla se actualizan `averageRating` y `reviewsCount` de la oferta.

### Roles en otros módulos

Para que una ruta sea solo de un rol:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TUTOR)
```

`RolesGuard` está en `auth/guards/` y `@Roles()` en `auth/decorators/`.

### Errores

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos inválidos, id que no es UUID, fecha pasada, oferta pausada o cambio de estado no permitido |
| 401 | Credenciales incorrectas, token ausente, inválido o expirado |
| 403 | Rol sin permiso para la ruta, o modificar recursos de otro usuario (cuenta, oferta, reserva) |
| 404 | El recurso no existe |
| 409 | El email ya está registrado, o la reserva ya tiene reseña |

## Flujo de trabajo con Git

- `main`: versión estable. **No se sube nada directamente.**
- `develop`: rama por defecto donde se integran las funcionalidades.
- `feature/<nombre>` y `docs/<nombre>`: una rama por funcionalidad, creada desde `develop` e integrada mediante Pull Request.
