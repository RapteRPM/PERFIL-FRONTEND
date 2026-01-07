# 🔄 Reseteo de Usuarios y Creación de Admin

## ✅ Hash Generado

La contraseña **RPM2026*** ha sido hasheada correctamente y el archivo SQL está listo para ejecutarse.

---

## 📋 Credenciales del Nuevo Administrador

| Campo | Valor |
|-------|-------|
| **Usuario** | admin@rpm.com |
| **Contraseña** | RPM2026* |
| **ID** | 1001092582 |
| **Tipo** | Administrador |
| **Estado** | Activo |

---

## 🚀 Cómo Ejecutar el Script

### Opción 1: Desde Railway (Recomendado)

1. Ve a tu proyecto en Railway
2. Abre la base de datos MySQL
3. Busca la opción "Query" o "Console"
4. Copia el contenido de `resetear-usuarios.sql`
5. Pégalo y ejecuta

### Opción 2: Línea de Comandos (Si tienes acceso local)

```bash
# Si la BD está en Railway, usa los datos de conexión de Railway
mysql -h <railway-host> -P <puerto> -u <usuario> -p <nombre-bd> < resetear-usuarios.sql

# Si la BD está en localhost
mysql -u root -p rpm_market < resetear-usuarios.sql
```

### Opción 3: Cliente MySQL (como MySQL Workbench)

1. Conecta a tu base de datos
2. Abre el archivo `resetear-usuarios.sql`
3. Ejecuta el script completo

---

## ⚠️ ADVERTENCIA

Este script:
- ❌ **ELIMINARÁ TODOS** los usuarios existentes
- ❌ **ELIMINARÁ TODOS** los datos relacionados (publicaciones, facturas, PQRs, etc.)
- ✅ Creará un nuevo usuario administrador desde cero
- ✅ Reseteará todos los AUTO_INCREMENT a 1

**Solo ejecuta este script si estás seguro de querer resetear toda la base de datos.**

---

## 🔍 Verificación

Después de ejecutar el script, verifica que el administrador fue creado:

```sql
SELECT 
  u.IdUsuario,
  u.TipoUsuario,
  u.Nombre,
  u.Correo,
  u.Estado,
  c.NombreUsuario
FROM usuario u
LEFT JOIN credenciales c ON c.Usuario = u.IdUsuario;
```

Deberías ver:
```
IdUsuario   | TipoUsuario    | Nombre         | Correo          | Estado | NombreUsuario
1001092582  | Administrador  | Administrador  | admin@rpm.com   | Activo | admin@rpm.com
```

---

## 🧪 Probar el Login

1. Ve a: `/General/Ingreso.html`
2. Usuario: `admin@rpm.com`
3. Contraseña: `RPM2026*`
4. Deberías ser redirigido a: `/Administrador/panel_admin.html`

---

## 📁 Archivos Generados

- ✅ `resetear-usuarios.sql` - Script SQL listo para ejecutar
- ✅ `generar-hash-admin.js` - Script para generar hash (ya ejecutado)
- ✅ `resetear-usuarios.js` - Script Node.js alternativo (requiere BD local)

---

## 🔄 Si Necesitas Cambiar la Contraseña Después

Ejecuta este script Node.js con la nueva contraseña:

```bash
node generar-hash-admin.js
```

Luego ejecuta el SQL actualizado.

---

**Fecha de creación:** Enero 7, 2026
