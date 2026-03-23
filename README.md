# Backend - API REST para To-Do App

API REST construida con NestJS para gestionar tareas, con autenticación JWT y base de datos PostgreSQL.

## Requisitos

- Node.js 20+
- PostgreSQL 16 (o usar Docker)
- npm

## Instalación

```bash
npm install
```

## Configuración

Copia el archivo `.env.example` a `.env` y ajusta las variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_app
JWT_SECRET=tu_clave_secreta_super_segura
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

## Levantar el proyecto

### Con Docker (recomendado)

La forma más rápida es usar Docker Compose, que levanta tanto la base de datos como la API:

```bash
# Levantar todo el stack
docker-compose up -d

# Ver los logs
docker-compose logs -f backend
```


La API estará disponible en `http://localhost:3000`

## Comandos útiles

```bash
# Desarrollo
npm run start:dev




```

## Endpoints

### Autenticación

**POST** `/v1/register`
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456"
}
```

**POST** `/v1/login`
```json
{
  "email": "juan@example.com",
  "password": "123456"
}
```

Respuesta:
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "...",
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

### Tareas (requieren autenticación)

Todas las peticiones deben incluir el header:
```
Authorization: Bearer {tu_token}
```

**POST** `/v1/todo/create`
```json
{
  "nombre": "Completar proyecto",
  "descripcion": "Finalizar features pendientes",
  "prioridad": "alta"
}
```

**GET** `/v1/todo/list?page=1&limit=10&prioridad=alta&finalizada=false`

Parámetros opcionales:
- `page`: número de página (default: 1)
- `limit`: items por página (default: 10, max: 50)
- `prioridad`: filtro por prioridad (baja, media, alta)
- `finalizada`: filtro por estado (true/false)

**GET** `/v1/todo/list/:id`

Obtiene una tarea específica.

**PATCH** `/v1/todo/update/:id`
```json
{
  "nombre": "Nuevo nombre",
  "prioridad": "media",
  "finalizada": true
}
```

**DELETE** `/v1/todo/list/:id`

## Estructura del proyecto

```
src/
├── auth/              # Módulo de autenticación
│   ├── guards/       # Guards de JWT
│   ├── strategies/   # Estrategia JWT
│   └── dto/          # DTOs de auth
├── todo/             # Módulo de tareas
│   ├── dto/          # DTOs de tareas
│   └── entities/     # Entidades
├── users/            # Módulo de usuarios
├── prisma/           # Servicio de Prisma
└── main.ts           # Entry point

prisma/
├── schema.prisma     # Schema de la BD
└── migrations/       # Migraciones
```

## Tecnologías

- **NestJS** - Framework backend
- **Prisma** - ORM
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **class-validator** - Validación de datos

## Notas

- El token JWT expira en 24 horas
- Las contraseñas se hashean con bcrypt (10 rounds)
- Las tareas son privadas por usuario (solo puedes ver/editar/borrar las tuyas)
- La paginación tiene un límite máximo de 50 items por página
