# RPM Market - Backend API

Este repositorio contiene el backend API para RPM Market, diseñado para trabajar con el frontend separado ubicado en [https://github.com/RapteRPM/Perfil](https://github.com/RapteRPM/Perfil).

## 🚀 Configuración Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y configura las variables:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
# Email
EMAIL_USER=rpmservice2026@gmail.com
EMAIL_PASS=tu_contraseña_sin_espacios

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=rpm_market
DB_PORT=3306

# Sesión
SESSION_SECRET=tu_secreto_super_seguro

# Servidor
PORT=3000
NODE_ENV=development
```

### 3. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en: **http://localhost:3000**

## 🌐 CORS Configurado

El backend acepta peticiones desde:
- `http://localhost:5500` (Frontend en Live Server)
- `http://127.0.0.1:5500`

Para agregar más orígenes, edita la configuración de CORS en `server.js`:
```javascript
const corsOptions = {
  origin: ['http://localhost:5500', 'http://tu-dominio.com'],
  credentials: true
};
```

## 📁 Estructura de Carpetas

```
├── config/           # Configuración de BD
├── controllers/      # Controladores (correo, credenciales)
├── middlewares/      # Middlewares (sesión, verificación)
├── routes/          # Rutas modulares
├── public/imagen/   # Imágenes de usuarios y publicaciones
├── uploads/         # Archivos subidos por usuarios
├── server.js        # Punto de entrada del servidor
└── .env            # Variables de entorno (no versionado)
```

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/login` - Iniciar sesión
- `POST /api/logout` - Cerrar sesión
- `GET /api/verificar-sesion` - Verificar sesión activa

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Publicaciones
- `GET /api/publicaciones` - Listar publicaciones
- `POST /api/publicaciones` - Crear publicación
- `PUT /api/publicaciones/:id` - Actualizar publicación
- `DELETE /api/publicaciones/:id` - Eliminar publicación

### Imágenes
- `GET /imagen/:ruta` - Servir imágenes estáticas

## 🗄️ Base de Datos

El sistema funciona con **MySQL** como base de datos principal. Si MySQL no está disponible, automáticamente usa **SQLite** como fallback en desarrollo (no recomendado para producción).

### Importar esquema MySQL
```bash
mysql -u root -p rpm_market < rpm_market.sql
```

## 🔒 Sesiones

Las sesiones están configuradas con:
- **HttpOnly**: Cookies accesibles solo desde el servidor
- **SameSite: 'lax'**: Protección contra CSRF
- **Credentials: true**: Permite envío de cookies en peticiones CORS
- **MaxAge: 24h**: Duración de la sesión

## 🧪 Health Checks

- `GET /health` - Estado del servidor
- `GET /api/db-status` - Estado de la base de datos

## 📝 Desarrollo

### Frontend separado
El frontend está en: [https://github.com/RapteRPM/Perfil](https://github.com/RapteRPM/Perfil)

Para desarrollar:
1. Inicia este backend: `npm start` (puerto 3000)
2. Inicia el frontend con Live Server (puerto 5500)
3. Las peticiones se harán automáticamente a `http://localhost:3000`

### Modificar CORS
Si cambias el puerto del frontend, actualiza `server.js`:
```javascript
const corsOptions = {
  origin: ['http://localhost:TU_PUERTO'],
  credentials: true
};
```

## 🚢 Despliegue

### Railway / Render / Heroku
1. Configura las variables de entorno en la plataforma
2. Asegúrate de tener MySQL configurado
3. El servidor se iniciará automáticamente con `npm start`

### Variables de entorno requeridas en producción:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `SESSION_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `NODE_ENV=production`

## 📧 Correo Electrónico

Configurado con Gmail y Nodemailer. Asegúrate de:
1. Tener verificación en dos pasos activada en Gmail
2. Generar una contraseña de aplicación
3. Usar la contraseña **sin espacios** en el `.env`

## 🛠️ Tecnologías

- **Node.js** + **Express** - Framework del servidor
- **MySQL2** - Base de datos principal
- **Better-SQLite3** - Fallback en desarrollo
- **Express-Session** - Manejo de sesiones
- **CORS** - Configuración de CORS
- **Multer** - Carga de archivos
- **Nodemailer** - Envío de correos
- **Bcrypt** - Hash de contraseñas

## 📄 Licencia

ISC
