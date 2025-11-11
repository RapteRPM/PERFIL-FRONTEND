# 🔒 Protección de Rutas - Instrucciones

## Problema Solucionado
- ✅ Usuario podía acceder a páginas de perfil usando el botón "Atrás" del navegador sin estar logueado
- ✅ Botón "Ingresar" aparecía en index.html incluso cuando el usuario ya estaba logueado
- ✅ Error CORS al enviar formulario de centro de ayuda (usaba localhost:3000)

## Solución Implementada

### 1. Script de Protección: `protegerRuta.js`
**Ubicación:** `/public/JS/protegerRuta.js`

**Funcionamiento:**
- Verifica si hay usuario en `localStorage`
- Verifica con el servidor si la sesión es válida
- Si no hay sesión, redirige automáticamente a `/General/Ingreso.html`

### 2. Cómo Usar en Páginas Protegidas

Agregar al **inicio del `<head>`** de cada página que requiera autenticación:

```html
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- 🔒 PROTECCIÓN DE RUTA - DEBE IR AL INICIO -->
  <script src="../JS/protegerRuta.js"></script>
  
  <title>Tu Página</title>
  <!-- resto de scripts y estilos -->
</head>
```

### 3. Páginas que DEBEN tener protección

#### Natural (Usuario Natural)
- ✅ `perfil_usuario.html` - YA TIENE validación en JS
- ✅ `Editar_perfil.html` - YA TIENE validación en JS
- ⚠️ `carrito_compras.html` - AGREGAR script
- ⚠️ `Historial_compras.html` - AGREGAR script
- ⚠️ `Proceso_compra.html` - AGREGAR script
- ⚠️ `Factura_compra.html` - AGREGAR script
- ⚠️ `pago_pse.html` - AGREGAR script

#### Comerciante
- ⚠️ `perfil_comerciante.html` - AGREGAR script
- ⚠️ `EditarPerfil_comerciante.html` - AGREGAR script
- ⚠️ `publicar.html` - AGREGAR script
- ⚠️ `registro_publicacion.html` - AGREGAR script
- ⚠️ `Editar_publicacion.html` - AGREGAR script
- ⚠️ `historial_ventas.html` - AGREGAR script
- ⚠️ `Control_agenda.html` - AGREGAR script

#### PrestadorServicios
- ⚠️ `perfil_servicios.html` - AGREGAR script
- ⚠️ `configuracion_prestador.html` - AGREGAR script
- ⚠️ `publicar_grua.html` - AGREGAR script
- ⚠️ `Registro_servicios.html` - AGREGAR script
- ⚠️ `Editar_publicacionServicio.html` - AGREGAR script
- ⚠️ `agenda_gruas.html` - AGREGAR script
- ⚠️ `historia_servicios.html` - AGREGAR script

### 4. Páginas PÚBLICAS (NO necesitan protección)
- ❌ `index.html` - Página principal (pública)
- ❌ `Ingreso.html` - Login (pública)
- ❌ `Registro.html` - Registro (pública)
- ❌ `CentroAyuda.html` - Centro de ayuda (pública, pero valida para enviar)
- ❌ `RecuperarContraseña.html` - Recuperación (pública)
- ❌ `marketplace_gruas.html` - Listado público
- ❌ `UbicaTaller.html` - Mapa público
- ❌ `Detalle_producto.html` - Detalle público (cualquiera puede ver)
- ❌ `Detalle_productoServicio.html` - Detalle público

## Cambios Adicionales Realizados

### ✅ `indexHeader.js`
- Ahora **oculta** el botón "Ingresar" cuando hay sesión activa
- Muestra perfil del usuario en el header cuando está logueado
- Agrega opción "Ver Perfil" y "Cerrar sesión"
- Cerrar sesión ahora llama al endpoint `/logout` del servidor

### ✅ `centroAyuda.js`
- Cambiado `http://localhost:3000/api/centro-ayuda` → `/api/centro-ayuda`
- Elimina problema de CORS

### ✅ `server.js` - Endpoint `/api/centro-ayuda`
- Cambiado de `pool.execute` a `queryPromise` (compatible SQLite)
- Agregados logs para debugging
- Validación mejorada de datos

### ✅ `editar_perfil.js`
- Agregada redirección automática a login si no hay sesión
- Muestra alerta antes de redirigir

## Flujo de Protección

```
Usuario intenta acceder a página protegida
        ↓
protegerRuta.js se ejecuta
        ↓
¿Hay usuario en localStorage?
        ↓ NO
    Redirige a /General/Ingreso.html
        ↓ SÍ
Verifica con servidor (/api/verificar-sesion)
        ↓
¿Sesión válida en servidor?
        ↓ NO
    Limpia localStorage → Redirige a login
        ↓ SÍ
    Permite acceso a la página
```

## Próximos Pasos
1. Agregar `<script src="../JS/protegerRuta.js"></script>` a las páginas marcadas con ⚠️
2. Verificar que todas las páginas de Comerciante y PrestadorServicios validen el tipo de usuario
3. Implementar protección en el servidor (middleware de sesión)

---
**Última actualización:** 2025-11-11
