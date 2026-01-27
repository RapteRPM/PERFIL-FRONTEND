# 📦 Instrucciones para el Repositorio Frontend

> **Nota:** Este archivo debe copiarse al repositorio https://github.com/RapteRPM/Perfil

---

## 🎯 Configuración del Frontend

Este frontend se conecta a un backend API separado ubicado en:
**https://github.com/RapteRPM/PERFIL-FRONTEND**

---

## 📁 Estructura de Archivos

```
Perfil/
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
│   └── registro_publicacion.html
│
├── General/
│   ├── index.html              ← Página principal
│   ├── Ingreso.html            ← Login
│   ├── Registro.html           ← Registro
│   ├── CambiarContraseña.html
│   ├── RecuperarContraseña.html
│   ├── CentroAyuda.html
│   ├── marketplace_gruas.html
│   └── UbicaTaller.html
│
├── Natural/
│   ├── carrito_compras.html
│   ├── Detalle_producto.html
│   ├── perfil_usuario.html
│   ├── Historial_compras.html
│   └── Factura_compra.html
│
├── PrestadorServicios/
│   ├── agenda_gruas.html
│   ├── perfil_servicios.html
│   ├── publicar_grua.html
│   └── historia_servicios.html
│
├── JS/
│   ├── config.js               ← Configuración de API (CREAR)
│   ├── app.js
│   ├── registro.js
│   ├── perfil_usuario.js
│   ├── Visualizacion_publicaciones.js
│   ├── Administrador/
│   ├── Comerciante/
│   ├── Natural/
│   └── Prestador/
│
├── CSS/
│   └── ... (estilos)
│
├── image/                      ← Imágenes estáticas del frontend
└── README.md                   ← Este archivo
```

---

## ⚙️ Configuración Inicial

### 1. Crear archivo de configuración

**Crear `JS/config.js`:**

```javascript
// Configuración de la API Backend
const API_URL = 'http://localhost:3000'; // Desarrollo
// const API_URL = 'https://tu-backend-produccion.com'; // Producción

export { API_URL };
```

### 2. Actualizar archivos JavaScript

En **TODOS** los archivos `.js` que hagan peticiones al backend:

**Al inicio del archivo:**
```javascript
import { API_URL } from './config.js';
// o
const API_URL = 'http://localhost:3000';
```

**En TODAS las peticiones fetch:**
```javascript
fetch(`${API_URL}/api/endpoint`, {
  method: 'POST', // GET, PUT, DELETE según necesites
  credentials: 'include', // ⚠️ MUY IMPORTANTE para sesiones
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(datos)
})
.then(response => response.json())
.then(data => {
  console.log('Respuesta:', data);
})
.catch(error => {
  console.error('Error:', error);
});
```

### 3. Actualizar URLs de imágenes

Las imágenes de usuarios y publicaciones se sirven desde el backend:

```javascript
// ✅ CORRECTO
const imagenURL = `${API_URL}/imagen/Natural/123456/perfil.jpg`;
const img = document.getElementById('foto-perfil');
img.src = imagenURL;

// ❌ INCORRECTO
const imagenURL = `/imagen/Natural/123456/perfil.jpg`;
```

---

## 🚀 Iniciar el Frontend

### Opción 1: Live Server (Recomendado para desarrollo)

1. Instalar extensión **Live Server** en VS Code
2. Abrir el proyecto en VS Code
3. Click derecho en `General/index.html`
4. Seleccionar **"Open with Live Server"**
5. Se abrirá automáticamente en `http://localhost:5500`

### Opción 2: Servidor HTTP simple

```bash
# Con Python 3
python -m http.server 5500

# Con Node.js (instalar http-server globalmente)
npm install -g http-server
http-server -p 5500
```

---

## 🔗 Conectar con el Backend

### Requisitos
- ✅ Backend corriendo en `http://localhost:3000`
- ✅ Frontend corriendo en `http://localhost:5500`
- ✅ CORS configurado en el backend

### Verificar conexión

**1. Abrir consola del navegador (F12)**

**2. Probar conexión a la API:**
```javascript
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(data => console.log('Backend conectado:', data))
  .catch(e => console.error('Error conectando al backend:', e));
```

**3. Probar login:**
- Ir a `http://localhost:5500/General/Ingreso.html`
- Intentar iniciar sesión
- Verificar que no haya errores CORS en consola

---

## 📝 Checklist de Archivos JavaScript a Actualizar

### ✅ Archivos Generales
- [ ] `JS/app.js`
- [ ] `JS/registro.js`
- [ ] `JS/cambiarcontraseña.js`
- [ ] `JS/RecuperarContraseña.js`
- [ ] `JS/perfil_usuario.js`
- [ ] `JS/Visualizacion_publicaciones.js`
- [ ] `JS/market_gruas.js`
- [ ] `JS/mapa.js`
- [ ] `JS/centroAyuda.js`

### ✅ Administrador
- [ ] `JS/Administrador/*.js` (todos los archivos)

### ✅ Comerciante
- [ ] `JS/Comerciante/*.js` (todos los archivos)

### ✅ Natural
- [ ] `JS/Natural/*.js` (todos los archivos)

### ✅ Prestador
- [ ] `JS/Prestador/*.js` (todos los archivos)

---

## 🔍 Solución de Problemas Comunes

### ❌ Error: "blocked by CORS policy"

**Causa:** El backend no tiene CORS configurado correctamente

**Solución:** Verificar que el backend tenga en su `.env`:
```env
FRONTEND_URLS=http://localhost:5500,http://127.0.0.1:5500
```

### ❌ Error: "Failed to fetch" o "Network Error"

**Causa:** El backend no está corriendo

**Solución:**
```bash
# En la carpeta del backend
cd PERFIL-FRONTEND
npm start
```

### ❌ Las sesiones no se mantienen

**Causa:** Falta `credentials: 'include'` en las peticiones fetch

**Solución:** Verificar que TODAS las peticiones incluyan:
```javascript
fetch(`${API_URL}/api/...`, {
  credentials: 'include', // ← Esto es crítico
  // ... resto del código
})
```

### ❌ Imágenes no cargan

**Causa:** URLs de imágenes incorrectas

**Solución:** Las imágenes deben usar la URL del backend:
```javascript
// ✅ CORRECTO
`${API_URL}/imagen/ruta/imagen.jpg`

// ❌ INCORRECTO  
`/imagen/ruta/imagen.jpg`
```

---

## 🌐 Despliegue en Producción

### 1. Actualizar configuración

**Editar `JS/config.js`:**
```javascript
const API_URL = 'https://tu-backend-produccion.com';
export { API_URL };
```

### 2. Opciones de Hosting

#### Netlify
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages
```bash
# En la configuración del repositorio
Settings → Pages → Source: main branch
```

### 3. Configurar CORS en Backend

Una vez desplegado el frontend, actualizar el `.env` del backend con la URL de producción:
```env
FRONTEND_URLS=https://tu-frontend.netlify.app,https://tu-frontend.vercel.app
```

---

## 📚 Recursos Adicionales

### Documentación del Backend
- Backend README: https://github.com/RapteRPM/PERFIL-FRONTEND
- API Endpoints: Ver `README-BACKEND.md` en el repositorio backend
- Ejemplos de código: Ver `FRONTEND-CONFIG-EXAMPLE.js` en backend

### Estructura de la API

**Base URL:** `http://localhost:3000`

**Endpoints principales:**
- `POST /api/login` - Iniciar sesión
- `GET /api/verificar-sesion` - Verificar sesión
- `GET /api/publicaciones` - Listar publicaciones
- `POST /api/carrito` - Agregar al carrito
- `GET /imagen/:ruta` - Obtener imágenes

Ver documentación completa en el repositorio del backend.

---

## ✅ Verificación Final

Antes de considerar el proyecto completo:

- [ ] Frontend corre sin errores
- [ ] Backend está corriendo y accesible
- [ ] Login funciona correctamente
- [ ] Sesión se mantiene entre páginas
- [ ] No hay errores de CORS
- [ ] Imágenes cargan correctamente
- [ ] Todas las funcionalidades principales funcionan
- [ ] Consola del navegador sin errores

---

## 📧 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12) para ver errores
2. Verifica que el backend esté corriendo (`http://localhost:3000/health`)
3. Consulta la documentación del backend
4. Revisa el archivo `SEPARACION-FRONTEND.md` en el repositorio backend

---

## 🎉 ¡Listo!

Tu frontend ahora está correctamente configurado para trabajar con el backend separado. El sistema está listo para desarrollo y despliegue en producción.

---

<p align="center">
  <strong>Backend:</strong> https://github.com/RapteRPM/PERFIL-FRONTEND<br>
  <strong>Frontend:</strong> https://github.com/RapteRPM/Perfil
</p>
