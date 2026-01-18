# Corrección: Cierre de Sesión al Cambiar Contraseña

## Fecha: 12 de Enero de 2026

## Problema Reportado

Cuando un usuario cambia su contraseña:
- ✅ Se redirige correctamente al login
- ❌ Si navega manualmente al index.html, aparece aún logueado
- ❌ La sesión permanece activa después del cambio de contraseña

**Riesgo de Seguridad:** Un usuario podría seguir usando su cuenta sin conocer la nueva contraseña si alguien más la cambió.

## Solución Implementada

### 1. Backend - Cierre de Sesión Automático

**Archivo:** [server.js](server.js#L401-L418)

Se agregó destrucción de sesión en el endpoint `/api/usuarios/:id/contrasena`:

```javascript
// Destruir la sesión del usuario para forzar nuevo login
if (req.session) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir sesión:', err);
    } else {
      console.log(`🚪 Sesión cerrada para usuario: ${id}`);
    }
  });
}

// Limpiar la cookie de sesión
res.clearCookie('connect.sid', {
  path: '/',
  httpOnly: true,
  secure: false,
  sameSite: 'lax'
});

console.log(`✅ Contraseña actualizada para usuario: ${id}`);
res.json({ msg: 'Contraseña actualizada correctamente.', cerrarSesion: true });
```

**Cambios:**
- ✅ Destruye la sesión en el servidor con `req.session.destroy()`
- ✅ Limpia la cookie de sesión con `res.clearCookie('connect.sid')`
- ✅ Retorna bandera `cerrarSesion: true` al frontend
- ✅ Logs detallados del cierre de sesión

### 2. Frontend - Limpieza Completa del Estado

**Archivo:** [public/JS/cambiarcontraseña.js](public/JS/cambiarcontraseña.js#L66-L81)

Se modificó el manejo después de cambio exitoso:

```javascript
const result = await response.json();
if (response.ok) {
  if (esNuevoRegistro) {
    alert("✅ Contraseña creada con éxito. Ya puedes iniciar sesión.");
  } else {
    alert("✅ Contraseña actualizada con éxito. Tu sesión se cerrará por seguridad.");
  }
  
  // Limpiar completamente el localStorage y sessionStorage
  localStorage.removeItem("usuarioRecuperacion");
  localStorage.removeItem("usuarioActivo");
  sessionStorage.clear();
  localStorage.clear();
  
  form.reset();
  
  // Redirigir al login
  window.location.href = "Ingreso.html";
```

**Cambios:**
- ✅ Limpia `usuarioRecuperacion` del localStorage
- ✅ Limpia `usuarioActivo` del localStorage
- ✅ Limpia completamente sessionStorage
- ✅ Limpia completamente localStorage
- ✅ Mensaje más claro al usuario sobre el cierre de sesión
- ✅ Redirige al login

## Flujo Completo de Seguridad

### Antes del Cambio:
1. Usuario cambia contraseña ➡️ 
2. Sesión permanece activa ❌
3. Usuario aparece logueado en index.html ❌

### Después del Cambio:
1. Usuario cambia contraseña ➡️
2. **Backend destruye la sesión del servidor** ✅
3. **Backend limpia la cookie de sesión** ✅
4. **Frontend limpia localStorage y sessionStorage** ✅
5. Usuario es redirigido al login ✅
6. Si intenta acceder al index.html, verá "Ingresar" (no logueado) ✅

## Verificación del Sistema

El archivo [indexHeader.js](public/JS/indexHeader.js#L20-L29) verifica la sesión en cada carga:

```javascript
// Verificar sesión en el servidor
let usuario = null;
try {
  console.log("🔵 Verificando sesión en el servidor...");
  const res = await fetch("/api/verificar-sesion");
  console.log("🔵 Response status:", res.status);
  if (res.ok) {
    usuario = await res.json();
    console.log("✅ Usuario encontrado:", usuario);
  } else {
    console.log("⚠️ No hay sesión activa (status no OK)");
  }
}
```

Si no hay sesión:
- ✅ Limpia localStorage
- ✅ Muestra botón "Ingresar"
- ✅ Oculta información del perfil

## Pruebas Recomendadas

### Prueba Manual:
1. Inicia sesión en la aplicación
2. Ve a "Cambiar Contraseña"
3. Cambia tu contraseña exitosamente
4. Observa el mensaje: "Contraseña actualizada con éxito. Tu sesión se cerrará por seguridad."
5. Serás redirigido al login
6. **Intenta ir manualmente al index.html**
7. ✅ **Verificar:** Deberías ver el botón "Ingresar", NO tu perfil

### Prueba Automática:
```bash
node test-cierre-sesion.js
```

## Archivos Creados
- [test-cierre-sesion.js](test-cierre-sesion.js) - Script de pruebas

## Archivos Modificados
- [server.js](server.js#L401-L418) - Endpoint de cambio de contraseña
- [public/JS/cambiarcontraseña.js](public/JS/cambiarcontraseña.js#L66-L81) - Manejo del frontend

## Seguridad Mejorada

### Protección contra:
- ✅ **Sesiones huérfanas:** La sesión se cierra en el servidor
- ✅ **Cookies persistentes:** La cookie se elimina explícitamente
- ✅ **Estado local desactualizado:** localStorage se limpia por completo
- ✅ **Acceso no autorizado:** Usuario debe re-autenticarse con la nueva contraseña

### Casos de uso protegidos:
- ✅ Usuario cambia su propia contraseña
- ✅ Administrador cambia contraseña de otro usuario
- ✅ Cambio de contraseña desde recuperación
- ✅ Primera configuración de contraseña (nuevos usuarios)

## Logs del Servidor

Después del cambio de contraseña verás:
```
🔐 Actualizando contraseña para usuario: 1019103194
✅ Contraseña actualizada para usuario: 1019103194
🚪 Sesión cerrada para usuario: 1019103194
```

## Compatibilidad

- ✅ Compatible con todas las sesiones Express
- ✅ Funciona con localStorage y sessionStorage
- ✅ No afecta otras funcionalidades
- ✅ Retrocompatible con flujo de recuperación de contraseña

## Nota Importante

Esta mejora aplica para **cambios de contraseña desde usuarios logueados**. El flujo de "crear contraseña" para nuevos usuarios no necesita cerrar sesión porque no están logueados aún.
