# 📋 ESTADO DEL SISTEMA RPM MARKET

**Fecha de verificación:** 18 de Enero de 2026  
**Ambiente:** Desarrollo Local (SQLite)  
**Servidor:** http://localhost:3000

---

## ✅ SISTEMA FUNCIONAL

El sistema RPM Market está **100% funcional** para desarrollo local con SQLite como base de datos.

---

## 🔑 CREDENCIALES DE ACCESO

| Usuario | Correo | Contraseña | Tipo | Estado |
|---------|--------|------------|------|--------|
| Administrador | admin@rpm.com | **RPM2026*** | Administrador | ✅ Activo |
| Karolay López | karolaynlopez15@gmail.com | - | PrestadorServicio | ⏳ Pendiente aprobación |

---

## 🌐 URLS PRINCIPALES

| Página | URL |
|--------|-----|
| Inicio | http://localhost:3000/ |
| Login | http://localhost:3000/General/Ingreso.html |
| Registro | http://localhost:3000/General/Registro.html |
| Panel Admin | http://localhost:3000/Administrador/panel_admin.html |
| Gestión Usuarios | http://localhost:3000/Administrador/gestion_usuarios.html |
| Gestión PQRs | http://localhost:3000/Administrador/gestion_pqr.html |
| Gestión Publicaciones | http://localhost:3000/Administrador/gestion_publicaciones.html |

---

## 📊 FUNCIONALIDADES VERIFICADAS

### ✅ Autenticación
- [x] Login con usuario y contraseña
- [x] Validación de usuarios inactivos
- [x] Control de sesiones activas
- [x] Cierre de sesión con limpieza de localStorage

### ✅ Registro de Usuarios
- [x] Flujo de registro con verificación por email
- [x] Código de 4 dígitos enviado por correo
- [x] Página crear-contrasena.html para completar registro
- [x] Usuarios se guardan en `registros_pendientes` hasta verificación
- [x] Validación de documento y correo duplicados

### ✅ Panel de Administrador
- [x] Ver todos los usuarios registrados
- [x] Aprobar/Rechazar usuarios (toggle estado)
- [x] Eliminar usuarios (con eliminación en cascada)
- [x] Ver todas las publicaciones
- [x] Eliminar publicaciones
- [x] Ver todas las PQRs
- [x] Responder PQRs con notificación por correo

### ✅ Publicaciones
- [x] Crear publicaciones (comerciantes)
- [x] Ver publicaciones públicas
- [x] Filtrar por categoría
- [x] Publicaciones de grúas (prestadores)

### ✅ Sistema de PQRs
- [x] Enviar PQR (Petición, Queja, Reclamo)
- [x] Listar PQRs pendientes
- [x] Responder PQRs
- [x] Notificación por correo al responder

---

## ⚙️ CONFIGURACIÓN TÉCNICA

### Base de Datos
- **Desarrollo:** SQLite (`rpm_market.db`)
- **Producción (futuro):** MySQL Railway

### Variables de Entorno (.env)
```
EMAIL_USER=rpmservice2026@gmail.com
EMAIL_PASS=wwejnlyeiyadouob
DB_HOST=shortline.proxy.rlwy.net
DB_PORT=10158
DB_USER=root
DB_PASSWORD=nhXnxcTkSvzpoQHQWgMPcDiIyDYXLxJq
DB_NAME=railway
```

### Estructura de Tablas SQLite
- `usuario` - Usuarios del sistema
- `credenciales` - Credenciales de login
- `perfilnatural` - Perfiles de usuarios naturales
- `comerciante` - Datos de comerciantes
- `prestadorservicio` - Datos de prestadores de servicio
- `publicacion` - Publicaciones de comercios
- `publicaciongrua` - Publicaciones de grúas
- `centroayuda` - PQRs con columnas de respuesta
- `sesion_activa` - Control de sesiones
- `tokens_verificacion` - Tokens de verificación email
- `registros_pendientes` - Registros antes de verificación

---

## 🚀 CÓMO INICIAR

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor
```bash
node server.js
```

### 3. Abrir navegador
```
http://localhost:3000
```

### 4. Iniciar sesión como admin
- Usuario: `admin@rpm.com`
- Contraseña: `RPM2026*`

---

## 📧 CONFIGURACIÓN DE CORREO

El sistema usa Gmail SMTP para enviar correos:
- Verificación de registro (código de 4 dígitos)
- Recuperación de contraseña
- Respuesta a PQRs

La contraseña de aplicación ya está configurada en `.env`.

---

## 🔒 SEGURIDAD IMPLEMENTADA

1. **Contraseñas hasheadas** con bcrypt
2. **Sesiones** con express-session
3. **Verificación de email** antes de crear usuario
4. **Control de usuarios inactivos**
5. **Protección de endpoints admin**
6. **No se insertan datos de prueba automáticamente**

---

## 📝 NOTAS IMPORTANTES

1. **MySQL Railway no accesible desde Codespaces:** El servidor MySQL en Railway no es accesible desde GitHub Codespaces. Para producción, deberás desplegar en un servidor con acceso a Railway.

2. **SQLite es solo para desarrollo:** No usar SQLite en producción. Cuando despliegues, configura MySQL.

3. **Contraseña del admin:** La contraseña del admin es `RPM2026*`, no `123456` (que era de prueba).

4. **Verificación de email:** Los usuarios nuevos no se crean hasta que verifiquen el código de 4 dígitos.

---

## 🐛 PROBLEMAS CONOCIDOS

1. **MySQL no conecta desde Codespaces:** Es un problema de red, no del código.
2. **Algunas tablas no tienen todos los campos:** Se crearon scripts de migración para agregar campos faltantes.

---

## ✅ SISTEMA LISTO PARA PRUEBAS MANUALES

El código está completo y funcional. Puedes:
1. Registrar nuevos usuarios
2. Verificar por email
3. Iniciar sesión
4. Usar todas las funcionalidades del panel de admin
5. Crear publicaciones (como comerciante)
6. Enviar PQRs (como usuario)

---

*Documentación generada automáticamente el 18 de Enero de 2026*
