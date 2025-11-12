# Railway Setup Instructions

## Variables de Entorno Requeridas

```env
DB_HOST=shortline.proxy.rlwy.net
DB_PORT=10158
DB_USER=root
DB_PASSWORD=[obtener de Railway MySQL service]
DB_NAME=railway
SESSION_SECRET=[generar aleatorio o usar existente]
NODE_ENV=production
```

⚠️ **NO configurar PORT manualmente** - Railway lo asigna automáticamente

## Pasos para Recrear Servicio

### 1. Eliminar servicio Node.js actual
- Dashboard → PERFIL-FRONTEND service → Settings
- Scroll down → "Remove Service from Project"
- ⚠️ **NO eliminar MySQL database**

### 2. Crear nuevo servicio
- Dashboard → "+ New" → "GitHub Repo"
- Seleccionar: `RapteRPM/PERFIL-FRONTEND`
- Branch: `main`
- Railway auto-detectará Node.js

### 3. Configurar variables
- New Service → "Variables" tab
- Agregar todas las variables listadas arriba
- Railway redeployará automáticamente

### 4. Verificar conexión
- Ver logs: debe mostrar "✅ Conectado a MySQL"
- Debe decir `proytecto@1.0.1` (no 1.0.0)

### 5. Probar endpoint
```bash
curl https://[tu-url].railway.app/api/registro \
  -F "Usuario=1000000001" \
  -F "TipoUsuario=Natural" \
  -F "Nombre=Juan" \
  -F "Apellido=Pérez" \
  -F "Correo=test@test.com" \
  -F "Telefono=3001234567" \
  -F "Direccion=Calle 1" \
  -F "Barrio=Centro" \
  -F "Contrasena=Test123!" \
  -F "FotoPerfil=@/tmp/test.png"
```

## Diagnóstico de Problemas

### 1. Verificar Health Check
```bash
curl https://[tu-url].railway.app/health
```
Debe responder: `{"status":"OK","timestamp":"...","port":...,"env":"production"}`

### 2. Verificar Base de Datos
```bash
curl https://[tu-url].railway.app/api/db-status
```
Debe mostrar cuántos usuarios, publicaciones y grúas hay en la BD.
Si todos están en 0, la base de datos está vacía y necesitas importar datos.

### 3. Verificar logs en Railway
- Dashboard → Service → "Deployments"
- Click en el deployment activo
- Ver "View Logs"
- Buscar: `✅ Conectado a MySQL`

### 4. Problemas comunes

**Error: "Cannot connect to MySQL"**
- Verificar que las variables DB_HOST, DB_PORT, DB_USER, DB_PASSWORD estén configuradas
- Verificar que el servicio MySQL esté activo
- Verificar que el usuario tenga permisos

**Error: "App crashed" o "Application failed to respond"**
- Verificar que NO hayas configurado PORT manualmente
- Railway asigna el puerto automáticamente vía process.env.PORT

**Error: "No aparece nada en el frontend"**
- Abrir https://[tu-url].railway.app/General/index.html
- Verificar la consola del navegador (F12) para errores de CORS o API
- Verificar que las rutas de las APIs estén respondiendo
- **MUY IMPORTANTE**: Verificar `/api/db-status` - si todo está en 0, la BD está vacía

**Base de datos vacía (usuarios: 0, publicaciones: 0)**
- Railway MySQL se creó vacío, solo tiene la estructura
- Necesitas conectarte a Railway MySQL y ejecutar INSERTs manualmente
- O usar Railway CLI para importar un dump SQL con datos
```bash
# Conectar a Railway MySQL
railway connect mysql

# Dentro de MySQL, verificar tablas
SHOW TABLES;
SELECT COUNT(*) FROM usuario;
```

### 5. Comandos útiles
```bash
# Ver todas las publicaciones
curl https://[tu-url].railway.app/api/publicaciones_publicas

# Ver grúas
curl https://[tu-url].railway.app/api/marketplace-gruas

# Health check
curl https://[tu-url].railway.app/health
```

## Notas
- La base de datos MySQL NO se toca, mantiene todos los datos
- Solo recreamos el servicio Node.js
- Total tiempo estimado: 5 minutos
- El servidor ahora usa `process.env.PORT` para Railway
