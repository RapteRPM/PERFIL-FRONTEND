# ✅ Resumen de Configuración: Backend Separado

## 🎯 ¿Qué se hizo?

Este backend fue configurado para funcionar **separado del frontend**, comunicándose mediante API REST con CORS habilitado.

---

## 📝 Cambios Realizados

### 1. ✅ CORS Configurado
- **Instalado**: `npm install cors`
- **Configurado** para aceptar peticiones desde `http://localhost:5500`
- **Credentials**: Habilitado para enviar/recibir cookies de sesión

### 2. ✅ Sesiones Actualizadas
- **Secret**: Ahora usa variable de entorno `SESSION_SECRET`
- **Cookie config**: `httpOnly: true`, `sameSite: 'lax'`, `secure: false` (dev)
- **MaxAge**: 24 horas
- **Credentials**: Compatible con CORS

### 3. ✅ Rutas Estáticas Eliminadas
- ❌ Eliminado `express.static('public')`
- ❌ Eliminadas rutas que servían archivos HTML
- ✅ Mantenido `/imagen` para servir imágenes
- ✅ Backend ahora solo responde API en formato JSON

### 4. ✅ Carpeta Uploads
- Creada carpeta `uploads/` para archivos subidos
- Agregada al `.gitignore`

### 5. ✅ Base de Datos Mejorada
- Ya estaba configurada para usar SQLite como fallback
- No bloquea el inicio del servidor si MySQL no está disponible
- Funciona correctamente en desarrollo

### 6. ✅ Documentación
- `README-BACKEND.md`: Guía completa del backend
- `MIGRATION-GUIDE.md`: Guía paso a paso para migrar
- `FRONTEND-CONFIG-EXAMPLE.js`: Ejemplos de código para el frontend
- Este archivo: Resumen ejecutivo

### 7. ✅ .gitignore Mejorado
- Variables de entorno (`.env`)
- Archivos subidos (`uploads/`)
- Bases de datos SQLite (`*.db`)
- Logs y temporales

---

## 🚀 Inicio Rápido

### Backend (este repositorio)
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor
npm start
```

### Frontend (repositorio separado)
```bash
# Clonar repositorio
git clone https://github.com/RapteRPM/Perfil.git

# Abrir con VS Code
code Perfil/

# Usar Live Server (Extensión de VS Code)
# Click derecho → Open with Live Server
```

---

## 📡 URLs

- **Backend API**: `http://localhost:3000`
- **Frontend**: `http://localhost:5500` (Live Server)
- **Health Check**: `http://localhost:3000/health`
- **DB Status**: `http://localhost:3000/api/db-status`

---

## 🔧 Configuración del Frontend

El frontend debe:

1. **Usar la URL del backend**:
   ```javascript
   const API_URL = 'http://localhost:3000';
   ```

2. **Incluir credentials en todas las peticiones**:
   ```javascript
   fetch(`${API_URL}/api/endpoint`, {
     credentials: 'include'  // ¡Importante!
   })
   ```

3. **Verificar sesión al cargar**:
   ```javascript
   async function verificarSesion() {
     const res = await fetch(`${API_URL}/api/verificar-sesion`, {
       credentials: 'include'
     });
     const data = await res.json();
     if (!data.activa) {
       window.location.href = '/Ingreso.html';
     }
   }
   ```

Ver `FRONTEND-CONFIG-EXAMPLE.js` para más ejemplos.

---

## 📋 Estructura de Archivos

```
PERFIL-FRONTEND/
├── 📄 server.js                    # Servidor principal (modificado ✅)
├── 📄 package.json                 # Dependencias (cors agregado ✅)
├── 📄 .env                         # Variables de entorno (crear)
├── 📄 .env.example                 # Ejemplo de variables (actualizado ✅)
├── 📄 .gitignore                   # Archivos ignorados (actualizado ✅)
│
├── 📁 config/
│   └── db.js                       # Configuración BD (ya correcta ✅)
│
├── 📁 controllers/
│   ├── credenciales.js
│   └── enviarCorreo.js
│
├── 📁 middlewares/
│   └── sesion.js
│
├── 📁 routes/
│   ├── auth.js
│   └── protected.js
│
├── 📁 public/imagen/               # Imágenes servidas (✅)
│   ├── Natural/
│   ├── Comerciante/
│   └── PrestadorServicios/
│
├── 📁 uploads/                     # Archivos subidos (creado ✅)
│
└── 📚 Documentación
    ├── README-BACKEND.md           # Guía del backend (nuevo ✅)
    ├── MIGRATION-GUIDE.md          # Guía de migración (nuevo ✅)
    ├── FRONTEND-CONFIG-EXAMPLE.js  # Ejemplos frontend (nuevo ✅)
    └── RESUMEN.md                  # Este archivo (nuevo ✅)
```

---

## ✅ Checklist de Verificación

### Backend
- [x] CORS instalado y configurado
- [x] Sesiones configuradas con credentials
- [x] Rutas estáticas HTML eliminadas
- [x] Carpeta uploads/ creada
- [x] .gitignore actualizado
- [x] .env configurado
- [x] Servidor inicia correctamente
- [x] Health check funciona
- [x] DB status funciona

### Frontend (en el otro repositorio)
- [ ] Clonar repositorio Perfil
- [ ] Configurar API_URL = 'http://localhost:3000'
- [ ] Agregar credentials: 'include' en todas las peticiones
- [ ] Probar login
- [ ] Verificar sesión persiste
- [ ] Probar endpoints principales

---

## 🧪 Probar que Funciona

```bash
# 1. Health Check
curl http://localhost:3000/health

# 2. DB Status
curl http://localhost:3000/api/db-status

# 3. Login (ejemplo)
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin@rpm.com","password":"123456"}' \
  -c cookies.txt -v

# 4. Verificar sesión
curl http://localhost:3000/api/verificar-sesion \
  -b cookies.txt
```

---

## 🐛 Problemas Comunes

### ❌ CORS Error
**Solución**: Verificar que el frontend esté en `http://localhost:5500`

### ❌ Sesión no persiste
**Solución**: Agregar `credentials: 'include'` en el frontend

### ❌ MySQL no disponible
**Solución**: El backend usa SQLite en desarrollo (esto es normal)

### ❌ Correos no se envían
**Solución**: Verificar que `EMAIL_PASS` no tenga espacios en `.env`

---

## 📚 Documentación Completa

- **[README-BACKEND.md](README-BACKEND.md)**: Documentación técnica completa
- **[MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)**: Guía paso a paso para migrar
- **[FRONTEND-CONFIG-EXAMPLE.js](FRONTEND-CONFIG-EXAMPLE.js)**: Ejemplos de código

---

## 🎉 ¡Listo para Usar!

El backend está configurado y listo para recibir peticiones del frontend separado.

**Próximos pasos**:
1. Iniciar este backend: `npm start`
2. Configurar el frontend en el otro repositorio
3. Iniciar el frontend con Live Server
4. Probar el login y las funcionalidades

---

## 📞 Contacto

Si tienes dudas, revisa:
1. Los logs del servidor backend (terminal)
2. La consola del navegador (F12)
3. Las guías de documentación incluidas

---

**Última actualización**: 23 de enero de 2026
**Versión**: 2.0 - Backend separado
