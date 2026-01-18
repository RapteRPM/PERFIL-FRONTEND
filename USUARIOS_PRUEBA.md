# 👥 Usuarios de Prueba Creados

## ✅ Usuarios Disponibles

Todos los usuarios tienen la contraseña: **`123456`**

### 1. 👨‍💼 Administrador
- **Usuario**: `admin@rpm.com`
- **Contraseña**: `123456`
- **Estado**: Activo
- **Documento**: 999999999
- **Acceso**: Panel de Administración completo

### 2. 👤 Usuario Natural
- **Usuario**: `juan@test.com`
- **Contraseña**: `123456`
- **Estado**: Activo
- **Documento**: 123456789
- **Nombre**: Juan Pérez
- **Acceso**: Compras, carrito, historial

### 3. 🏪 Comerciante
- **Usuario**: `maria@test.com`
- **Contraseña**: `123456`
- **Estado**: Activo
- **Documento**: 987654321
- **Nombre**: María González
- **Negocio**: Repuestos María
- **Acceso**: Publicar productos, gestionar ventas

### 4. 🚛 Prestador de Servicio (INACTIVO)
- **Usuario**: `carlos@test.com`
- **Contraseña**: `123456`
- **Estado**: **Inactivo** ⚠️
- **Documento**: 555555555
- **Nombre**: Carlos Ramírez
- **Acceso**: BLOQUEADO - Requiere aprobación del administrador

## 🧪 Pruebas Disponibles

### Probar Sistema de Aprobación:

1. **Intentar login con Carlos** (Prestador Inactivo)
   - Usuario: `carlos@test.com`
   - Debe mostrar mensaje: "Su cuenta está en revisión..."
   - NO debe permitir acceso

2. **Activar a Carlos desde Admin**
   - Login como `admin@rpm.com`
   - Ir a Gestión de Usuarios
   - Buscar a Carlos (badge rojo "Inactivo")
   - Click en botón verde ✓ "Activar"
   - Estado cambia a "Activo"

3. **Login exitoso de Carlos**
   - Ahora puede iniciar sesión correctamente

### Probar Gestión de Usuarios:

1. **Ver todos los usuarios**
   - Login como administrador
   - Ir a Gestión de Usuarios
   - Ver lista con 4 usuarios

2. **Desactivar usuario activo**
   - Seleccionar Juan o María
   - Click en botón amarillo ⊘
   - Usuario queda Inactivo

3. **Eliminar usuario**
   - Click en botón rojo 🗑️
   - Confirmar eliminación
   - Usuario se elimina permanentemente

## 📊 Estado Actual

✅ **Categorías**: 4 (Accesorios, Repuestos, Servicio mecánico, Servicio de grúa)
✅ **Usuarios**: 4 (1 Admin, 1 Natural, 1 Comerciante, 1 Prestador)
✅ **Credenciales**: 4 (todas con contraseña "123456")
✅ **Campo Estado**: Implementado y funcionando

## 🌐 Acceso al Sistema

**Servidor**: http://localhost:3000

- **Inicio**: http://localhost:3000/General/index.html
- **Login**: http://localhost:3000/General/Ingreso.html
- **Registro**: http://localhost:3000/General/Registro.html
- **Panel Admin**: http://localhost:3000/Administrador/panel_admin.html
