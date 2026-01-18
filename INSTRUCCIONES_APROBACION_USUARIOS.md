# 🔧 Instrucciones para Activar el Sistema de Aprobación de Usuarios

## 📋 Resumen de Cambios

Se ha implementado un sistema de aprobación de usuarios donde:
- ✅ **Usuarios Naturales**: Se activan automáticamente
- ⏳ **Comerciantes y Prestadores de Servicio**: Quedan inactivos hasta que el administrador los apruebe
- 🔒 **Usuarios Inactivos**: No pueden iniciar sesión y reciben un mensaje de "cuenta en revisión"
- 👨‍💼 **Administrador**: Puede activar, desactivar o eliminar usuarios desde el panel

## 🚀 Pasos para Activar

### 1️⃣ Ejecutar la Migración SQL

**Debes ejecutar el archivo SQL en tu base de datos de Railway:**

```bash
# Opción 1: Desde la consola de Railway
# Ve a tu proyecto en Railway > MySQL > Connect > Query
# Copia y pega el contenido de: migrations/add-estado-usuario.sql

# Opción 2: Desde tu terminal local (si tienes acceso directo)
mysql -h [HOST] -u [USER] -p[PASSWORD] [DATABASE] < migrations/add-estado-usuario.sql
```

**Contenido del script SQL:**
```sql
-- Agregar el campo Estado a la tabla usuario
ALTER TABLE usuario 
ADD COLUMN Estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo' 
AFTER FotoPerfil;

-- Actualizar todos los usuarios existentes a Activo
UPDATE usuario 
SET Estado = 'Activo' 
WHERE Estado IS NULL;
```

### 2️⃣ Reiniciar el Servidor

Una vez ejecutada la migración, reinicia tu servidor en Railway para que los cambios surtan efecto.

## 🎯 Funcionalidades Implementadas

### Para Nuevos Registros:

#### Usuarios Naturales y Administradores:
- ✅ Se crean con `Estado = 'Activo'`
- ✅ Pueden crear su contraseña inmediatamente
- ✅ Pueden iniciar sesión de inmediato

#### Comerciantes y Prestadores de Servicio:
- ⏳ Se crean con `Estado = 'Inactivo'`
- 📧 Reciben un mensaje: *"Registro exitoso. Su cuenta está en revisión y será activada por un administrador en un lapso de 24 horas. Mientras tanto, no podrá iniciar sesión."*
- 🔒 No pueden crear contraseña hasta ser activados
- 🚫 Si intentan iniciar sesión, verán: *"Su cuenta está en revisión por un administrador. Por favor, vuelva a intentar en un lapso de 24 horas."*

### Panel de Administrador:

El administrador puede gestionar usuarios desde: **Administrador/gestion_usuarios.html**

#### Acciones Disponibles:

1. **Activar Usuario** (botón verde ✓)
   - Cambia el estado de `Inactivo` a `Activo`
   - El usuario podrá iniciar sesión

2. **Desactivar Usuario** (botón amarillo ⊘)
   - Cambia el estado de `Activo` a `Inactivo`
   - El usuario no podrá iniciar sesión

3. **Eliminar Usuario** (botón rojo 🗑️)
   - Elimina permanentemente al usuario
   - **Acción irreversible**

#### Filtros:
- Por tipo de usuario
- Por estado (Activo/Inactivo)
- Búsqueda por nombre, documento o correo

## 📝 Archivos Modificados

### Backend (server.js):
- ✅ `/api/registro` - Asigna estado según tipo de usuario
- ✅ `/api/login` - Verifica estado antes de permitir acceso
- ✅ `/api/admin/usuario/:id/toggle-estado` - Activar/Desactivar
- ✅ `/api/admin/usuario/:id` - Eliminar usuario

### Frontend:
- ✅ `public/JS/registro.js` - Maneja mensajes de aprobación pendiente
- ✅ `public/JS/app.js` - Muestra mensaje cuando usuario está inactivo
- ✅ `public/JS/Administrador/gestionUsuarios.js` - Funciones de gestión
- ✅ `public/Administrador/gestion_usuarios.html` - Interfaz de gestión

### Base de Datos:
- ✅ Nueva columna: `usuario.Estado` ENUM('Activo', 'Inactivo') DEFAULT 'Activo'

## 🔍 Verificación

### Para verificar que todo funciona correctamente:

1. **Ejecutar la migración SQL**
2. **Reiniciar el servidor**
3. **Probar registro de Comerciante:**
   - Registrar un nuevo comerciante
   - Verificar que aparece el mensaje de "cuenta en revisión"
   - Intentar iniciar sesión (debe rechazar con mensaje de aprobación pendiente)
4. **Probar panel de administrador:**
   - Iniciar sesión como administrador
   - Ir a Gestión de Usuarios
   - Verificar que aparece el usuario nuevo con estado "Inactivo"
   - Activar el usuario
5. **Probar login del Comerciante:**
   - Ahora debe poder iniciar sesión correctamente

## ⚠️ Importante

- Todos los usuarios existentes serán marcados como `Activo` automáticamente por la migración
- Los usuarios administradores siempre se crean como `Activo`
- Los usuarios naturales siempre se crean como `Activo`
- Solo Comerciantes y Prestadores de Servicio requieren aprobación

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que la migración SQL se ejecutó correctamente
2. Revisa los logs del servidor para errores
3. Asegúrate de que el campo `Estado` existe en la tabla `usuario`

```sql
-- Query para verificar
SHOW COLUMNS FROM usuario LIKE 'Estado';
```
