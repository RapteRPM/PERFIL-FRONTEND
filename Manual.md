# 📚 DOCUMENTACIÓN RPM MARKET

**Última actualización:** 18 de Enero de 2026  
**Ambiente:** Desarrollo Local (SQLite) / Producción (MySQL Railway)

---

## 📋 ÍNDICE

1. [Estado del Sistema](#-estado-del-sistema)
2. [Credenciales de Acceso](#-credenciales-de-acceso)
3. [Configuración Railway](#-configuración-railway)
4. [Configuración de Correos Gmail](#-configuración-de-correos-gmail)
5. [Sistema de Aprobación de Usuarios](#-sistema-de-aprobación-de-usuarios)
6. [Sistema de PQR](#-sistema-de-pqr)
7. [Protección de Rutas](#-protección-de-rutas)
8. [Endpoints de la API](#-endpoints-de-la-api)
9. [Inicio Rápido](#-inicio-rápido)

---

## ✅ ESTADO DEL SISTEMA

El sistema RPM Market está **100% funcional**.

### URLs Principales (Desarrollo Local)

| Página | URL |
|--------|-----|
| Inicio | http://localhost:3000/ |
| Login | http://localhost:3000/General/Ingreso.html |
| Registro | http://localhost:3000/General/Registro.html |
| Panel Admin | http://localhost:3000/Administrador/panel_admin.html |
| Gestión Usuarios | http://localhost:3000/Administrador/gestion_usuarios.html |
| Gestión PQRs | http://localhost:3000/Administrador/gestion_pqr.html |

### Funcionalidades Verificadas

- ✅ Login/Logout con validación de usuarios inactivos
- ✅ Registro con verificación por email (código de 4 dígitos)
- ✅ Panel de administrador completo
- ✅ Sistema de publicaciones (comerciantes)
- ✅ Sistema de PQRs con notificación por correo
- ✅ Marketplace de grúas (prestadores)

---

## 🔑 CREDENCIALES DE ACCESO

### Usuarios de Prueba (contraseña: `123456`)

| Usuario | Correo | Tipo | Estado |
|---------|--------|------|--------|
| Administrador | admin@rpm.com | Administrador | ✅ Activo |
| Juan Pérez | juan@test.com | Natural | ✅ Activo |
| María González | maria@test.com | Comerciante | ✅ Activo |
| Carlos Ramírez | carlos@test.com | PrestadorServicio | ⚠️ Inactivo |

### Admin Principal (Producción)

| Campo | Valor |
|-------|-------|
| Usuario | admin@rpm.com |
| Contraseña | RPM2026* |
| Documento | 1001092582 |

---

## 🚀 CONFIGURACIÓN RAILWAY

### Variables de Entorno Requeridas

```env
DB_HOST=shortline.proxy.rlwy.net
DB_PORT=10158
DB_USER=root
DB_PASSWORD=[obtener de Railway MySQL service]
DB_NAME=railway
SESSION_SECRET=[generar aleatorio]
NODE_ENV=production
EMAIL_USER=rpmservice2026@gmail.com
EMAIL_PASS=[contraseña de aplicación Gmail]