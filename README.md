# 🚀 RPM Market - Backend API

<p align="center">
  <strong>Backend API REST para RPM Market</strong><br>
  Sistema de gestión de marketplace de repuestos, productos y servicios de grúas
</p>

---

## 📋 Descripción

Este repositorio contiene el **backend** de RPM Market, una API REST construida con Node.js y Express que gestiona:
- ✅ Autenticación y sesiones de usuarios
- ✅ Gestión de publicaciones (productos y servicios)
- ✅ Carrito de compras y facturación
- ✅ Sistema de opiniones y calificaciones
- ✅ Gestión de usuarios (Comerciantes, Prestadores de Servicio, Usuarios Naturales)
- ✅ Envío de correos electrónicos
- ✅ Carga y gestión de imágenes

## 🌐 Repositorios

| Componente | Repositorio | Descripción |
|------------|-------------|-------------|
| **Backend** | [PERFIL-FRONTEND](https://github.com/RapteRPM/PERFIL-FRONTEND) | API REST (este repositorio) |
| **Frontend** | [Perfil](https://github.com/RapteRPM/Perfil) | Interfaz de usuario |

---

## 🚀 Inicio Rápido

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/RapteRPM/PERFIL-FRONTEND.git
cd PERFIL-FRONTEND
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=rpm_market
DB_PORT=3306

# Email
EMAIL_USER=rpmservice2026@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# Sesión
SESSION_SECRET=un_secreto_muy_seguro_aqui

# Servidor
PORT=3000
NODE_ENV=development

# Frontend URLs (separadas por comas)
FRONTEND_URLS=http://localhost:5500,http://127.0.0.1:5500
```

### 4️⃣ Importar base de datos
```bash
mysql -u root -p rpm_market < rpm_market.sql
```

### 5️⃣ Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en **http://localhost:3000** 🎉

---

## 📁 Estructura del Proyecto

```
PERFIL-FRONTEND/
├── config/                      # Configuración
│   └── db.js                   # Conexión a base de datos
│
├── controllers/                 # Controladores
│   ├── credenciales.js         # Gestión de credenciales
│   └── enviarCorreo.js         # Envío de correos
│
├── middlewares/                 # Middlewares
│   └── sesion.js               # Verificación de sesión
│
├── routes/                      # Rutas modulares
│   ├── auth.js                 # Autenticación
│   └── protected.js            # Rutas protegidas
│
├── migrations/                  # Migraciones de BD
│   └── add-notificacion-comercio.cjs
│
├── public/imagen/              # Imágenes de usuarios (servidas estáticamente)
├── uploads/                    # Archivos subidos
│
├── server.js                   # Punto de entrada del servidor
├── package.json                # Dependencias
├── .env.example                # Ejemplo de variables de entorno
├── .gitignore                  # Archivos ignorados por git
│
├── rpm_market.sql              # Script de base de datos
│
├── README.md                   # Este archivo
├── README-BACKEND.md           # Documentación técnica detallada
├── MIGRATION-GUIDE.md          # Guía de migración
├── SEPARACION-FRONTEND.md      # Guía de separación frontend/backend
└── FRONTEND-CONFIG-EXAMPLE.js  # Ejemplos para configurar frontend
```

---

## 🔌 Endpoints Principales

### 🏥 Health Checks
```bash
GET /health              # Estado del servidor
GET /api/db-status       # Estado de la base de datos
GET /api/test-cors       # Prueba de CORS
```

### 🔐 Autenticación
```bash
POST /api/login          # Iniciar sesión
POST /api/logout         # Cerrar sesión
GET /api/verificar-sesion # Verificar sesión activa
POST /api/enviar-codigo-verificacion  # Recuperar contraseña
```

### 👥 Usuarios
```bash
GET /api/usuarios                    # Listar usuarios
GET /api/usuario-actual              # Usuario logueado
GET /api/usuarios/cedula/:documento  # Buscar por documento
PUT /api/usuarios/:id                # Actualizar usuario
DELETE /api/usuarios/:id             # Eliminar usuario
```

### 📦 Publicaciones
```bash
GET /api/publicaciones          # Listar publicaciones
GET /api/publicaciones/:id      # Detalle de publicación
POST /api/publicar              # Crear publicación
PUT /api/publicaciones/:id      # Actualizar publicación
DELETE /api/publicaciones/:id   # Eliminar publicación
```

### 🛒 Carrito y Compras
```bash
GET /api/carrito               # Ver carrito
POST /api/carrito              # Agregar al carrito
PUT /api/carrito/:id           # Actualizar cantidad
DELETE /api/carrito/:id        # Eliminar del carrito
```

### 📋 Historial
```bash
GET /api/historial             # Historial de compras
GET /api/historial-ventas      # Historial de ventas (comerciante)
```

### 🖼️ Imágenes
```bash
GET /imagen/:ruta              # Servir imágenes estáticas
```

Ver documentación completa en [README-BACKEND.md](README-BACKEND.md)

---

## 🛠️ Tecnologías Utilizadas

- **[Node.js](https://nodejs.org/)** - Entorno de ejecución
- **[Express.js](https://expressjs.com/)** - Framework web
- **[MySQL2](https://github.com/sidorares/node-mysql2)** - Base de datos principal
- **[Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)** - Base de datos fallback (desarrollo)
- **[Express-Session](https://github.com/expressjs/session)** - Manejo de sesiones
- **[CORS](https://github.com/expressjs/cors)** - Cross-Origin Resource Sharing
- **[Multer](https://github.com/expressjs/multer)** - Carga de archivos
- **[Nodemailer](https://nodemailer.com/)** - Envío de correos
- **[Bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de contraseñas
- **[ExcelJS](https://github.com/exceljs/exceljs)** - Exportación de reportes

---

## 🌐 CORS y Frontend

El backend está configurado para aceptar peticiones desde:
- `http://localhost:5500` (Live Server)
- `http://127.0.0.1:5500`

Para agregar más orígenes, edita el archivo `.env`:
```env
FRONTEND_URLS=http://localhost:5500,https://tu-frontend.com
```

**Importante:** El frontend debe enviar `credentials: 'include'` en todas las peticiones para mantener la sesión:
```javascript
fetch('http://localhost:3000/api/login', {
  method: 'POST',
  credentials: 'include', // ⚠️ Importante!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuario, password })
})
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [README-BACKEND.md](README-BACKEND.md) | Documentación técnica detallada |
| [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) | Guía de migración y despliegue |
| [SEPARACION-FRONTEND.md](SEPARACION-FRONTEND.md) | Cómo separar frontend/backend |
| [FRONTEND-CONFIG-EXAMPLE.js](FRONTEND-CONFIG-EXAMPLE.js) | Ejemplos de configuración frontend |

---

## 🧪 Testing

### Probar el backend directamente
```bash
# Health check
curl http://localhost:3000/health

# Estado de la BD
curl http://localhost:3000/api/db-status

# Login (guarda cookie)
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin@rpm.com","password":"123456"}' \
  -c cookies.txt

# Verificar sesión
curl http://localhost:3000/api/verificar-sesion -b cookies.txt
```

### Probar con el frontend
1. Inicia el backend: `npm start` (puerto 3000)
2. Inicia el frontend con Live Server (puerto 5500)
3. Navega a `http://localhost:5500`
4. Prueba login y funcionalidades

---

## 🚢 Despliegue

### Railway / Render / Heroku

1. **Crear proyecto** en la plataforma
2. **Conectar repositorio** GitHub
3. **Configurar variables de entorno**:
   ```env
   DB_HOST=tu_host_mysql
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_NAME=rpm_market
   SESSION_SECRET=secreto_produccion
   EMAIL_USER=rpmservice2026@gmail.com
   EMAIL_PASS=password_aplicacion
   NODE_ENV=production
   FRONTEND_URLS=https://tu-frontend.com
   ```
4. **Deploy automático** con `npm start`

### Variables de entorno requeridas en producción
- ✅ `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- ✅ `SESSION_SECRET` (genera uno seguro con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- ✅ `EMAIL_USER`, `EMAIL_PASS`
- ✅ `NODE_ENV=production`
- ✅ `FRONTEND_URLS` (URLs de tu frontend en producción)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📧 Contacto

- **Email:** rpmservice2026@gmail.com
- **Frontend:** https://github.com/RapteRPM/Perfil
- **Backend:** https://github.com/RapteRPM/PERFIL-FRONTEND

---

## 📄 Licencia

ISC

---

## 🎯 Características del Sistema

### Tipos de Usuarios
- 👤 **Usuario Natural**: Compra productos y servicios
- 🏪 **Comerciante**: Vende productos
- 🚛 **Prestador de Servicios**: Ofrece servicios de grúa

### Funcionalidades
- ✅ Sistema de autenticación seguro con sesiones
- ✅ Recuperación de contraseña por correo electrónico
- ✅ Gestión completa de publicaciones con imágenes
- ✅ Carrito de compras y proceso de checkout
- ✅ Sistema de calificaciones y opiniones
- ✅ Historial de compras y ventas
- ✅ Panel de administrador
- ✅ Agenda de citas para servicios
- ✅ Notificaciones por correo
- ✅ Exportación de reportes a Excel
- ✅ Geolocalización de talleres

---

<p align="center">
  Hecho con ❤️ por el equipo de RPM Market
</p>