# 🔧 LISTA DE ARREGLOS NECESARIOS

## 🔴 FIX #1: Inconsistencia en nombres de tablas SQL

### Problema
```javascript
// INCORRECTO - Mayúsculas inconsistentes
SELECT c.*, u.TipoUsuario
FROM Credenciales c
JOIN Usuario u ON u.IdUsuario = c.Usuario
```

### Solución
```javascript
// CORRECTO - Minúsculas consistentes
SELECT c.*, u.TipoUsuario
FROM credenciales c
JOIN usuario u ON u.IdUsuario = c.Usuario
```

**Ubicaciones a corregir**:
- Line ~70: Login query
- Line ~185: Recuperar contraseña
- Line ~280+: Todas las queries en historial
- Line ~530+: Queries de comerciante
- Line ~1050+: Queries de publicaciones
- etc.

---

## 🔴 FIX #2: Búsqueda de fotos - Ruta con mayúsculas

### Problema
```javascript
// Intenta buscar en 'Imagen' pero archivos están en 'imagen'
const rutaCarpeta = path.join(__dirname, 'public', 'Imagen', tipoCarpeta, documento.toString());
```

### Solución
```javascript
// Cambiar a minúsculas
const rutaCarpeta = path.join(__dirname, 'public', 'imagen', tipoCarpeta, documento.toString());
// Y en la respuesta también:
fotoRutaFinal = `/imagen/${tipoCarpeta}/${documento}/${archivoFoto}`;
```

---

## 🔴 FIX #3: Falta endpoint POST `/api/carrito`

### Problema
El endpoint existe pero está incompleto

### Código que falta
```javascript
app.post('/api/carrito', async (req, res) => {
  try {
    const { idUsuario, idPublicacion, cantidad } = req.body;

    // Validar datos
    if (!idUsuario || !idPublicacion || !cantidad) {
      return res.status(400).json({ msg: 'Faltan datos' });
    }

    // Validar que el usuario existe
    const [usuario] = await pool.query(
      'SELECT IdUsuario FROM usuario WHERE IdUsuario = ?',
      [idUsuario]
    );
    if (usuario.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Validar que la publicación existe
    const [pub] = await pool.query(
      'SELECT IdPublicacion, Precio FROM publicacion WHERE IdPublicacion = ?',
      [idPublicacion]
    );
    if (pub.length === 0) {
      return res.status(404).json({ msg: 'Publicación no encontrada' });
    }

    const subtotal = pub[0].Precio * cantidad;

    // Insertar o actualizar carrito
    const [existente] = await pool.query(
      'SELECT IdCarrito FROM carrito WHERE UsuarioNat = ? AND Publicacion = ?',
      [idUsuario, idPublicacion]
    );

    if (existente.length > 0) {
      // Actualizar cantidad
      await pool.query(
        'UPDATE carrito SET Cantidad = Cantidad + ?, SubTotal = SubTotal + ? WHERE IdCarrito = ?',
        [cantidad, subtotal, existente[0].IdCarrito]
      );
    } else {
      // Insertar nuevo
      await pool.query(
        'INSERT INTO carrito (UsuarioNat, Publicacion, Cantidad, SubTotal, Estado) VALUES (?, ?, ?, ?, ?)',
        [idUsuario, idPublicacion, cantidad, subtotal, 'Pendiente']
      );
    }

    res.json({ msg: '✅ Producto agregado al carrito', success: true });
  } catch (error) {
    console.error('❌ Error al agregar carrito:', error);
    res.status(500).json({ msg: 'Error al agregar producto' });
  }
});
```

---

## 🔴 FIX #4: Falta endpoint POST `/api/centro-ayuda`

### Código que falta
```javascript
app.post('/api/centro-ayuda', async (req, res) => {
  try {
    const { usuarioId, tipoSolicitud, rol, asunto, descripcion } = req.body;

    // Validar datos
    if (!usuarioId || !tipoSolicitud || !rol || !asunto || !descripcion) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Validar que el usuario existe
    const [usuario] = await pool.query(
      'SELECT IdUsuario FROM usuario WHERE IdUsuario = ?',
      [usuarioId]
    );
    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Insertar solicitud
    await pool.query(
      `INSERT INTO centroayuda (Perfil, TipoSolicitud, Rol, Asunto, Descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, tipoSolicitud, rol, asunto, descripcion]
    );

    res.json({ msg: '✅ Solicitud enviada correctamente', success: true });
  } catch (error) {
    console.error('❌ Error al enviar solicitud:', error);
    res.status(500).json({ error: 'Error al enviar solicitud' });
  }
});
```

---

## 🔴 FIX #5: Validación en `/api/opiniones`

### Problema
```javascript
// Sin validación
app.post('/api/opiniones', async (req, res) => {
  const { usuarioId, idPublicacion, nombreUsuario, comentario, calificacion } = req.body;
  // Inserta directamente sin validar
```

### Solución
```javascript
app.post('/api/opiniones', async (req, res) => {
  try {
    const { usuarioId, idPublicacion, nombreUsuario, comentario, calificacion } = req.body;

    // Validaciones
    if (!usuarioId || !idPublicacion || !comentario || !calificacion) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Validar calificación entre 1-5
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: 'Calificación debe estar entre 1 y 5' });
    }

    // Validar que el usuario existe
    const [usuario] = await pool.query(
      'SELECT IdUsuario FROM usuario WHERE IdUsuario = ?',
      [usuarioId]
    );
    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que la publicación existe
    const [pub] = await pool.query(
      'SELECT IdPublicacion FROM publicacion WHERE IdPublicacion = ?',
      [idPublicacion]
    );
    if (pub.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Validar que el usuario compró este producto (opcional pero recomendado)
    const [compra] = await pool.query(
      `SELECT df.IdDetalleFactura FROM detallefactura df
       JOIN factura f ON df.Factura = f.IdFactura
       WHERE f.Usuario = ? AND df.Publicacion = ?`,
      [usuarioId, idPublicacion]
    );
    if (compra.length === 0) {
      return res.status(403).json({ error: 'Solo puedes opinionar productos que compraste' });
    }

    // Insertar opinión
    await pool.query(
      `INSERT INTO opiniones (UsuarioNatural, Publicacion, NombreUsuario, Comentario, Calificacion)
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, idPublicacion, nombreUsuario, comentario, calificacion]
    );

    res.json({ msg: '✅ Opinión guardada correctamente', success: true });
  } catch (error) {
    console.error('❌ Error al guardar opinión:', error);
    res.status(500).json({ error: 'Error al guardar opinión' });
  }
});
```

---

## 📋 RESUMEN DE CAMBIOS

| FIX | Prioridad | Archivos | Líneas aprox |
|-----|-----------|----------|--------------|
| FIX #1 | 🔴 CRÍTICO | server.js | 70, 185, 280-3197 |
| FIX #2 | 🔴 CRÍTICO | server.js | 115-180 |
| FIX #3 | 🔴 CRÍTICO | server.js | 1990-2050 |
| FIX #4 | 🟡 ALTO | server.js | new |
| FIX #5 | 🟡 ALTO | server.js | 3140-3200 |

