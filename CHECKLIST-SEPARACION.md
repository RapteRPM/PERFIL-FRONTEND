# ✅ Checklist de Separación Frontend/Backend

## 📋 Lista de Verificación Completa

Usa este checklist para asegurarte de que la separación entre frontend y backend se ha completado correctamente.

---

## 🔧 Parte 1: Configuración del Backend (Este Repositorio)

### Instalación y Configuración Básica

- [ ] Repositorio clonado: `git clone https://github.com/RapteRPM/PERFIL-FRONTEND.git`
- [ ] Dependencias instaladas: `npm install`
- [ ] Archivo `.env` creado desde `.env.example`
- [ ] Variables de entorno configuradas:
  - [ ] `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - [ ] `EMAIL_USER`, `EMAIL_PASS`
  - [ ] `SESSION_SECRET`
  - [ ] `PORT=3000`
  - [ ] `NODE_ENV=development`
  - [ ] `FRONTEND_URLS`

### Base de Datos

- [ ] MySQL instalado (o disponible en servidor remoto)
- [ ] Base de datos `rpm_market` creada
- [ ] Esquema importado: `mysql -u root -p rpm_market < rpm_market.sql`
- [ ] Conexión a BD funciona: verificar con `/api/db-status`

### Estructura de Archivos

- [ ] Carpeta `config/` con `db.js`
- [ ] Carpeta `controllers/` con controladores
- [ ] Carpeta `middlewares/` con `sesion.js`
- [ ] Carpeta `routes/` con rutas
- [ ] Carpeta `uploads/` existe (puede estar vacía)
- [ ] Carpeta `public/imagen/` existe (para servir imágenes)

### Servidor Funcionando

- [ ] Servidor inicia sin errores: `npm start`
- [ ] Health check funciona: `curl http://localhost:3000/health`
- [ ] DB status funciona: `curl http://localhost:3000/api/db-status`
- [ ] Endpoint raíz funciona: `curl http://localhost:3000/`
- [ ] No hay errores en la consola

### CORS Configurado

- [ ] CORS permite `http://localhost:5500` y `http://127.0.0.1:5500`
- [ ] `credentials: true` habilitado en CORS
- [ ] Variable `FRONTEND_URLS` configurada en `.env`

---

## 🎨 Parte 2: Configuración del Frontend

### Repositorio y Estructura

- [ ] Repositorio frontend clonado: `git clone https://github.com/RapteRPM/Perfil.git`
- [ ] Archivos HTML copiados desde `PERFIL-FRONTEND/public/` al frontend
  - [ ] `Administrador/`
  - [ ] `Comerciante/`
  - [ ] `General/`
  - [ ] `Natural/`
  - [ ] `PrestadorServicios/`
  - [ ] `JS/`
  - [ ] `image/` e `Imagen/` (imágenes estáticas)

### Configuración de API

- [ ] Archivo `config.js` creado con `API_URL = 'http://localhost:3000'`
- [ ] Variable `API_URL` exportada correctamente

### Actualización de Archivos JavaScript

Archivos a actualizar (agregar `API_URL` y `credentials: 'include'`):

#### General
- [ ] `JS/app.js`
- [ ] `JS/registro.js`
- [ ] `JS/perfil_usuario.js`
- [ ] `JS/Visualizacion_publicaciones.js`
- [ ] `JS/cambiarcontraseña.js`
- [ ] `JS/RecuperarContraseña.js`
- [ ] `JS/centroAyuda.js`
- [ ] `JS/market_gruas.js`
- [ ] `JS/mapa.js`

#### Administrador
- [ ] `JS/Administrador/gestion_usuarios.js`
- [ ] `JS/Administrador/gestion_publicaciones.js`
- [ ] `JS/Administrador/gestion_pqr.js`
- [ ] `JS/Administrador/panel_admin.js`

#### Comerciante
- [ ] `JS/Comerciante/perfil_comerciante.js`
- [ ] `JS/Comerciante/publicar.js`
- [ ] `JS/Comerciante/editar_publicacion.js`
- [ ] `JS/Comerciante/historial_ventas.js`
- [ ] `JS/Comerciante/control_agenda.js`

#### Natural
- [ ] `JS/Natural/carrito_compras.js`
- [ ] `JS/Natural/detalle_producto.js`
- [ ] `JS/Natural/proceso_compra.js`
- [ ] `JS/Natural/historial_compras.js`
- [ ] `JS/Natural/factura_compra.js`

#### Prestador
- [ ] `JS/Prestador/perfil_servicios.js`
- [ ] `JS/Prestador/publicar_grua.js`
- [ ] `JS/Prestador/agenda_gruas.js`
- [ ] `JS/Prestador/historia_servicios.js`

### Patrón de Actualización en Cada Archivo

Verificar que CADA archivo tenga:

```javascript
// ✅ Al inicio del archivo
const API_URL = 'http://localhost:3000';

// ✅ En TODAS las peticiones fetch
fetch(`${API_URL}/api/endpoint`, {
  method: 'POST', // o GET, PUT, DELETE
  credentials: 'include', // ⚠️ CRÍTICO
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos)
})
```

### URLs de Imágenes Actualizadas

- [ ] Todas las referencias a `/imagen/` actualizadas a `${API_URL}/imagen/`
- [ ] Imágenes de perfil usan API_URL
- [ ] Imágenes de publicaciones usan API_URL
- [ ] Imágenes de productos usan API_URL

---

## 🧪 Parte 3: Pruebas de Integración

### Iniciar Ambos Servidores

- [ ] **Backend**: Terminal 1 - `cd PERFIL-FRONTEND && npm start`
  - [ ] Puerto 3000 escuchando
  - [ ] Sin errores en consola
  
- [ ] **Frontend**: Terminal 2 - Abrir con Live Server
  - [ ] Puerto 5500 activo
  - [ ] Página carga correctamente

### Probar Funcionalidades Core

#### Autenticación
- [ ] Página de login carga sin errores CORS
- [ ] Login con usuario válido funciona
- [ ] Sesión se mantiene al navegar entre páginas
- [ ] Logout funciona correctamente
- [ ] Protección de rutas funciona (redirige si no hay sesión)

#### Usuarios
- [ ] Registro de nuevo usuario funciona
- [ ] Ver perfil de usuario funciona
- [ ] Editar perfil funciona
- [ ] Cambiar contraseña funciona
- [ ] Recuperar contraseña funciona

#### Publicaciones
- [ ] Ver lista de publicaciones funciona
- [ ] Ver detalle de publicación funciona
- [ ] Crear nueva publicación funciona
- [ ] Editar publicación funciona
- [ ] Eliminar publicación funciona
- [ ] Imágenes de publicaciones cargan correctamente

#### Carrito y Compras (Usuario Natural)
- [ ] Agregar producto al carrito funciona
- [ ] Ver carrito funciona
- [ ] Actualizar cantidad en carrito funciona
- [ ] Eliminar del carrito funciona
- [ ] Proceso de compra completo funciona
- [ ] Historial de compras funciona

#### Panel Comerciante
- [ ] Ver publicaciones propias funciona
- [ ] Historial de ventas funciona
- [ ] Control de agenda funciona
- [ ] Gestión de pedidos funciona

#### Panel Prestador de Servicios
- [ ] Publicar servicio de grúa funciona
- [ ] Agenda de grúas funciona
- [ ] Historial de servicios funciona

#### Panel Administrador
- [ ] Gestión de usuarios funciona
- [ ] Gestión de publicaciones funciona
- [ ] Gestión de PQR funciona

### Verificaciones Técnicas

- [ ] **Consola del navegador (F12)**: Sin errores JavaScript
- [ ] **Network tab**: Peticiones a `http://localhost:3000` exitosas
- [ ] **Cookies**: Cookie de sesión se crea y se envía correctamente
- [ ] **CORS**: No hay errores de CORS en consola
- [ ] **Headers**: `credentials: 'include'` presente en peticiones
- [ ] **Response**: Respuestas del servidor correctas (200, 201, etc.)

---

## 🚀 Parte 4: Preparación para Producción

### Backend en Producción

- [ ] Servidor de producción elegido (Railway, Render, Heroku, etc.)
- [ ] Variables de entorno configuradas en servidor:
  - [ ] Base de datos MySQL en la nube
  - [ ] `NODE_ENV=production`
  - [ ] `SESSION_SECRET` seguro y único
  - [ ] `FRONTEND_URLS` con URL de producción del frontend
- [ ] Base de datos importada en servidor
- [ ] Backend desplegado y accesible
- [ ] Health checks funcionan en producción

### Frontend en Producción

- [ ] Servicio de hosting elegido (Netlify, Vercel, GitHub Pages, etc.)
- [ ] `config.js` actualizado con URL de backend en producción:
  ```javascript
  const API_URL = 'https://tu-backend-produccion.com';
  ```
- [ ] Frontend desplegado y accesible
- [ ] Conexión con backend funciona en producción

### Verificación Final en Producción

- [ ] Login funciona en producción
- [ ] Sesiones funcionan en producción
- [ ] CORS configurado correctamente para producción
- [ ] Imágenes cargan en producción
- [ ] Todas las funcionalidades críticas funcionan
- [ ] No hay errores en consola en producción

---

## 📊 Resumen de Estado

### Completado ✅
Marca aquí cuando termines cada sección principal:

- [ ] **Backend configurado localmente**
- [ ] **Frontend separado y configurado**
- [ ] **Pruebas locales exitosas**
- [ ] **Despliegue en producción**

---

## 🆘 Recursos de Ayuda

Si encuentras problemas, consulta:

| Problema | Documento |
|----------|-----------|
| Configuración inicial | [GUIA-RAPIDA.md](GUIA-RAPIDA.md) |
| Separación detallada | [SEPARACION-FRONTEND.md](SEPARACION-FRONTEND.md) |
| Documentación técnica | [README-BACKEND.md](README-BACKEND.md) |
| Migración y deploy | [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) |
| Ejemplos de código | [FRONTEND-CONFIG-EXAMPLE.js](FRONTEND-CONFIG-EXAMPLE.js) |

---

## 📝 Notas Adicionales

Usa este espacio para anotar problemas encontrados o soluciones específicas:

```
[Tu espacio para notas]




```

---

<p align="center">
  <strong>🎯 Objetivo Final</strong><br>
  Backend y Frontend completamente separados, comunicándose vía API REST,<br>
  listos para despliegue independiente en producción.
</p>
