# 📦 Guía de Separación Frontend/Backend

## 🎯 Objetivo
Separar completamente el frontend del backend en dos repositorios independientes.

---

## 📋 Repositorios

### ✅ Backend (este repositorio)
**Repositorio:** https://github.com/RapteRPM/PERFIL-FRONTEND  
**Puerto:** 3000  
**Función:** API REST, autenticación, base de datos

### ✅ Frontend (repositorio separado)
**Repositorio:** https://github.com/RapteRPM/Perfil  
**Puerto:** 5500 (Live Server)  
**Función:** Interfaz de usuario (HTML, CSS, JS)

---

## 📁 Archivos que DEBEN QUEDAR en el Backend

### ✅ Mantener en este repositorio

```
├── config/                    # Configuración de BD
│   └── db.js
├── controllers/               # Controladores
│   ├── credenciales.js
│   └── enviarCorreo.js
├── middlewares/               # Middlewares
│   └── sesion.js
├── routes/                    # Rutas modulares
│   ├── auth.js
│   └── protected.js
├── migrations/                # Migraciones de BD
│   └── add-notificacion-comercio.cjs
├── server.js                  # Servidor Express
├── package.json               # Dependencias backend
├── .env.example               # Ejemplo de variables de entorno
├── .gitignore                 # Archivos ignorados
├── rpm_market.sql             # Script de base de datos
├── README.md                  # Documentación principal
├── README-BACKEND.md          # Documentación técnica backend
├── MIGRATION-GUIDE.md         # Guía de migración
├── FRONTEND-CONFIG-EXAMPLE.js # Ejemplos para frontend
└── SEPARACION-FRONTEND.md     # Esta guía
```

### 🗂️ Carpetas que pueden quedar (pero vacías en git)

```
├── uploads/                   # Archivos subidos (ignorado por git)
└── public/imagen/             # Imágenes de usuarios (ignorado por git)
```

---

## 📤 Archivos que DEBEN MOVERSE al Frontend

### 🚀 Mover al repositorio https://github.com/RapteRPM/Perfil

Toda la carpeta `public/` (excepto `public/imagen/` que usa el backend para servir imágenes):

```
public/
├── Administrador/
│   ├── gestion_pqr.html
│   ├── gestion_publicaciones.html
│   ├── gestion_usuarios.html
│   └── panel_admin.html
│
├── Comerciante/
│   ├── Control_agenda.html
│   ├── Editar_publicacion.html
│   ├── EditarPerfil_comerciante.html
│   ├── historial_ventas.html
│   ├── perfil_comerciante.html
│   ├── publicar.html
│   ├── registro_publicacion.html
│   └── style.css
│
├── General/
│   ├── CambiarContraseña.html
│   ├── CentroAyuda.html
│   ├── crear-contrasena.html
│   ├── index.html
│   ├── Ingreso.html
│   ├── marketGrua.css
│   ├── marketplace_gruas.html
│   ├── prueba.html
│   ├── RecuperarContraseña.html
│   ├── registro.css
│   ├── Registro.html
│   ├── style.css
│   ├── UbicaTaller.html
│   └── IMAGENINGRESO/
│
├── Natural/
│   ├── carrito_compras.html
│   ├── Detalle_producto.html
│   ├── Detalle_productoServicio.html
│   ├── detalle_publicaciongrua.html
│   ├── Editar_perfil.html
│   ├── Factura_compra.html
│   ├── Historial_compras.html
│   ├── pago_pse.html
│   ├── perfil_usuario.html
│   ├── Proceso_compra.html
│   ├── style.css
│   └── test_historial.html
│
├── PrestadorServicios/
│   ├── agenda_gruas.html
│   ├── configuracion_prestador.html
│   ├── Editar_publicacionServicio.html
│   ├── historia_servicios.html
│   ├── perfil_servicios.html
│   ├── publicar_grua.html
│   ├── Registro_servicios.html
│   └── style.css
│
├── JS/
│   ├── animacion.js
│   ├── app.js
│   ├── cambiarcontraseña.js
│   ├── centroAyuda.js
│   ├── indexHeader.js
│   ├── mapa.js
│   ├── market_gruas.js
│   ├── perfil_usuario.js
│   ├── protegerPagina.js
│   ├── protegerRuta.js
│   ├── RecuperarContraseña.js
│   ├── registro.js
│   ├── UsuarioSesion.js
│   ├── Visualizacion_publicaciones.js
│   ├── Administrador/
│   ├── Comerciante/
│   ├── Natural/
│   └── Prestador/
│
├── image/                     # Imágenes estáticas
└── Imagen/                    # Imágenes estáticas
```

### 🚫 Archivos que DEBEN ELIMINARSE del Frontend

Estos archivos solo deben existir en el backend:

```
❌ server.js
❌ package.json (del backend)
❌ node_modules/
❌ config/
❌ controllers/
❌ middlewares/
❌ routes/
❌ migrations/
❌ rpm_market.sql
❌ .env
❌ .env.example
```

---

## 🔧 Pasos para Realizar la Separación

### 1️⃣ Preparar el Backend (este repositorio)

```bash
# Ya está listo! Solo asegúrate de:
# 1. Tener el archivo .env configurado
# 2. Tener la base de datos importada
# 3. Tener las dependencias instaladas

npm install
npm start
```

### 2️⃣ Preparar el Frontend

```bash
# 1. Clonar el repositorio frontend
git clone https://github.com/RapteRPM/Perfil.git
cd Perfil

# 2. Copiar TODOS los archivos de la carpeta public/ de este repo
#    al repositorio frontend (en la raíz o estructura deseada)

# 3. Crear un archivo de configuración en el frontend
```

Crear un archivo `config.js` en el frontend:

```javascript
// config.js - Configuración del Frontend
const API_URL = 'http://localhost:3000';

export { API_URL };
```

### 3️⃣ Actualizar las Llamadas al Backend

En TODOS los archivos `.js` del frontend, buscar y reemplazar:

**❌ ANTES (cuando todo estaba junto):**
```javascript
fetch('/api/login', { ... })
fetch('/api/publicaciones', { ... })
```

**✅ DESPUÉS (con backend separado):**
```javascript
const API_URL = 'http://localhost:3000';

fetch(`${API_URL}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ⚠️ IMPORTANTE para sesiones
  body: JSON.stringify(datos)
})
```

### 4️⃣ Ejemplo de Actualización

**Archivo: `public/JS/app.js`**

```javascript
// ❌ ANTES
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuario, password })
})

// ✅ DESPUÉS
const API_URL = 'http://localhost:3000';

fetch(`${API_URL}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Para mantener la sesión
  body: JSON.stringify({ usuario, password })
})
```

---

## 🧪 Verificar que Todo Funciona

### 1. Iniciar el Backend
```bash
cd PERFIL-FRONTEND
npm start
# Debe mostrar: 🚀 Backend API escuchando en: http://localhost:3000
```

### 2. Iniciar el Frontend
```bash
cd Perfil
# Abrir con VS Code
# Click derecho en index.html → "Open with Live Server"
# Se abrirá en: http://localhost:5500
```

### 3. Probar la Conexión
1. Abrir el navegador en `http://localhost:5500`
2. Ir a la página de login
3. Intentar iniciar sesión
4. Verificar en la consola (F12) que no hay errores de CORS
5. Verificar que la sesión se mantiene

---

## 🔍 Solución de Problemas

### ❌ Error: CORS policy

**Síntoma:**
```
Access to fetch at 'http://localhost:3000/api/login' from origin 'http://localhost:5500' 
has been blocked by CORS policy
```

**Solución:**
Verificar que el backend tenga CORS configurado correctamente en `server.js`:
```javascript
const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

### ❌ Las sesiones no se mantienen

**Síntoma:** El usuario se desloguea constantemente

**Solución:** Asegurarse de incluir `credentials: 'include'` en TODAS las peticiones fetch:
```javascript
fetch(`${API_URL}/api/cualquier-endpoint`, {
  credentials: 'include' // ⚠️ Esto es crítico!
})
```

### ❌ Las imágenes no se muestran

**Síntoma:** Las imágenes de usuarios/publicaciones no cargan

**Solución:** Las URLs de las imágenes deben apuntar al backend:
```javascript
// ✅ CORRECTO
const imagenURL = `${API_URL}/imagen/Natural/123456/perfil.jpg`;

// ❌ INCORRECTO
const imagenURL = `/imagen/Natural/123456/perfil.jpg`;
```

---

## 📚 Recursos Adicionales

- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **DB Status:** http://localhost:3000/api/db-status
- **Documentación:** Ver `MIGRATION-GUIDE.md` y `FRONTEND-CONFIG-EXAMPLE.js`

---

## ✅ Checklist Final

- [ ] Backend instalado y funcionando en puerto 3000
- [ ] Frontend en repositorio separado (https://github.com/RapteRPM/Perfil)
- [ ] Archivos HTML/CSS/JS movidos al frontend
- [ ] Todas las rutas fetch actualizadas con `API_URL`
- [ ] `credentials: 'include'` en todas las peticiones
- [ ] CORS configurado correctamente
- [ ] Login funcionando
- [ ] Sesiones manteniéndose
- [ ] Imágenes cargando correctamente
- [ ] No hay errores en la consola del navegador

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás:
- ✅ Backend independiente en https://github.com/RapteRPM/PERFIL-FRONTEND
- ✅ Frontend independiente en https://github.com/RapteRPM/Perfil
- ✅ Comunicación correcta entre ambos vía API REST
- ✅ Sesiones funcionando correctamente
- ✅ Sistema listo para deploy por separado
