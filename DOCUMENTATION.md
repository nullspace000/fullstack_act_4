# Documentación del Proyecto - Tienda de Productos

## Descripción General

Esta es una aplicación web para la gestión de productos que permite a los usuarios autenticados agregar, modificar, ver y eliminar productos. La aplicación implementa un sistema CRUD completo y utiliza JWT (JSON Web Token) para proteger las rutas específicas.

## Requerimientos Funcionales

### Gestión de Productos
- **RF-01**: Como usuario, puedo ver todos los productos disponibles en la tienda.
  - Prioridad: Alta
  - Acceso: Público (sin autenticación)

- **RF-02**: Como usuario administrador, puedo agregar nuevos productos a la tienda.
  - Prioridad: Alta
  - Acceso: Autenticado (solo usuario admin)
  - Campos requeridos: nombre, precio, descripción

- **RF-03**: Como usuario administrador, puedo modificar los productos existentes.
  - Prioridad: Alta
  - Acceso: Autenticado (solo usuario admin)

- **RF-04**: Como usuario administrador, puedo eliminar productos de la tienda.
  - Prioridad: Media
  - Acceso: Autenticado (solo usuario admin)

### Autenticación y Autorización
- **RF-05**: Como usuario, puedo registrarme en la plataforma.
  - Prioridad: Media
  - Campos: username, contraseña

- **RF-06**: Como usuario registrado, puedo iniciar sesión en la plataforma.
  - Prioridad: Alta
  - Mecanismo: JWT (JSON Web Token)

- **RF-07**: Como usuario autenticado, puedo cerrar sesión.
  - Prioridad: Baja
  - Acceso: Autenticado

- **RF-08**: El sistema debe restringir las operaciones CRUD solo al usuario administrador.
  - Prioridad: Alta
  - Roles: Usuario normal (solo lectura), Administrador (control total)

## Requerimientos No Funcionales

### Rendimiento
- **RNF-01**: El tiempo de respuesta para consultas de productos debe ser menor a 2 segundos.
- **RNF-02**: El sistema debe soportar múltiples solicitudes concurrentes.

### Seguridad
- **RNF-03**: Las contraseñas deben ser almacenadas de forma encriptada (bcrypt).
- **RNF-04**: Los tokens JWT deben tener una expiración de 1 hora.
- **RNF-05**: Las rutas sensibles deben estar protegidas mediante middleware de autenticación.

### Usabilidad
- **RNF-06**: La interfaz debe ser intuitiva y fácil de usar.
- **RNF-07**: El sistema debe proporcionar mensajes de error claros.

### Mantenibilidad
- **RNF-08**: El código debe estar bien documentado.
- **RNF-09**: Se deben implementar pruebas unitarias con Jest.
- **RNF-10**: El proyecto debe tener integración continua (CI/CD).

### Compatibilidad
- **RNF-11**: La aplicación debe ser compatible con los navegadores modernos (Chrome, Firefox, Edge).
- **RNF-12**: El diseño debe ser responsivo para diferentes tamaños de pantalla.

## Diagrama Entidad-Relación

```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │    products     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ id (PK)         │
│ username (UQ)   │  1:N    │ name            │
│ password        │         │ price           │
│ created_at      │         │ description     │
└─────────────────┘         │ created_at      │
                            └─────────────────┘
```

### Descripción de Entidades

**users (Usuarios)**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único (PK) |
| username | TEXT | Nombre de usuario único |
| password | TEXT | Contraseña encriptada |
| created_at | DATETIME | Fecha de creación |

**products (Productos)**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único (PK) |
| name | TEXT | Nombre del producto |
| price | NUMERIC | Precio del producto |
| description | TEXT | Descripción del producto |
| created_at | DATETIME | Fecha de creación |

## Justificación de Plataforma de Despliegue

### Vercel

**Ventajas:**
1. **Integración nativa con Node.js**: Vercel soporta aplicaciones Node.js de forma nativa sin configuración adicional.
2. **Despliegue automático**: Cada push a GitHub activa un despliegue automático.
3. **SSL gratuito**: Vercel proporciona certificados SSL automáticamente.
4. **CDN global**: Los recursos estáticos se distribuyen globalmente para mejor rendimiento.
5. **Preview deployments**: Permite ver cambios antes de publicar en producción.
6. **Sin costo para proyectos pequeños**: El plan hobby es gratuito.

**Desventajas:**
1. **Limitaciones de tiempo de ejecución**: Serverless functions tienen límites de tiempo.
2. **Base de datos**: Requiere servicio externo (como MongoDB Atlas) para persistencia.

**Decisión**: Vercel es ideal para este proyecto por su facilidad de uso, integración con GitHub y costo cero para proyectos académicos.

## Arquitectura de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│                      Cliente (Frontend)                      │
│                    HTML + CSS + JS                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Servidor (Backend)                      │
│                      Node.js + Express                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Rutas     │  │ Middleware  │  │   Controladores     │ │
│  │   (Routes)  │  │ (Auth JWT)  │  │   (Controllers)     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Base de Datos                           │
│                      SQLite                                  │
└─────────────────────────────────────────────────────────────┘
```

## Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | /api/login | Inicio de sesión | Público |
| POST | /api/register | Registro de usuario | Público |

### Productos
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | /api/products | Listar productos | Público |
| POST | /api/products | Crear producto | Admin |
| PUT | /api/products/:id | Actualizar producto | Admin |
| DELETE | /api/products/:id | Eliminar producto | Admin |

## Instrucciones de Ejecución

### Requisitos Previos
- Node.js v18 o superior
- npm o yarn

### Instalación
```bash
npm install
```

### Ejecución en Desarrollo
```bash
node server.js
```
La aplicación estará disponible en `http://localhost:3000`

### Ejecución de Pruebas
```bash
npm test
```

## Variables de Entorno

```env
JWT_SECRET=tu_secreto_jwt_seguro_aqui
JWT_EXPIRES_IN=1h
PORT=3000
```

## Contenido del Repositorio

```
/
├── .github/workflows/     # CI/CD pipeline
├── db/                    # Base de datos
├── front/                 # Archivos frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js              # Servidor principal
├── package.json           # Dependencias
├── DOCUMENTATION.md       # Documentación
└── README.md              # Instrucciones
```
