# 🚀 Guía Rápida: Conectar Frontend y Backend

## 📌 Situación Actual

Tienes dos repositorios:
- 🔧 **Backend**: https://github.com/RapteRPM/PERFIL-FRONTEND (este repo)
- 🎨 **Frontend**: https://github.com/RapteRPM/Perfil

## ✅ Pasos para Conectarlos

### 1️⃣ Configurar el Backend (este repositorio)

```bash
# Clonar y configurar
git clone https://github.com/RapteRPM/PERFIL-FRONTEND.git
cd PERFIL-FRONTEND

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env  # o tu editor favorito

# Importar base de datos
mysql -u root -p rpm_market < rpm_market.sql

# Iniciar servidor
npm start
```

**✅ El backend estará en:** `http://localhost:3000`

---

### 2️⃣ Mover Archivos al Frontend

**Archivos a COPIAR desde este repo al repo del frontend:**

```
📂 public/
  ├── Administrador/        → Copiar TODO al frontend
  ├── Comerciante/          → Copiar TODO al frontend  
  ├── General/              → Copiar TODO al frontend
  ├── Natural/              → Copiar TODO al frontend
  ├── PrestadorServicios/   → Copiar TODO al frontend
  ├── JS/                   → Copiar TODO al frontend
  ├── image/                → Copiar TODO al frontend
  └── Imagen/               → Copiar TODO al frontend
```

**⚠️ NO copiar:**
- ❌ `public/imagen/` (esta la sirve el backend)

---

### 3️⃣ Configurar el Frontend

**En el repositorio del frontend:**

```bash
# Clonar frontend
git clone https://github.com/RapteRPM/Perfil.git
cd Perfil

# Copiar archivos desde el backend
# (ver lista arriba)
```

**Crear archivo `config.js` en la raíz del frontend:**

```javascript
// config.js
const API_URL = 'http://localhost:3000';
export { API_URL };
```

---

### 4️⃣ Actualizar Llamadas API en el Frontend

**❌ ANTES (cuando todo estaba junto):**
```javascript
fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ usuario, password })
})
```

**✅ DESPUÉS (con backend separado):**
```javascript
const API_URL = 'http://localhost:3000';

fetch(`${API_URL}/api/login`, {
  method: 'POST',
  credentials: 'include',  // ⚠️ MUY IMPORTANTE para sesiones
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuario, password })
})
```

**🔑 REGLA DE ORO:** Siempre incluir `credentials: 'include'` en TODAS las peticiones fetch.

---

### 5️⃣ Archivos JavaScript a Actualizar

Busca y reemplaza en TODOS estos archivos del frontend:

```
public/JS/
  ├── app.js                          ← Actualizar
  ├── registro.js                     ← Actualizar  
  ├── perfil_usuario.js               ← Actualizar
  ├── Visualizacion_publicaciones.js  ← Actualizar
  ├── Administrador/
  │   └── *.js                        ← Actualizar todos
  ├── Comerciante/
  │   └── *.js                        ← Actualizar todos
  ├── Natural/
  │   └── *.js                        ← Actualizar todos
  └── Prestador/
      └── *.js                        ← Actualizar todos
```

**Buscar:**
```javascript
fetch('/api/
fetch("/api/
```

**Reemplazar por:**
```javascript
const API_URL = 'http://localhost:3000';
fetch(`${API_URL}/api/
```

---

### 6️⃣ Actualizar URLs de Imágenes

**❌ ANTES:**
```javascript
const imagenURL = `/imagen/Natural/123456/perfil.jpg`;
```

**✅ DESPUÉS:**
```javascript
const API_URL = 'http://localhost:3000';
const imagenURL = `${API_URL}/imagen/Natural/123456/perfil.jpg`;
```

---

### 7️⃣ Iniciar Ambos Servidores

**Terminal 1 - Backend:**
```bash
cd PERFIL-FRONTEND
npm start
# Escuchando en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd Perfil
# Abrir con VS Code
# Click derecho en index.html → "Open with Live Server"
# Se abrirá en http://localhost:5500
```

---

## 🧪 Verificar que Funciona

### 1. Probar Backend
```bash
curl http://localhost:3000/health
# Debe devolver: {"status":"OK"}
```

### 2. Probar Frontend
1. Abrir navegador en `http://localhost:5500`
2. Abrir DevTools (F12) → Consola
3. Ir a la página de login
4. Intentar iniciar sesión
5. **No debe haber errores de CORS** ✅

---

## 🔍 Problemas Comunes

### ❌ Error: "blocked by CORS policy"

**Solución:** Verificar que el `.env` del backend tenga:
```env
FRONTEND_URLS=http://localhost:5500,http://127.0.0.1:5500
```

### ❌ Sesión no se mantiene

**Causa:** Falta `credentials: 'include'` en el fetch

**Solución:** Agregar en TODAS las peticiones:
```javascript
fetch(`${API_URL}/api/...`, {
  credentials: 'include',  // ← Esto es crítico
  // ... resto del código
})
```

### ❌ Imágenes no cargan

**Causa:** URL incorrecta de las imágenes

**Solución:**
```javascript
// ✅ CORRECTO
const imgURL = `${API_URL}/imagen/ruta/imagen.jpg`;

// ❌ INCORRECTO
const imgURL = `/imagen/ruta/imagen.jpg`;
```

---

## 📚 Documentación Completa

Para más detalles, consulta:
- **[README.md](README.md)** - Documentación principal
- **[SEPARACION-FRONTEND.md](SEPARACION-FRONTEND.md)** - Guía detallada de separación
- **[MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)** - Guía de migración
- **[FRONTEND-CONFIG-EXAMPLE.js](FRONTEND-CONFIG-EXAMPLE.js)** - Ejemplos de código

---

## ✅ Checklist Final

- [ ] Backend instalado y corriendo en puerto 3000
- [ ] Frontend en repositorio separado
- [ ] Archivos HTML/CSS/JS movidos al frontend
- [ ] Variable `API_URL` definida en frontend
- [ ] Todas las peticiones `fetch()` actualizadas con `API_URL`
- [ ] `credentials: 'include'` en todas las peticiones
- [ ] URLs de imágenes actualizadas con `API_URL`
- [ ] CORS configurado correctamente
- [ ] Login funciona correctamente
- [ ] Sesión se mantiene entre páginas
- [ ] No hay errores en la consola del navegador

---

## 🎉 ¡Listo!

Una vez completado, tendrás:
- ✅ Backend independiente en puerto 3000
- ✅ Frontend independiente en puerto 5500
- ✅ Comunicación correcta vía API REST
- ✅ Sistema listo para producción

---

## 💡 Tip para Producción

Cuando despliegues en producción:

**Backend (.env en servidor):**
```env
FRONTEND_URLS=https://tu-frontend-produccion.com
NODE_ENV=production
```

**Frontend (config.js en producción):**
```javascript
const API_URL = 'https://tu-backend-produccion.com';
```
