# 🔧 GUÍA DE CORRECCIONES - CÓDIGO A REVISAR Y AJUSTAR

## 1. 🔴 BUG CRÍTICO: `/api/confirmar-recibido` (Línea 975-980)

### ❌ Código Actual (CON ERROR)
```javascript
// Línea 975-980
const [[detalle]] = await conn.query(`
  SELECT Factura, ConfirmacionUsuario, ConfirmacionComercio
  FROM detallefacturacomercio
  WHERE IdDetalleFacturaComercio = ?
`, [idDetalle]);

if (detalle.ConfirmacionUsuario === 'Recibido' && detalle.ConfirmacionComercio === 'Entregado') {
  // ... error aquí si detalle es undefined
}
```

### ✅ Código Correcto
```javascript
// Línea 975-980
const [[detalle]] = await conn.query(`
  SELECT Factura, ConfirmacionUsuario, ConfirmacionComercio
  FROM detallefacturacomercio
  WHERE IdDetalleFacturaComercio = ?
`, [idDetalle]);

// Validar que el resultado existe
if (!detalle) {
  return res.status(404).json({ 
    success: false, 
    message: "Detalle de factura no encontrado" 
  });
}

if (detalle.ConfirmacionUsuario === 'Recibido' && detalle.ConfirmacionComercio === 'Entregado') {
  // ... resto del código
}
```

**Ubicación**: [server.js - Línea 975-980](server.js#L975)

---

## 2. ⚠️ VALIDACIÓN INCOMPLETA: `/api/carrito` (Línea 2445)

### ❌ Código Actual (INCOMPLETO)
```javascript
app.post('/api/carrito', async (req, res) => {
  const { idPublicacion, cantidad, precio } = req.body;
  // Falta validación
  try {
    // ... rest of code
  }
});
```

### ✅ Código Correcto
```javascript
app.post('/api/carrito', async (req, res) => {
  try {
    const { idPublicacion, cantidad, precio } = req.body;
    
    // Validación explícita
    if (!idPublicacion || !cantidad || !precio) {
      return res.status(400).json({ 
        error: 'Faltan parámetros requeridos: idPublicacion, cantidad, precio' 
      });
    }
    
    if (isNaN(cantidad) || cantidad < 1) {
      return res.status(400).json({ 
        error: 'Cantidad debe ser un número mayor a 0' 
      });
    }
    
    if (isNaN(precio) || precio < 0) {
      return res.status(400).json({ 
        error: 'Precio debe ser un número válido' 
      });
    }
    
    // ... resto del código
  } catch (err) {
    // ...
  }
});
```

**Ubicación**: [server.js - Línea 2445](server.js#L2445)

---

## 3. ⚠️ MEJORA: Mensaje de Error en `/api/publicaciones` (Línea 1447)

### Código Actual
```javascript
app.get('/api/publicaciones', async (req, res) => {
  try {
    const usuario = req.session.usuario;

    if (!usuario || usuario.tipo !== 'Comerciante') {
      return res.status(403).json({ error: 'Acceso no autorizado...' });
    }
```

### Mejora Sugerida
```javascript
app.get('/api/publicaciones', async (req, res) => {
  try {
    const usuario = req.session.usuario;

    if (!usuario) {
      return res.status(401).json({ 
        error: 'No hay sesión activa. Por favor inicia sesión.' 
      });
    }
    
    if (usuario.tipo !== 'Comerciante') {
      return res.status(403).json({ 
        error: `Acceso denegado. Este endpoint es solo para comerciantes. Tu rol es: ${usuario.tipo}` 
      });
    }
```

**Ubicación**: [server.js - Línea 1447](server.js#L1447)

---

## 4. 📝 MEJORA: Validación en `/api/confirmar-recibido`

Añadir validación en el req.body:

```javascript
app.post("/api/confirmar-recibido", async (req, res) => {
  const { idDetalle } = req.body;
  
  // Validación
  if (!idDetalle) {
    return res.status(400).json({
      success: false,
      message: "idDetalle es requerido"
    });
  }
  
  const conn = await pool.getConnection();
  // ... resto del código
});
```

**Ubicación**: [server.js - Línea 960](server.js#L960)

---

## 5. 🔍 REVISAR: Endpoint `/api/detallePublicacion/:id` (Línea 2351)

Está retornando 404. Revisar la lógica:

```javascript
app.get('/api/detallePublicacion/:id', async (req, res) => {
  const idPublicacion = req.params.id;
  
  console.log(`📖 Obteniendo detalles de publicación: ${idPublicacion}`);
  
  try {
    // Verificar que el ID es válido
    if (!idPublicacion || isNaN(idPublicacion)) {
      return res.status(400).json({
        error: 'ID de publicación inválido'
      });
    }
    
    const publicacion = await queryPromise(
      'SELECT * FROM publicacion WHERE IdPublicacion = ?',
      [idPublicacion]
    );
    
    if (!publicacion || publicacion.length === 0) {
      return res.status(404).json({
        error: `Publicación ${idPublicacion} no encontrada`
      });
    }
    
    res.json(publicacion[0]);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Error al obtener publicación' });
  }
});
```

**Ubicación**: [server.js - Línea 2351](server.js#L2351)

---

## 📋 CHECKLIST DE CORRECCIONES

```
[ ] 1. Corregir bug en /api/confirmar-recibido (línea 980)
      - Añadir validación: if (!detalle) return...
      
[ ] 2. Mejorar validación en /api/carrito (línea 2445)
      - Validar parámetros requeridos
      - Validar tipos de datos
      
[ ] 3. Mejorar mensajes de error (línea 1447)
      - Diferenciar entre 401 y 403
      - Incluir información del rol actual
      
[ ] 4. Añadir validación en /api/confirmar-recibido (línea 960)
      - Validar idDetalle en req.body
      
[ ] 5. Revisar /api/detallePublicacion/:id (línea 2351)
      - Validar ID
      - Mejorar manejo de no encontrado
```

---

## 🧪 PRUEBA DESPUÉS DE CORRECCIONES

```bash
# Test el endpoint corregido
curl -X POST http://localhost:3000/api/confirmar-recibido \
  -H "Content-Type: application/json" \
  -d '{"idDetalle": 1}'

# Test validación de carrito
curl -X POST http://localhost:3000/api/carrito \
  -H "Content-Type: application/json" \
  -d '{"idPublicacion": "invalid"}'
```

---

## 📊 IMPACTO DE CORRECCIONES

| Corrección | Severidad | Impacto | Tiempo |
|------------|-----------|--------|--------|
| Confirmar recibido | 🔴 ALTA | Evita crashes 500 | 5 min |
| Carrito validación | 🟡 MEDIA | Mejora UX | 10 min |
| Mensajes error | 🟢 BAJA | Debugging | 5 min |
| DetallePublicación | 🟡 MEDIA | Funcionalidad | 10 min |

**Tiempo Total Estimado**: 30 minutos para todas las correcciones

---

## ✅ VERIFICACIÓN FINAL

Después de hacer los cambios:

```bash
# 1. Reiniciar servidor
npm start &

# 2. Esperar a que inicie
sleep 3

# 3. Ejecutar pruebas
node test-complete-api.js

# 4. Verificar que todas pasen
```

Si todas las pruebas pasan, el backend estará **100% OPERACIONAL**.

