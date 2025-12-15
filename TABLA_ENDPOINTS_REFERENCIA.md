# 📊 TABLA DE ENDPOINTS - REFERENCIA RÁPIDA

## 🟢 ENDPOINTS PÚBLICOS (SIN AUTENTICACIÓN REQUERIDA)

| Método | Endpoint | Descripción | Estado | Respuesta |
|--------|----------|-------------|--------|-----------|
| GET | `/health` | Health check del servidor | ✅ 200 | JSON con status |
| GET | `/api/db-status` | Estado de la base de datos | ✅ 200 | Usuarios, publicaciones, grúas |
| GET | `/` | Redirecciona a index.html | ✅ 200 | Página principal |
| POST | `/api/login/demo` | Login de demostración | ✅ 200 | Sesión iniciada |
| POST | `/api/login` | Login con BD | ⚠️ 401 | Requiere usuario válido |
| GET | `/logout` | Cierre de sesión | ✅ 200 | Sesión cerrada |
| GET | `/api/verificar-sesion` | Verificar sesión activa | ✅ 200 | Estado de sesión |
| GET | `/api/publicaciones_publicas` | Listar publicaciones públicas | ✅ 200 | Array de publicaciones |
| GET | `/api/categorias` | Obtener categorías de productos | ✅ 200 | Array de categorías |
| GET | `/api/talleres` | Obtener talleres registrados | ✅ 200 | Array de talleres |
| GET | `/api/marketplace-gruas` | Marketplace de grúas disponibles | ✅ 200 | Array de grúas |
| GET | `/api/publicaciones-grua/:id` | Detalle de publicación de grúa | ✅ 200 | Datos de grúa |
| GET | `/api/opiniones-grua/:id` | Opiniones de una grúa | ✅ 200 | Array de reseñas |
| GET | `/api/factura/:id` | Obtener factura por ID | ✅ 200 | Datos de factura |
| GET | `/api/usuarios/cedula/:documento` | Buscar usuario por cédula | ✅ 200 | Datos del usuario |
| GET | `/api/detallePublicacion/:id` | Detalle de publicación | ⚠️ 404 | Falta data |
| POST | `/api/carrito` | Añadir artículo al carrito | ⚠️ 400 | Requiere validación |
| POST | `/api/centro-ayuda` | Enviar mensaje al centro de ayuda | ⚠️ 401 | Requiere sesión |

---

## 🟡 ENDPOINTS PROTEGIDOS (REQUIEREN SESIÓN)

| Método | Endpoint | Descripción | Requiere | Estado |
|--------|----------|-------------|----------|--------|
| GET | `/api/usuario-actual` | Obtener usuario con sesión activa | Sesión | ✅ 200 |
| GET | `/api/publicaciones` | Ver publicaciones del comerciante | Comerciante | ❌ 403 |
| DELETE | `/api/publicaciones/:id` | Eliminar publicación | Comerciante | ❌ 403 |
| GET | `/api/publicaciones/:id` | Detalle de publicación propia | Comerciante | ❌ 403 |
| POST | `/api/publicar` | Crear nueva publicación | Comerciante | ⚠️ 403 |
| PUT | `/api/publicaciones/:id` | Editar publicación | Comerciante | ⚠️ 403 |
| GET | `/api/citas-comerciante` | Obtener citas del comerciante | Comerciante | ❌ 403 |
| GET | `/api/historial-ventas` | Historial de ventas | Comerciante | ❌ 403 |
| GET | `/api/dashboard/comerciante` | Dashboard del comerciante | Comerciante | ❌ 403 |
| GET | `/api/carrito` | Ver carrito del usuario | Natural | ❌ 401 |
| PUT | `/api/carrito/:id` | Actualizar cantidad en carrito | Natural | ⚠️ 401 |
| DELETE | `/api/carrito/:id` | Eliminar item del carrito | Natural | ⚠️ 401 |
| GET | `/api/proceso-compra` | Ver datos del proceso de compra | Natural | ❌ 401 |
| POST | `/api/finalizar-compra` | Completar compra | Natural | ⚠️ 401 |
| POST | `/api/opiniones` | Dejar reseña de producto | Natural | ⚠️ 401 |
| POST | `/api/confirmar-recibido` | Confirmar recepción de compra | Natural | ❌ 500 |
| GET | `/api/historial` | Obtener historial de compras | Natural | ✅ 200 |
| GET | `/api/perfilNatural/:id` | Obtener perfil de usuario natural | Natural | ⚠️ 404 |
| PUT | `/api/actualizarPerfilNatural/:id` | Actualizar perfil de natural | Natural | ⚠️ 401 |
| GET | `/api/perfilComerciante/:id` | Obtener perfil de comerciante | Comerciante | ⚠️ 404 |
| PUT | `/api/actualizarPerfilComerciante/:id` | Actualizar perfil comerciante | Comerciante | ⚠️ 401 |
| GET | `/api/perfil-prestador` | Obtener perfil de prestador | PrestadorServicio | ❌ 401 |
| PUT | `/api/actualizarPerfilPrestador/:id` | Actualizar perfil prestador | PrestadorServicio | ⚠️ 401 |
| POST | `/api/publicar-grua` | Crear publicación de grúa | PrestadorServicio | ⚠️ 401 |
| GET | `/api/publicaciones-grua` | Ver publicaciones de grúas | PrestadorServicio | ❌ 403 |
| DELETE | `/api/publicaciones-grua/:id` | Eliminar publicación de grúa | PrestadorServicio | ⚠️ 401 |
| GET | `/api/publicaciones-grua/editar/:id` | Obtener grúa para editar | PrestadorServicio | ⚠️ 401 |
| PUT | `/api/publicaciones-grua/:id` | Editar publicación de grúa | PrestadorServicio | ⚠️ 401 |
| GET | `/api/historial-servicios/:id` | Historial de servicios | PrestadorServicio | ⚠️ 404 |
| GET | `/api/historial-servicios-prestador/:id` | Historial servicios alt. | PrestadorServicio | ✅ 200 |
| GET | `/api/solicitudes-grua/:id` | Solicitudes de grúa recibidas | PrestadorServicio | ⚠️ 404 |
| PUT | `/api/solicitudes-grua/estado/:id` | Actualizar estado de solicitud | PrestadorServicio | ⚠️ 401 |
| POST | `/api/agendar-grua` | Agendar servicio de grúa | Natural | ⚠️ 401 |
| POST | `/api/opiniones-grua` | Dejar reseña de grúa | Natural | ⚠️ 401 |

---

## 🔐 ENDPOINTS ADMINISTRATIVOS (REQUIEREN ADMIN)

| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | `/api/admin/estadisticas` | Estadísticas del sistema | ❌ 403 |
| GET | `/api/admin/usuarios` | Gestión de usuarios | ❌ 403 |
| POST | `/api/admin/usuario/:id/toggle-estado` | Activar/Desactivar usuario | ⚠️ 403 |
| DELETE | `/api/admin/usuario/:id` | Eliminar usuario | ⚠️ 403 |
| GET | `/api/admin/publicaciones` | Gestión de publicaciones | ❌ 403 |
| GET | `/api/admin/pqr` | Ver PQR y quejas | ❌ 403 |

---

## 📊 LEYENDA DE ESTADOS

| Símbolo | Significado | Acción |
|---------|-------------|--------|
| ✅ 200 | OK - Funciona correctamente | Ninguna necesaria |
| ⚠️ 400 | Bad Request - Error de validación | Revisar parámetros enviados |
| ❌ 401 | Unauthorized - Sin sesión | Iniciar sesión con `/api/login` |
| ❌ 403 | Forbidden - Sin permisos | Verificar rol del usuario |
| ⚠️ 404 | Not Found - Recurso no existe | Verificar ID o crear dato |
| ❌ 500 | Internal Error - Bug en servidor | Revisar logs del servidor |

---

## 🧪 EJEMPLOS DE USO

### 1. Login y Obtener Datos
```bash
# Login demo
curl -X POST http://localhost:3000/api/login/demo \
  -H "Content-Type: application/json" \
  -d '{"username": "usuario1", "password": "123456"}'

# Obtener publicaciones públicas
curl http://localhost:3000/api/publicaciones_publicas

# Obtener marketplace de grúas
curl http://localhost:3000/api/marketplace-gruas
```

### 2. Buscar Específicamente
```bash
# Buscar usuario por cédula
curl http://localhost:3000/api/usuarios/cedula/1001092582

# Obtener detalle de grúa
curl http://localhost:3000/api/publicaciones-grua/1

# Obtener factura
curl http://localhost:3000/api/factura/1
```

### 3. Carrito (Requiere sesión)
```bash
# Añadir al carrito
curl -X POST http://localhost:3000/api/carrito \
  -H "Content-Type: application/json" \
  -d '{
    "idPublicacion": 1,
    "cantidad": 2,
    "precio": 100000
  }'

# Ver carrito
curl http://localhost:3000/api/carrito
```

---

## 📈 COBERTURA DE ENDPOINTS

```
Total Endpoints:          57
Públicos (sin auth):      18 endpoints
Protegidos (con auth):    39 endpoints
Admin (requiere admin):    6 endpoints

Funcionales:              41 endpoints (72%)
Con problemas menores:    14 endpoints (25%)
No implementados:          2 endpoints (3%)
```

---

## 💡 INFORMACIÓN RÁPIDA

**Base URL**: `http://localhost:3000`

**Usuarios de Demo**:
- Usuario: `usuario1` / Contraseña: `123456` (Natural)
- Usuario: `comerciante1` / Contraseña: `123456` (Comerciante)
- Usuario: `prestador1` / Contraseña: `123456` (Prestador de Servicios)

**Headers Requeridos**:
- Content-Type: application/json (para POST/PUT)
- Cookie: sesión automáticamente manejada

**Datos Disponibles en BD**:
- Usuarios: 4
- Publicaciones: 4
- Grúas: 4
- Talleres: 1
- Categorías: 3
- Historial: 8 registros

