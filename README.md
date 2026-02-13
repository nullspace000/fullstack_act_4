# Tienda de Productos - JWT Authentication

## Descripción

Aplicación web para gestión de productos con autenticación JWT. Permite a los usuarios ver productos y al administrador crear, actualizar y eliminar productos.

## Tecnologías

- **Backend**: Node.js + Express.js
- **Base de Datos**: SQLite (better-sqlite3)
- **Autenticación**: JWT (JSON Web Token)
- **Frontend**: HTML + CSS + JavaScript vanilla
- **Pruebas**: Jest + Supertest
- **Despliegue**: Vercel + GitHub Actions

## Requisitos

- Node.js v18 o superior
- npm o yarn

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/fullstack_act_4.git
cd fullstack_act_4

# Instalar dependencias
npm install
```

## Configuración

Crear archivo `.env` con las siguientes variables:

```env
JWT_SECRET=tu_secreto_jwt_seguro_aqui
JWT_EXPIRES_IN=1h
PORT=3000
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Usuario Admin

Para acceder como administrador:

1. Primero registra un usuario (o usa el existente)
2. Username: `admin`
3. Password: `admin1234`

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Inicio de sesión |
| POST | `/api/register` | Registro de usuario |

### Productos
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/products` | Listar productos | Público |
| POST | `/api/products` | Crear producto | Admin |
| PUT | `/api/products/:id` | Actualizar producto | Admin |
| DELETE | `/api/products/:id` | Eliminar producto | Admin |

## Pruebas

```bash
# Ejecutar pruebas
npm test

# Modo watch
npm run test:watch
```

## Despliegue en Vercel

### Opción 1: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel --prod
```

### Opción 2: GitHub Integration

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Importar tu repositorio de GitHub
4. Configurar las variables de entorno:
   - `JWT_SECRET`: Tu secreto JWT
5. Click "Deploy"

## Pipeline CI/CD

El proyecto incluye un pipeline de GitHub Actions que:

1. **En cada push**:
   - Instala dependencias
   - Ejecuta pruebas con Jest

2. **En push a main**:
   - Ejecuta pruebas
   - Despliega automáticamente a Vercel

## Estructura del Proyecto

```
/
├── .github/workflows/     # CI/CD pipeline
├── db/                    # Base de datos SQLite
├── front/                 # Archivos frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
├── tests/                 # Pruebas unitarias
│   └── api.test.js
├── server.js              # Servidor principal
├── package.json           # Dependencias
├── vercel.json            # Configuración Vercel
├── .env                   # Variables de entorno
└── README.md              # Este archivo
```

## Licencia

ISC
