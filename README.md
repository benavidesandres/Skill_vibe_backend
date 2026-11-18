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
│   ├── skills/
│   └── recommendations/
├── app.module.ts
└── main.ts                      # Prefijo /api/v1, ValidationPipe y serialización global
```

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

`role` es opcional: `student` (por defecto) o `tutor`.

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

### Errores

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos inválidos en el body, campos no permitidos o id que no es UUID |
| 401 | Credenciales incorrectas, token ausente, inválido o expirado |
| 403 | Intentar modificar o eliminar la cuenta de otro usuario |
| 404 | El recurso no existe |
| 409 | El email ya está registrado |

## Flujo de trabajo con Git

- `main`: versión estable. **No se sube nada directamente.**
- `develop`: rama por defecto donde se integran las funcionalidades.
- `feature/<nombre>` y `docs/<nombre>`: una rama por funcionalidad, creada desde `develop` e integrada mediante Pull Request.
