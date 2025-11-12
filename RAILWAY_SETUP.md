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
PORT=3000
```

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

## Notas
- La base de datos MySQL NO se toca, mantiene todos los datos
- Solo recreamos el servicio Node.js
- Total tiempo estimado: 5 minutos
