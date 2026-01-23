# 📋 Guía de Migración: Frontend y Backend Separados

## 🎯 Objetivo
Este documento explica cómo configurar el backend separado del frontend para RPM Market.

## 📦 Repositorios

### Backend (este repositorio)
- **URL**: https://github.com/RapteRPM/PERFIL-FRONTEND
- **Puerto**: 3000
- **Función**: API REST + Manejo de sesiones + Base de datos

### Frontend (repositorio separado)
- **URL**: https://github.com/RapteRPM/Perfil
- **Puerto**: 5500 (Live Server)
- **Función**: Interfaz de usuario

---

## 🚀 Configuración Inicial

### 1️⃣ Clonar ambos repositorios

```bash
# Backend
git clone https://github.com/RapteRPM/PERFIL-FRONTEND.git
cd PERFIL-FRONTEND
npm install

# Frontend (en otra terminal/carpeta)
git clone https://github.com/RapteRPM/Perfil.git
cd Perfil
# Abrir con VS Code y usar Live Server
```

### 2️⃣ Configurar el Backend

1. **Copiar variables de entorno**:
   ```bash
   cp .env.example .env
   ```

2. **Editar `.env`** con tus credenciales:
   ```env
   EMAIL_USER=rpmservice2026@gmail.com
   EMAIL_PASS=ccnplbdtiyoohwuh  # Sin espacios!
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=rpm_market
   DB_PORT=3306
   
   SESSION_SECRET=tu_secreto_aleatorio
   PORT=3000
   NODE_ENV=development
   ```

3. **Importar la base de datos** (si usas MySQL):
   ```bash
   mysql -u root -p rpm_market < rpm_market.sql
   ```

4. **Iniciar el backend**:
   ```bash
   npm start
   ```

   Deberías ver:
   ```
   🚀 Backend API escuchando en: http://localhost:3000
   📡 CORS habilitado para: http://localhost:5500
   🔍 Health check: http://localhost:3000/health
   🗄️ DB Status: http://localhost:3000/api/db-status
   ```

### 3️⃣ Configurar el Frontend

1. **Abrir el frontend** con VS Code
2. **Instalar Live Server** (si no lo tienes):
   - Ir a Extensiones (Ctrl+Shift+X)
   - Buscar "Live Server"
   - Instalar

3. **Verificar configuración de API** en `JS/app.js` o similar:
   ```javascript
   const API_URL = 'http://localhost:3000';
   
   // Ejemplo de petición con credenciales
   fetch(`${API_URL}/api/login`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     credentials: 'include', // ¡Importante para sesiones!
     body: JSON.stringify({ usuario, password })
   });
   ```

4. **Iniciar Live Server**:
   - Click derecho en cualquier archivo HTML
   - Seleccionar "Open with Live Server"
   - Se abrirá en `http://localhost:5500`

---

## 🔧 Cambios Realizados en el Backend

### ✅ Agregado
- ✅ **CORS** configurado para `http://localhost:5500`
- ✅ **Sesiones** con `credentials: true` para CORS
- ✅ Carpeta `uploads/` para archivos subidos
- ✅ Servir solo imágenes en `/imagen`
- ✅ Endpoints de health check y diagnóstico

### ❌ Eliminado
- ❌ Rutas que sirven archivos HTML estáticos
- ❌ `express.static('public')` (excepto `/imagen`)
- ❌ Redirección a `index.html` en la raíz

### 🔄 Modificado
- 🔄 Configuración de sesiones con `sameSite: 'lax'`
- 🔄 Mensajes de inicio del servidor
- 🔄 `.gitignore` expandido

---

## 📡 Endpoints Disponibles

### Health Checks
```bash
GET /health              # Estado del servidor
GET /api/db-status       # Estado de la base de datos
```

### Autenticación
```bash
POST /api/login          # Iniciar sesión
POST /api/logout         # Cerrar sesión
GET /api/verificar-sesion # Verificar sesión activa
```

### Usuarios
```bash
GET /api/usuarios        # Listar usuarios
POST /api/usuarios       # Crear usuario
PUT /api/usuarios/:id    # Actualizar usuario
DELETE /api/usuarios/:id # Eliminar usuario
```

### Publicaciones
```bash
GET /api/publicaciones   # Listar publicaciones
POST /api/publicaciones  # Crear publicación
PUT /api/publicaciones/:id    # Actualizar
DELETE /api/publicaciones/:id # Eliminar
```

### Imágenes
```bash
GET /imagen/:ruta        # Servir imágenes estáticas
```

---

## 🧪 Probar la Configuración

### 1. Probar el Backend directamente

```bash
# Health check
curl http://localhost:3000/health

# DB Status
curl http://localhost:3000/api/db-status

# Login (sin frontend)
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin@rpm.com","password":"123456"}' \
  -c cookies.txt

# Verificar sesión
curl http://localhost:3000/api/verificar-sesion \
  -b cookies.txt
```

### 2. Probar desde el Frontend

1. Abrir el frontend en `http://localhost:5500`
2. Intentar iniciar sesión
3. Verificar la consola del navegador (F12)
4. Verificar que no haya errores de CORS

---

## 🔍 Solución de Problemas

### ❌ Error: CORS policy

**Problema**: El frontend no puede conectarse al backend

**Solución**:
```javascript
// En server.js, verifica que esté configurado:
const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
};
app.use(cors(corsOptions));
```

### ❌ Error: Sesión no persiste

**Problema**: El usuario no mantiene la sesión después del login

**Solución**:
```javascript
// En el frontend, todas las peticiones deben incluir:
fetch(url, {
  credentials: 'include'  // ¡Importante!
});
```

### ❌ Error: Cannot read properties of undefined

**Problema**: El frontend intenta acceder a `req.session.usuario` pero es undefined

**Solución**: Verificar que:
1. El login fue exitoso
2. Las cookies se están enviando (`credentials: 'include'`)
3. La sesión está configurada correctamente en el backend

### ❌ Error: MySQL no disponible

**Problema**: El backend usa SQLite en lugar de MySQL

**Solución**:
```bash
# Verificar que MySQL esté corriendo
sudo service mysql status

# Si no está corriendo
sudo service mysql start

# Verificar credenciales en .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=rpm_market
```

### ❌ Error: Email no se envía

**Problema**: Los correos de recuperación no llegan

**Solución**:
```env
# En .env, asegúrate de que la contraseña NO tenga espacios
EMAIL_PASS=ccnplbdtiyoohwuh  # ✅ Correcto
EMAIL_PASS=ccnp lbdt iyoo hwuh  # ❌ Incorrecto
```

---

## 📝 Checklist de Configuración

### Backend ✅
- [ ] `npm install` ejecutado
- [ ] `.env` configurado con credenciales correctas
- [ ] MySQL corriendo (o SQLite para desarrollo)
- [ ] Base de datos importada
- [ ] Servidor iniciado en puerto 3000
- [ ] Health check funciona

### Frontend ✅
- [ ] Repositorio clonado
- [ ] Live Server instalado
- [ ] API_URL apunta a `http://localhost:3000`
- [ ] `credentials: 'include'` en todas las peticiones
- [ ] Frontend abierto en `http://localhost:5500`

---

## 🌐 Cambiar Puerto del Frontend

Si usas un puerto diferente a 5500, actualiza el backend:

```javascript
// En server.js
const corsOptions = {
  origin: ['http://localhost:TU_PUERTO'],
  credentials: true
};
```

---

## 📚 Recursos Adicionales

- [Documentación de CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
- [Express Session](https://www.npmjs.com/package/express-session)
- [Fetch API with credentials](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch#sending_credentials)

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del backend (terminal donde corre `npm start`)
2. Revisa la consola del navegador (F12 → Console)
3. Verifica que ambos servidores estén corriendo
4. Asegúrate de que los puertos 3000 y 5500 estén disponibles
