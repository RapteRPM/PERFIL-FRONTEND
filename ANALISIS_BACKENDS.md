# 📋 ANÁLISIS DE BACKENDS POR FUNCIONALIDAD

## 🔴 PROBLEMAS ENCONTRADOS

### 1️⃣ GENERAL (Auth & Home)

#### ❌ PROBLEMA: Login Query - Inconsistencia en nombres de tabla
**Ubicación**: `server.js` línea ~70
**Código**:
```javascript
SELECT c.*, u.TipoUsuario
FROM Credenciales c
JOIN Usuario u ON u.IdUsuario = c.Usuario
```
**Issue**: 
- La tabla en BD es `usuario` (minúscula) pero el SELECT usa `Usuario` (mayúscula)
- MySQL con collation sensible a mayúsculas fallará

**Solución**: Usar nombres exactos de tablas (verificar en SQL)

---

#### ❌ PROBLEMA: Recuperar Contraseña - Query incorrecta
**Ubicación**: `server.js` línea ~185
**Código**:
```javascript
'SELECT IdUsuario FROM usuario WHERE Documento = ?'
```
**Issue**:
- La tabla debería ser `Usuario` (con mayúscula según el SQL)
- Campo `Documento` podría no existir (revisar schema)

---

#### ❌ PROBLEMA: Ruta `/api/usuario-actual` - Búsqueda de foto
**Ubicación**: `server.js` línea ~115
**Issue**:
- Intenta buscar en carpeta `public/Imagen/` pero los archivos están en `public/imagen/` (minúscula)
- `fs.existsSync(rutaCarpeta)` siempre falla por diferencia de mayúsculas

---

#### ⚠️ PROBLEMA: Rutas protegidas innecesarias
**Ubicación**: `server.js` línea ~270
```javascript
app.get('/perfil_usuario.html', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Natural/perfil_usuario.html'));
});
```
**Issue**: 
- Estas rutas son innecesarias si los archivos están en `public/`
- Express ya sirve estáticos automáticamente

---

### 2️⃣ USUARIO NATURAL

#### ❌ PROBLEMA: Carrito - Falta endpoint POST
**Ubicación**: `server.js` línea ~1990
**Código existente**: Solo hay estructura parcial
**Issue**:
- `/api/carrito` POST no valida sesión
- No verifica si el usuario existe
- Falta transaction en caso de error

#### ❌ PROBLEMA: Historial - Join incorrecto
**Ubicación**: `server.js` línea ~280
**Código**:
```javascript
LEFT JOIN Publicacion pub ON df.Publicacion = pub.IdPublicacion
```
**Issue**:
- Pero después usa `df.VisibleUsuario` sin chequear si existe ese campo

---

### 3️⃣ USUARIO COMERCIANTE

#### ❌ PROBLEMA: Publicaciones - NIT incorrecto
**Ubicación**: `server.js` línea ~1050
**Código**:
```javascript
INSERT INTO Publicacion (Comerciante, ...) 
VALUES (?, ...)  // <-- Aquí va NIT, no IdUsuario
```
**Issue**:
- La tabla `Comerciante` usa `NitComercio` como PK
- Pero a veces envían `IdUsuario` en lugar de NIT

#### ❌ PROBLEMA: Historial Ventas - Query ambigua
**Ubicación**: `server.js` línea ~530
**Código**:
```javascript
FROM DetalleFacturacomercio df
JOIN Factura f ON df.Factura = f.IdFactura
```
**Issue**:
- Tabla es `detallefacturacomercio` (minúsculas en SQL)
- Pero en el SELECT se usa con mayúsculas inconsistentemente

---

### 4️⃣ PRESTADOR DE SERVICIOS

#### ❌ PROBLEMA: Publicaciones Grúa - Falta validación
**Ubicación**: `server.js` línea ~2520
**Código**:
```javascript
app.post('/api/publicaciones-grua', uploadPublicacion.array('imagenes'), async (req, res) => {
```
**Issue**:
- No valida que el usuario sea PrestadorServicio
- No verifica sesión activa
- Falta manejo de imágenes en transacción

#### ❌ PROBLEMA: Solicitudes Grúa - Falta relación
**Ubicación**: No existe endpoint `/api/solicitudes-grua` POST
**Issue**:
- Solo hay GET, falta crear nueva solicitud
- No hay validación de fechas (podrían ser pasadas)

---

### 5️⃣ FUNCIONES COMPARTIDAS

#### ❌ PROBLEMA: Centro Ayuda - Falta completamente
**Ubicación**: `server.js` 
**Issue**:
- No hay endpoint POST `/api/centro-ayuda`
- Solo está el HTML del formulario

#### ❌ PROBLEMA: Opiniones - Sin validación
**Ubicación**: `server.js` línea ~3140
**Código**:
```javascript
app.post('/api/opiniones', async (req, res) => {
```
**Issue**:
- No valida calificación entre 1-5
- Permite comentarios duplicados
- No verifica que el usuario compró ese producto

---

## 📊 TABLA RESUMEN DE ENDPOINTS

| Endpoint | Método | Estado | Problemas |
|----------|--------|--------|-----------|
| `/api/login` | POST | ⚠️ Funcional | Query con mayúsculas inconsistentes |
| `/api/registro` | POST | ✅ Ok | Geocodificación en Nominatim |
| `/api/logout` | GET | ✅ Ok | - |
| `/api/usuario-actual` | GET | ❌ Roto | Búsqueda de foto falla |
| `/api/historial` | GET | ⚠️ Funcional | Join posiblemente incorrecto |
| `/api/carrito` | POST | ❌ Incompleto | Sin validación |
| `/api/publicaciones` | GET/DELETE | ⚠️ Funcional | NIT vs IdUsuario confuso |
| `/api/historial-ventas` | GET | ⚠️ Funcional | Nombres tabla inconsistentes |
| `/api/publicaciones-grua` | POST | ❌ Incompleto | Sin validación de sesión |
| `/api/centro-ayuda` | POST | ❌ No existe | - |
| `/api/opiniones` | POST | ❌ Incompleto | Sin validación |

---

## 🎯 PRIORIDADES DE ARREGLO

1. **CRÍTICO**: Arreglar consultas SQL (mayúsculas en nombres de tabla)
2. **CRÍTICO**: Búsqueda de fotos (paths con mayúsculas)
3. **ALTO**: Endpoints incompletos (carrito, opiniones, solicitudes)
4. **ALTO**: Validaciones faltantes en todos los endpoints
5. **MEDIO**: Transacciones en operaciones múltiples

