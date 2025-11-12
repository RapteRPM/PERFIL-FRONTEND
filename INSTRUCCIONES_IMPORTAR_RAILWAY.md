# Instrucciones para Importar Datos a Railway MySQL

## ✅ Estado Actual
- **Local**: 4 usuarios, varias publicaciones y grúas
- **Railway**: Base de datos vacía (0 usuarios, 0 publicaciones, 0 grúas)

## 📋 Paso 1: Conectarse a Railway MySQL

### Opción A - Desde Railway Dashboard (Más fácil)
1. Ve a tu proyecto en Railway: https://railway.app/dashboard
2. Click en el servicio **MySQL**
3. Ve a la pestaña **"Data"**
4. Click en **"Query"** (arriba a la derecha)
5. Ahora puedes pegar los comandos SQL directamente

### Opción B - Desde Terminal con Railway CLI
```bash
# Instalar Railway CLI (si no lo tienes)
npm i -g @railway/cli

# Login en Railway
railway login

# Conectar al proyecto
railway link

# Conectar a MySQL
railway connect mysql
```

## 📦 Paso 2: Importar los Datos

He generado el archivo `datos_railway.sql` con todos tus datos locales.

### Si usas Railway Dashboard (Opción A):
1. Abre el archivo `datos_railway.sql`
2. Copia TODO el contenido
3. Pégalo en el Query editor de Railway
4. Click en **"Run"** o **"Execute"**

### Si usas Railway CLI (Opción B):
```bash
# Estando conectado a MySQL de Railway
source datos_railway.sql
```

O desde tu terminal local:
```bash
mysql -h shortline.proxy.rlwy.net -P 10158 -u root -p railway < datos_railway.sql
```
(Te pedirá la contraseña de MySQL que está en las variables de entorno de Railway)

## 🔍 Paso 3: Verificar que se importó correctamente

Ejecuta desde tu terminal:
```bash
curl https://luminous-miracle-production-8ee4.up.railway.app/api/db-status
```

Deberías ver algo como:
```json
{
  "status": "connected",
  "usuarios": 4,
  "publicaciones": X,
  "gruas": X
}
```

## 🎯 Paso 4: Verificar el Frontend

Abre en tu navegador:
```
https://luminous-miracle-production-8ee4.up.railway.app/General/index.html
```

Deberías ver las mismas publicaciones que ves en tu entorno local.

## ⚠️ Notas Importantes

- El archivo `datos_railway.sql` incluye:
  - Usuarios (con contraseñas encriptadas)
  - Credenciales
  - Publicaciones
  - Publicaciones de grúas
  - Comerciantes y prestadores de servicio
  - Categorías

- **NO** incluye las imágenes físicas del servidor, solo las rutas en la base de datos
- Las imágenes tendrás que subirlas manualmente o usar las que ya estén en el servidor

## 🐛 Problemas Comunes

**Error: "Table doesn't exist"**
- Verifica que las tablas existan: `SHOW TABLES;`
- Si no existen, Railway no ejecutó el `rpm_market.sql` inicial

**Error: "Duplicate entry"**
- Ya existen algunos datos, puedes hacer `TRUNCATE TABLE usuario;` antes de importar

**Error: "Access denied"**
- Verifica las credenciales de MySQL en Railway variables de entorno
