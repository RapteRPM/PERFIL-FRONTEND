// ===============================
// 📦 Importaciones
// ===============================
import { verificarSesion, evitarCache } from './middlewares/sesion.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import session from 'express-session';
import ExcelJS from 'exceljs';
import fs from 'fs';
import axios from 'axios';
import multer from 'multer';
import pool from './config/db.js'; // ✅ usamos pool, import moderno
import { crearCredenciales } from './controllers/credenciales.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Configuración general
app.use("/api/privado", verificarSesion); 
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/imagen", express.static(path.join(__dirname, "public/imagen")));


// ===============================
// 🔐 Configuración de sesiones
// ===============================
app.use(
  session({
    secret: 'clave-secreta-rpm',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hora
      httpOnly: true,
    },
  })
);

// Evitar caché en páginas protegidas
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ===============================
// 🏠 Ruta raíz - Redireccionar al índice
// ===============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/General/index.html'));
});

// ===============================
// 🧪 MODO DEMO - Login sin BD (para pruebas)
// ===============================
app.post('/api/login/demo', (req, res) => {
  const { username, password } = req.body;
  
  // Usuarios de demo
  const usuariosDemo = {
    'usuario1': { password: '123456', tipo: 'Natural', id: 1001, nombre: 'Juan Usuario' },
    'comerciante1': { password: '123456', tipo: 'Comerciante', id: 2001, nombre: 'Tienda ABC' },
    'prestador1': { password: '123456', tipo: 'PrestadorServicio', id: 3001, nombre: 'Grúa Express' }
  };
  
  const usuario = usuariosDemo[username];
  
  if (!usuario) {
    return res.status(401).json({ error: 'Usuario no encontrado (demo)' });
  }
  
  if (usuario.password !== password) {
    return res.status(401).json({ error: 'Contraseña incorrecta (demo)' });
  }
  
  // Simular sesión
  req.session.usuario = {
    id: usuario.id,
    nombre: usuario.nombre,
    tipo: usuario.tipo
  };
  
  res.json({
    success: true,
    message: 'Login demo exitoso',
    tipo: usuario.tipo,
    usuario: usuario.nombre,
    idUsuario: usuario.id
  });
});

// ===============================
// 🔑 Login
// ===============================
import bcrypt from 'bcrypt';
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const query = `
      SELECT c.*, u.TipoUsuario
      FROM credenciales c
      JOIN usuario u ON u.IdUsuario = c.Usuario
      WHERE TRIM(c.NombreUsuario) = TRIM(?)
    `;

    const [results] = await pool.query(query, [username]);

    if (results.length === 0) {
      console.warn("⚠️ Usuario no encontrado:", username);
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = results[0];
    console.log("🧠 Usuario encontrado:", usuario);

    const esValida = await bcrypt.compare(password, usuario.Contrasena);
    if (!esValida) {
      console.warn("⚠️ Contraseña incorrecta para:", username);
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    req.session.usuario = {
      id: usuario.Usuario,
      nombre: usuario.NombreUsuario,
      tipo: usuario.TipoUsuario || "Natural"
    };

    console.log("✅ Usuario autenticado:", req.session.usuario);
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      tipo: req.session.usuario.tipo,
      usuario: req.session.usuario.nombre,
      idUsuario: req.session.usuario.id
    });

  } catch (err) {
    console.error("❌ Error en la consulta SQL:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// ===============================
// 👤 Ruta para obtener datos del usuario actual
// ===============================
app.get('/api/usuario-actual', verificarSesion, async (req, res) => {
  const usuarioSesion = req.session.usuario;
  if (!usuarioSesion) {
    return res.status(401).json({ error: "No hay usuario activo" });
  }

  try {
    // 🔍 Obtenemos los datos del usuario
    const [userRows] = await pool.query(
      `SELECT u.IdUsuario, u.TipoUsuario, u.Nombre, u.Apellido, u.Documento, u.FotoPerfil
       FROM usuario u
       INNER JOIN credenciales c ON c.Usuario = u.IdUsuario
       WHERE u.IdUsuario = ?`,
      [usuarioSesion.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = userRows[0];
    let nombreMostrar = `${user.Nombre} ${user.Apellido || ''}`.trim();

    // 🏪 Si es comerciante, obtener nombre del comercio
    if (user.TipoUsuario === "Comerciante") {
      const [comercioRows] = await pool.query(
        `SELECT NombreComercio FROM comerciante WHERE Comercio = ?`,
        [usuarioSesion.id]
      );
      if (comercioRows.length > 0) {
        nombreMostrar = comercioRows[0].NombreComercio;
      }
    }

    // 🖼️ Ruta de la imagen - usar directamente de la BD
    const tipo = user.TipoUsuario;
    let fotoRutaFinal = user.FotoPerfil;
    
    // Si no hay foto o la ruta está vacía, usar imagen por defecto
    if (!fotoRutaFinal || fotoRutaFinal.trim() === '') {
      fotoRutaFinal = '/imagen/imagen_perfil.png';
    } else {
      // Asegurar que la ruta comience con /
      if (!fotoRutaFinal.startsWith('/')) {
        fotoRutaFinal = '/' + fotoRutaFinal;
      }
    }

    // ✅ Respuesta al frontend
    res.json({
      id: user.IdUsuario,
      nombre: nombreMostrar,
      tipo: tipo,
      foto: fotoRutaFinal,
    });

  } catch (err) {
    console.error("❌ Error al obtener usuario actual:", err);
    res.status(500).json({ error: "Error al obtener usuario actual" });
  }
});

//----------///
// SECCION DE RECUPERACION DE CONTRASEÑA//

app.get('/api/usuarios/cedula/:documento', async (req, res) => {
  const { documento } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT IdUsuario FROM usuario WHERE Documento = ?',
      [documento]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'No se encontró ningún usuario con esa cédula.' });
    }

    res.json({ idUsuario: rows[0].IdUsuario });
  } catch (error) {
    console.error('Error buscando usuario por cédula:', error);
    res.status(500).json({ msg: 'Error del servidor.' });
  }
});

// API PARA CAMBIAR CONTRASEÑA
app.put('/api/usuarios/:id/contrasena', async (req, res) => {
  const { id } = req.params;
  const { nuevaContrasena } = req.body;

  if (!nuevaContrasena || nuevaContrasena.length < 6) {
    return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    console.log(`🔐 Actualizando contraseña para usuario: ${id}`);
    const hash = await bcrypt.hash(nuevaContrasena, 10);

    const result = await queryPromise(
      'UPDATE credenciales SET Contrasena = ? WHERE Usuario = ?',
      [hash, id]
    );

    if (result.changes === 0) {
      console.log(`⚠️ No se encontró el usuario ${id} en credenciales`);
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    console.log(`✅ Contraseña actualizada para usuario: ${id}`);
    res.json({ msg: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    res.status(500).json({ msg: 'Error del servidor.' });
  }
});

// ===============================
// 🚪 Logout
// ===============================
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }

    // 🧹 Limpia cookies de sesión para mayor seguridad
    res.clearCookie('connect.sid', { path: '/' });

    // 🔄 Redirige al login
    res.redirect('/General/Ingreso.html');
  });
});

// ===============================
// 🧠 Verificar sesión activa
// ===============================
app.get('/api/verificar-sesion', (req, res) => {
  const sesionActiva = !!req.session?.usuario;
  res.json({ activa: sesionActiva });
});

// ===============================
// 🌐 Rutas protegidas
// ===============================
app.get('/perfil_usuario.html', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Natural/perfil_usuario.html'));
});

app.get('/dashboard_comerciante.html', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Comerciante/dashboard_comerciante.html'));
});

app.get('/Historial_ventas.html', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Comerciante/Historial_ventas.html'));
});

// ===============================
// 🏁 Iniciar servidor
// ===============================
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en: http://localhost:${port}/General/index.html`);
});

// ----------------------
// CONSULTAR HISTORIAL DE COMPRAS - USUARIO NATURAL
// ----------------------
app.get('/api/historial', async (req, res) => {
  const { fechaInicio, fechaFin, tipoProducto, ordenPrecio, usuarioId } = req.query;

  try {
    const paramsProductos = [];
    const paramsGruas = [];

    // Query para productos/servicios de comerciantes
    let queryProductos = `
      SELECT
        df.IdDetalleFactura AS idDetalleFactura,
        pub.NombreProducto AS producto,
        c.NombreCategoria AS categoria,
        f.FechaCompra AS fecha,
        df.Total AS precio,
        COALESCE(f.MetodoPago, 'Sin registro') AS metodoPago,
        CASE
          WHEN df.Estado = 'Finalizado' THEN 'Finalizado'
          WHEN df.Estado = 'Cancelado' THEN 'Cancelado'
          WHEN df.Estado = 'Pendiente' THEN 'Pendiente'
          ELSE df.Estado
        END AS estado,
        f.IdFactura AS idFactura,
        'producto' AS tipo,
        ca.FechaServicio AS fechaEntrega,
        ca.HoraServicio AS horaEntrega,
        ca.ModoServicio AS modoEntrega
      FROM detallefactura df
      LEFT JOIN factura f ON df.Factura = f.IdFactura
      INNER JOIN publicacion pub ON df.Publicacion = pub.IdPublicacion
      INNER JOIN categoria c ON pub.Categoria = c.IdCategoria
      LEFT JOIN detallefacturacomercio dfc ON df.IdDetalleFactura = dfc.IdDetalleFacturaComercio
      LEFT JOIN controlagendacomercio ca ON dfc.IdDetalleFacturaComercio = ca.DetFacturacomercio
      WHERE df.VisibleUsuario = 1
    `;

    // Query para servicios de grúa
    let queryGruas = `
      SELECT
        cas.IdSolicitudServicio AS idDetalleFactura,
        pg.TituloPublicacion AS producto,
        'Servicio de grua' AS categoria,
        cas.FechaServicio AS fecha,
        CAST(pg.TarifaBase AS REAL) AS precio,
        'Servicio' AS metodoPago,
        cas.Estado AS estado,
        NULL AS idFactura,
        'grua' AS tipo
      FROM controlagendaservicios cas
      INNER JOIN publicaciongrua pg ON cas.PublicacionGrua = pg.IdPublicacionGrua
      WHERE 1 = 1
    `;

    // Aplicar filtros para productos
    if (usuarioId) {
      queryProductos += ' AND f.Usuario = ?';
      paramsProductos.push(usuarioId);
      queryGruas += ' AND cas.UsuarioNatural = ?';
      paramsGruas.push(usuarioId);
    }
    
    if (fechaInicio) {
      queryProductos += ' AND f.FechaCompra >= ?';
      paramsProductos.push(fechaInicio);
      queryGruas += ' AND cas.FechaServicio >= ?';
      paramsGruas.push(fechaInicio);
    }
    
    if (fechaFin) {
      queryProductos += ' AND f.FechaCompra <= ?';
      paramsProductos.push(fechaFin);
      queryGruas += ' AND cas.FechaServicio <= ?';
      paramsGruas.push(fechaFin);
    }

    // Filtro de tipo de producto
    let incluirProductos = true;
    let incluirGruas = true;

    if (tipoProducto) {
      if (tipoProducto.toLowerCase() === 'servicio de grua') {
        incluirProductos = false;
      } else {
        incluirGruas = false;
        queryProductos += ' AND LOWER(c.NombreCategoria) = ?';
        paramsProductos.push(tipoProducto.toLowerCase());
      }
    }

    // Obtener resultados
    let results = [];
    
    if (incluirProductos && incluirGruas) {
      const resultadosProductos = await queryPromise(queryProductos, paramsProductos);
      const resultadosGruas = await queryPromise(queryGruas, paramsGruas);
      results = [...resultadosProductos, ...resultadosGruas];
    } else if (incluirProductos) {
      results = await queryPromise(queryProductos, paramsProductos);
    } else {
      results = await queryPromise(queryGruas, paramsGruas);
    }

    // Ordenamiento
    if (ordenPrecio === 'asc') {
      results.sort((a, b) => (a.precio || 0) - (b.precio || 0));
    } else if (ordenPrecio === 'desc') {
      results.sort((a, b) => (b.precio || 0) - (a.precio || 0));
    } else {
      results.sort((a, b) => {
        const fechaA = new Date(a.fecha || 0);
        const fechaB = new Date(b.fecha || 0);
        if (fechaB - fechaA !== 0) return fechaB - fechaA;
        return (b.idDetalleFactura || 0) - (a.idDetalleFactura || 0);
      });
    }

    console.log("📊 Consultando historial para usuario:", usuarioId);
    console.log(`✅ ${results.length} registros encontrados`);
    res.json(results);

  } catch (err) {
    console.error('❌ Error en la consulta de historial:', err);
    res.status(500).json({ error: 'Error en la consulta de historial' });
  }
});

// 🔹 Actualizar estado de DetalleFactura
app.put('/api/historial/estado/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    // 1️⃣ Obtener información del detalle para actualizar ambas tablas
    const detalle = await queryPromise(
      'SELECT Factura, Publicacion FROM detallefactura WHERE IdDetalleFactura = ?',
      [id]
    );

    if (!detalle || detalle.length === 0) {
      return res.status(404).json({ success: false, message: 'Detalle no encontrado.' });
    }

    const { Factura, Publicacion } = detalle[0];

    // 2️⃣ Actualizar detallefactura
    await queryPromise(
      'UPDATE detallefactura SET Estado = ? WHERE IdDetalleFactura = ?',
      [estado, id]
    );

    // 3️⃣ Actualizar detallefacturacomercio correspondiente (por Factura y Publicacion)
    await queryPromise(
      'UPDATE detallefacturacomercio SET Estado = ? WHERE Factura = ? AND Publicacion = ?',
      [estado, Factura, Publicacion]
    );

    // 4️⃣ Si se marcó como Finalizado, verificar si toda la factura está finalizada
    if (estado === 'Finalizado') {
      const pendientes = await queryPromise(
        'SELECT COUNT(*) AS pendientes FROM detallefactura WHERE Factura = ? AND Estado != ?',
        [Factura, 'Finalizado']
      );

      if (pendientes && pendientes[0] && pendientes[0].pendientes === 0) {
        await queryPromise(
          'UPDATE factura SET Estado = ? WHERE IdFactura = ?',
          ['Pago exitoso', Factura]
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Estado del pedido #${id} actualizado a '${estado}'.`
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ===============================
//  ACTUALIZAR ESTADO DE SOLICITUD DE GRÚA
// ===============================
app.put('/api/historial/grua/estado/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    // Verificar que la solicitud existe y obtener su estado actual
    const solicitud = await queryPromise(
      'SELECT IdSolicitudServicio, Estado FROM controlagendaservicios WHERE IdSolicitudServicio = ?',
      [id]
    );

    if (!solicitud || solicitud.length === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud de grúa no encontrada.' });
    }

    const estadoActual = solicitud[0].Estado;

    // Validar que solo se pueda marcar como "Terminado" si está "Aceptado"
    if (estado === 'Terminado' && estadoActual !== 'Aceptado') {
      return res.status(400).json({ 
        success: false, 
        message: 'Solo puedes marcar como terminado un servicio que ha sido aceptado por el prestador.' 
      });
    }

    // Actualizar estado de la solicitud de grúa
    await queryPromise(
      'UPDATE controlagendaservicios SET Estado = ? WHERE IdSolicitudServicio = ?',
      [estado, id]
    );

    res.status(200).json({
      success: true,
      message: `Estado de la solicitud de grúa #${id} actualizado a '${estado}'.`
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado de grúa:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});


//ACTUALIZAR ESTADO VISIBLES
app.delete('/api/historial/eliminar/:idFactura', async (req, res) => {
  const { idFactura } = req.params;

  try {
    await queryPromise('UPDATE detallefactura SET VisibleUsuario = 0 WHERE factura = ?', [idFactura]);
    res.json({ success: true, message: "Registro ocultado correctamente." });
  } catch (err) {
    console.error("❌ Error al ocultar registro:", err);
    res.status(500).json({ success: false, message: "Error al ocultar registro." });
  }
});


// ===============================
//  DESCARGAR EXCEL HISTORIAL COMPRAS - USUARIO NATURAL
// ===============================
app.get('/api/historial/excel', async (req, res) => {
  const { fechaInicio, fechaFin, tipoProducto, ordenPrecio, usuarioId } = req.query;

  try {
    const paramsProductos = [];
    const paramsGruas = [];

    // Query para productos/servicios de comerciantes
    let queryProductos = `
      SELECT
        df.IdDetalleFactura AS idDetalleFactura,
        pub.NombreProducto AS producto,
        c.NombreCategoria AS categoria,
        f.FechaCompra AS fecha,
        df.Total AS total,
        COALESCE(f.MetodoPago, 'Sin registro') AS metodoPago,
        CASE
          WHEN f.Estado = 'Pago exitoso' THEN 'Finalizado'
          WHEN f.Estado = 'Proceso pendiente' AND df.Estado = 'Pendiente' THEN 'Pendiente'
          ELSE f.Estado
        END AS estado,
        f.IdFactura AS idFactura,
        'producto' AS tipo
      FROM detallefactura df
      LEFT JOIN factura f ON df.Factura = f.IdFactura
      INNER JOIN publicacion pub ON df.Publicacion = pub.IdPublicacion
      INNER JOIN categoria c ON pub.Categoria = c.IdCategoria
      WHERE df.VisibleUsuario = 1
    `;

    // Query para servicios de grúa
    let queryGruas = `
      SELECT
        cas.IdSolicitudServicio AS idDetalleFactura,
        pg.TituloPublicacion AS producto,
        'Servicio de grua' AS categoria,
        cas.FechaServicio AS fecha,
        CAST(pg.TarifaBase AS REAL) AS total,
        'Servicio' AS metodoPago,
        cas.Estado AS estado,
        NULL AS idFactura,
        'grua' AS tipo
      FROM controlagendaservicios cas
      INNER JOIN publicaciongrua pg ON cas.PublicacionGrua = pg.IdPublicacionGrua
      WHERE 1 = 1
    `;

    // Aplicar filtros
    if (usuarioId) {
      queryProductos += ' AND f.Usuario = ?';
      paramsProductos.push(usuarioId);
      queryGruas += ' AND cas.UsuarioNatural = ?';
      paramsGruas.push(usuarioId);
    }

    if (fechaInicio) {
      queryProductos += ' AND (f.FechaCompra >= ? OR f.FechaCompra IS NULL)';
      paramsProductos.push(fechaInicio);
      queryGruas += ' AND cas.FechaServicio >= ?';
      paramsGruas.push(fechaInicio);
    }

    if (fechaFin) {
      queryProductos += ' AND (f.FechaCompra <= ? OR f.FechaCompra IS NULL)';
      paramsProductos.push(fechaFin);
      queryGruas += ' AND cas.FechaServicio <= ?';
      paramsGruas.push(fechaFin);
    }

    // Filtro de tipo de producto
    let incluirProductos = true;
    let incluirGruas = true;

    if (tipoProducto) {
      if (tipoProducto.toLowerCase() === 'servicio de grua') {
        incluirProductos = false;
      } else {
        incluirGruas = false;
        queryProductos += ' AND LOWER(c.NombreCategoria) = ?';
        paramsProductos.push(tipoProducto.toLowerCase());
      }
    }

    // Obtener resultados
    let results = [];
    
    if (incluirProductos && incluirGruas) {
      const resultadosProductos = await queryPromise(queryProductos, paramsProductos);
      const resultadosGruas = await queryPromise(queryGruas, paramsGruas);
      results = [...resultadosProductos, ...resultadosGruas];
    } else if (incluirProductos) {
      results = await queryPromise(queryProductos, paramsProductos);
    } else {
      results = await queryPromise(queryGruas, paramsGruas);
    }

    // Ordenamiento
    if (ordenPrecio === 'asc') {
      results.sort((a, b) => (a.total || 0) - (b.total || 0));
    } else if (ordenPrecio === 'desc') {
      results.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else {
      results.sort((a, b) => {
        const fechaA = new Date(a.fecha || 0);
        const fechaB = new Date(b.fecha || 0);
        if (fechaB - fechaA !== 0) return fechaB - fechaA;
        return (b.idDetalleFactura || 0) - (a.idDetalleFactura || 0);
      });
    }

    if (results.length === 0) {
      console.warn('⚠️ No hay datos para generar el Excel.');
      return res.status(404).send('No hay datos para generar el Excel.');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial de Compras');

    worksheet.columns = [
      { header: '#', key: 'n', width: 5 },
      { header: 'ID Detalle', key: 'idDetalleFactura', width: 10 },
      { header: 'Producto', key: 'producto', width: 25 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Total Pagado', key: 'total', width: 15 },
      { header: 'Método de Pago', key: 'metodoPago', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 },
    ];

    results.forEach((row, i) => {
      worksheet.addRow({
        n: i + 1,
        idDetalleFactura: row.idDetalleFactura,
        producto: row.producto || '—',
        categoria: row.categoria || '—',
        fecha: row.fecha ? new Date(row.fecha).toISOString().split('T')[0] : '—',
        total: Number(row.total || 0),
        metodoPago: row.metodoPago || '—',
        estado: row.estado || '—'
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=historial_compras.xlsx');

    await workbook.xlsx.write(res);
    res.end();
    console.log(`📦 Excel generado con ${results.length} registros (productos + grúas)`);

  } catch (err) {
    console.error('❌ Error en consulta Excel:', err);
    res.status(500).send('Error al generar Excel');
  }
});

// ==============================
//  HISTORIAL DE VENTAS - USUARIO COMERCIANTE
// ==============================
app.get('/api/historial-ventas', async (req, res) => {
  const { fechaInicio, fechaFin, tipoProducto, ordenPrecio } = req.query;
  const usuario = req.session.usuario;

  if (!usuario || usuario.tipo !== 'Comerciante') {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo disponible para comerciantes.' });
  }

  try {
    // 🔍 Obtener el NIT del comerciante logueado
    const comercianteRows = await queryPromise(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ?',
      [usuario.id]
    );

    if (comercianteRows.length === 0) {
      return res.status(403).json({ error: 'No se encontró información del comerciante.' });
    }

    const nitComercio = comercianteRows[0].NitComercio;

    let query = `
      SELECT 
        f.IdFactura AS idVenta,
        pub.NombreProducto AS producto,
        c.NombreCategoria AS categoria,
        u.Nombre AS comprador,
        f.FechaCompra AS fecha,
        df.Total AS total,
        df.Cantidad AS cantidad,
        f.MetodoPago AS metodoPago,
        df.Estado AS estado
      FROM detallefactura df
      JOIN factura f ON df.Factura = f.IdFactura
      JOIN publicacion pub ON df.Publicacion = pub.IdPublicacion
      JOIN categoria c ON pub.Categoria = c.IdCategoria
      LEFT JOIN usuario u ON f.Usuario = u.IdUsuario
      WHERE pub.Comerciante = ?
    `;

    const params = [nitComercio];

    if (fechaInicio) {
      query += ' AND f.FechaCompra >= ?';
      params.push(fechaInicio);
    }

    if (fechaFin) {
      query += ' AND f.FechaCompra <= ?';
      params.push(fechaFin);
    }

    if (tipoProducto) {
      query += ' AND LOWER(c.NombreCategoria) = ?';
      params.push(tipoProducto.toLowerCase());
    }

    if (ordenPrecio === 'asc') query += ' ORDER BY df.Total ASC';
    else if (ordenPrecio === 'desc') query += ' ORDER BY df.Total DESC';
    else query += ' ORDER BY f.FechaCompra DESC, df.IdDetalleFactura DESC';

    const results = await queryPromise(query, params);
    res.json(results);
  } catch (err) {
    console.error('❌ Error en historial ventas:', err);
    res.status(500).json({ error: 'Error en la consulta de historial de ventas' });
  }
});



// ==============================
// HISTORIAL DE VENTAS (EXCEL) - COMERCIANTE
// ==============================
app.get('/api/historial-ventas/excel', async (req, res) => {
  const { fechaInicio, fechaFin, tipoProducto, ordenPrecio } = req.query;
  const usuario = req.session.usuario;

  if (!usuario || usuario.tipo !== 'Comerciante') {
    return res.status(403).send('Acceso no autorizado.');
  }

  try {
    // 🔍 Obtener el NIT del comerciante logueado
    const comercianteRows = await queryPromise(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ?',
      [usuario.id]
    );

    if (comercianteRows.length === 0) {
      return res.status(403).json({ error: 'No se encontró información del comerciante.' });
    }

    const nitComercio = comercianteRows[0].NitComercio;
    const params = [nitComercio];

    let query = `
      SELECT 
        f.IdFactura AS idVenta,
        pub.NombreProducto AS producto,
        c.NombreCategoria AS categoria,
        u.Nombre AS comprador,
        f.FechaCompra AS fecha,
        df.Cantidad AS cantidad,
        df.Total AS total,
        f.MetodoPago AS metodoPago,
        df.Estado AS estado
      FROM detallefactura df
      JOIN factura f ON df.Factura = f.IdFactura
      JOIN publicacion pub ON df.Publicacion = pub.IdPublicacion
      JOIN categoria c ON pub.Categoria = c.IdCategoria
      LEFT JOIN usuario u ON f.Usuario = u.IdUsuario
      WHERE pub.Comerciante = ?
    `;

    // 🔹 Filtros opcionales
    if (fechaInicio) {
      query += ' AND f.FechaCompra >= ?';
      params.push(fechaInicio);
    }
    if (fechaFin) {
      query += ' AND f.FechaCompra <= ?';
      params.push(fechaFin);
    }
    if (tipoProducto) {
      query += ' AND LOWER(c.NombreCategoria) = ?';
      params.push(tipoProducto.toLowerCase());
    }

    // 🔹 Orden
    if (ordenPrecio === 'asc') query += ' ORDER BY df.Total ASC';
    else if (ordenPrecio === 'desc') query += ' ORDER BY df.Total DESC';
    else query += ' ORDER BY f.FechaCompra DESC';

    const results = await queryPromise(query, params);

    if (results.length === 0) {
      return res.json({ success: false, mensaje: 'No hay datos para generar el Excel.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial Ventas');

    worksheet.columns = [
      { header: '#', key: 'n', width: 5 },
      { header: 'ID Venta', key: 'idVenta', width: 10 },
      { header: 'Producto', key: 'producto', width: 25 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Comprador', key: 'comprador', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Cantidad', key: 'cantidad', width: 10 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Pago', key: 'metodoPago', width: 20 },
      { header: 'Estado', key: 'estado', width: 20 }
    ];

    results.forEach((row, i) => {
      worksheet.addRow({
        n: i + 1,
        ...row,
        fecha: row.fecha ? new Date(row.fecha).toISOString().split('T')[0] : ''
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=historial_ventas.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('❌ Error al generar Excel de ventas:', err);
    res.status(500).send('Error al generar Excel de ventas');
  }
});

//confirmacion del usuario natural
app.post("/api/confirmar-recibido", async (req, res) => {
  const { idDetalle } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Actualizar confirmación del usuario
    await conn.query(`
      UPDATE detallefacturacomercio
      SET ConfirmacionUsuario = 'Recibido'
      WHERE IdDetalleFacturaComercio = ?
    `, [idDetalle]);

    // Verificar si ambas confirmaciones están completas
    const [[detalle]] = await conn.query(`
      SELECT Factura, ConfirmacionUsuario, ConfirmacionComercio
      FROM detallefacturacomercio
      WHERE IdDetalleFacturaComercio = ?
    `, [idDetalle]);

    if (detalle.ConfirmacionUsuario === 'Recibido' && detalle.ConfirmacionComercio === 'Entregado') {
      await conn.query(`
        UPDATE detallefacturacomercio
        SET Estado = 'Finalizado'
        WHERE IdDetalleFacturaComercio = ?
      `, [idDetalle]);

      await conn.query(`
        UPDATE detallefactura
        SET Estado = 'Finalizado'
        WHERE factura = ?
      `, [detalle.Factura]);
    }

    await conn.commit();
    res.json({ success: true, message: "Confirmación de recibido registrada." });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error al confirmar recibido:", err);
    res.status(500).json({ success: false, message: "Error al confirmar recibido." });
  } finally {
    conn.release();
  }
});

// ----------------------
// RUTA PARA OBTENER LOS TALLERES 
// ----------------------
app.get('/api/talleres', async (req, res) => {
  try {
    const rows = await queryPromise(`
      SELECT
        U.Nombre AS NombreVendedor,
        C.NombreComercio,
        C.Latitud,
        C.Longitud,
        C.HoraInicio,
        C.HoraFin,
        C.DiasAtencion,
        C.Barrio
      FROM comerciante C
      INNER JOIN usuario U ON C.Comercio = U.IdUsuario
    `, []);
    
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener ubicaciones:', err);
    res.status(500).json({ error: 'Error al obtener ubicaciones' });
  }
});


// ===============================
//  REGISTRO DE USUARIO-FORMULARIO
// ===============================
import fetch from 'node-fetch'; // si no lo tienes instalado: npm install node-fetch

const tempDir = path.join(process.cwd(), 'public', 'imagen', 'temp');
fs.mkdirSync(tempDir, { recursive: true });

// Guardamos primero en temp
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Función auxiliar para consultas
const queryPromise = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

// Ruta unificada de registro
app.post(
  '/api/registro',
  upload.fields([
    { name: 'FotoPerfil', maxCount: 1 },
    { name: 'Certificado', maxCount: 1 },
  ]),
  async (req, res) => {
    console.log('🚀 === INICIO REGISTRO === 🚀');
    try {
      const data = req.body || {};
      const files = req.files || {};

      console.log('📦 Datos recibidos:', data);
      console.log('📸 Archivos recibidos:', files);

      // Normalizar tipo de usuario
      const tipoKey = (data.TipoUsuario || '').toLowerCase();
      const tipoMap = {
        natural: 'Natural',
        comerciante: 'Comerciante',
        servicio: 'PrestadorServicios',
        prestadorservicio: 'PrestadorServicios',
      };
      const tipoFolder = tipoMap[tipoKey] || 'Otros';
      let tipoUsuarioSQL =
        tipoKey === 'natural'
          ? 'Natural'
          : tipoKey === 'comerciante'
          ? 'Comerciante'
          : 'PrestadorServicio';

      const idUsuarioValue = data.Usuario;
      const nombre = (data.Nombre || '').trim();
      const apellido = (data.Apellido || '').trim();

      const fotoPerfilFile = files.FotoPerfil ? files.FotoPerfil[0] : null;
      if (!fotoPerfilFile)
        return res.status(400).json({ error: 'Debe subir una foto de perfil' });

      // Verificar si ya existe
      const usuarioExistente = await queryPromise(
        'SELECT IdUsuario FROM usuario WHERE IdUsuario = ?',
        [idUsuarioValue]
      );
      if (usuarioExistente.length > 0) {
        console.log(`⚠️ Usuario ${idUsuarioValue} ya existe en la base de datos`);
        return res.status(409).json({ error: 'El usuario ya está registrado. Por favor, utilice otro número de documento.' });
      }

      // Insertar en usuario (tabla en minúsculas para MySQL case-sensitive)
      const insertUsuarioSQL = `
        INSERT INTO usuario
          (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const usuarioValues = [
        idUsuarioValue,
        tipoUsuarioSQL,
        nombre,
        apellido,
        idUsuarioValue,
        data.Telefono || null,
        data.Correo || null,
        fotoPerfilFile.filename,
      ];

      await queryPromise(insertUsuarioSQL, usuarioValues);

      // Mover la foto a su carpeta final
      const finalUserDir = path.join(
        process.cwd(),
        'public',
        'imagen',
        tipoFolder,
        idUsuarioValue
      );
      fs.mkdirSync(finalUserDir, { recursive: true });

      const finalFotoName = `${Date.now()}_${Math.round(
        Math.random() * 1e6
      )}${path.extname(fotoPerfilFile.originalname)}`;
      const finalFotoPath = path.join(finalUserDir, finalFotoName);
      fs.renameSync(fotoPerfilFile.path, finalFotoPath);
      const fotoRuta = path
        .join('imagen', tipoFolder, idUsuarioValue, finalFotoName)
        .replace(/\\/g, '/');

      await queryPromise(
        'UPDATE usuario SET FotoPerfil = ? WHERE IdUsuario = ?',
        [fotoRuta, idUsuarioValue]
      );

      // Crear credenciales
      await crearCredenciales(idUsuarioValue, idUsuarioValue, data.Correo, fotoRuta);

      // Insertar perfil correspondiente
      if (tipoKey === 'natural') {
        console.log('📝 Insertando perfil natural...');
        await queryPromise(
          `INSERT INTO perfilnatural (UsuarioNatural, Direccion, Barrio)
           VALUES (?, ?, ?)`,
          [idUsuarioValue, data.Direccion || null, data.Barrio || null]
        );
        console.log('✅ Perfil natural creado');

      } else if (tipoKey === 'comerciante') {
        // 🗺️ 1. Armar dirección completa para geocodificar
        const direccionCompleta = `${data.Direccion || ''}, ${data.Barrio || ''}, Bogotá, Colombia`;

        let latitud = 4.710989;
        let longitud = -74.072092;

        try {
          console.log(`📍 Buscando coordenadas para: ${direccionCompleta}`);
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}`,
            {
              headers: {
                'User-Agent': 'RPM-Market/1.0 (contacto@rpm-market.com)',
              },
            }
          );
          const geoData = await geoResponse.json();

          if (geoData && geoData.length > 0) {
            latitud = parseFloat(geoData[0].lat);
            longitud = parseFloat(geoData[0].lon);
            console.log(`✅ Coordenadas obtenidas: ${latitud}, ${longitud}`);
          } else {
            console.warn('⚠️ No se encontraron coordenadas exactas, se usarán valores por defecto.');
          }
        } catch (geoError) {
          console.error('❌ Error obteniendo coordenadas:', geoError);
        }

        // 🏪 2. Insertar registro del comerciante
        console.log('📝 Insertando comerciante en la base de datos...');
        try {
          await queryPromise(
            `INSERT INTO comerciante
              (NitComercio, Comercio, NombreComercio, Direccion, Barrio, RedesSociales, DiasAtencion, HoraInicio, HoraFin, Latitud, Longitud)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              data.NitComercio || null,
              idUsuarioValue,
              data.NombreComercio || null,
              data.Direccion || null,
              data.Barrio || null,
              data.RedesSociales || null,
              data.DiasAtencion || null,
              data.HoraInicio || null,
              data.HoraFin || null,
              latitud,
              longitud,
            ]
          );
          console.log('✅ Comerciante creado exitosamente');
        } catch (insertError) {
          console.error('❌ Error al insertar comerciante:', insertError);
          throw insertError;
        }

        console.log(`✅ Comerciante registrado con coordenadas: ${latitud}, ${longitud}`);

      } else if (
        tipoKey === 'servicio' ||
        tipoKey === 'prestadorservicio' ||
        tipoKey === 'prestadorservicios'
      ) {
        const certificadoFile = files.Certificado ? files.Certificado[0] : null;
        if (!certificadoFile)
          return res.status(400).json({ error: 'Debe subir un certificado válido' });

        const finalCertName = `${Date.now()}_${Math.round(
          Math.random() * 1e6
        )}${path.extname(certificadoFile.originalname)}`;
        const finalCertPath = path.join(finalUserDir, finalCertName);
        fs.renameSync(certificadoFile.path, finalCertPath);
        const certRuta = path
          .join('imagen', tipoFolder, idUsuarioValue, finalCertName)
          .replace(/\\/g, '/');

        await queryPromise(
          `INSERT INTO prestadorservicio
            (Usuario, Direccion, Barrio, RedesSociales, Certificado, DiasAtencion, HoraInicio, HoraFin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            idUsuarioValue,
            data.Direccion || null,
            data.Barrio || null,
            data.RedesSociales || null,
            certRuta,
            data.DiasAtencion || null,
            data.HoraInicio || null,
            data.HoraFin || null,
          ]
        );
      }

      console.log(`✅ Registro completo: ${idUsuarioValue}`);
      res.status(200).json({
        mensaje: 'Registro exitoso',
        usuario: idUsuarioValue,
      });

    } catch (error) {
      console.error('');
      console.error('='.repeat(60));
      console.error('❌❌❌ ERROR EN /api/registro ❌❌❌');
      console.error('='.repeat(60));
      console.error(error);
      console.error('='.repeat(60));
      console.error('');
      // Devolver detalles del error en la respuesta para debugging
      return res.status(500).json({ 
        error: 'Error al procesar registro',
        details: process.env.NODE_ENV === 'production' ? error.message : error.stack,
        code: error.code || 'UNKNOWN'
      });
    }
  }
);


// ----------------------
// Helpers
// ----------------------
// 🧹 Elimina archivos temporales creados por Multer
function cleanupTempFiles(files, tempDir) {
  try {
    if (!files) return;
    Object.values(files).forEach(fileArr => {
      fileArr.forEach(f => {
        const filePath = path.join(tempDir, f.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    });
  } catch (e) {
    console.warn('⚠️ cleanupTempFiles error:', e.message);
  }
}

// 📍 Normaliza direcciones (por ejemplo: "Cra" → "Carrera", "Cl" → "Calle")
function normalizarDireccion(dir) {
  return (dir || '')
    .replace(/\bCra\b/gi, 'Carrera')
    .replace(/\bCl\b/gi, 'Calle')
    .replace(/\bAv\b/gi, 'Avenida');
}

// ---------------------- 
// SECCION PUBLICACIONES COMERCIANTE - VISUALIZACION PUBLICACION NATURAL- PUBLICACION PRESTADOR SERVICIO
// ----------------------
// ----------------------
// 📦 CREAR NUEVA PUBLICACIÓN - USUARIO COMERCIANTE
// ----------------------
// --- CONFIGURACIÓN MULTER PARA PUBLICACIONES ---
const storagePublicacion = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const nombreUnico =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, nombreUnico);
  }
});

const uploadPublicacion = multer({
  storage: storagePublicacion,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// ===========================
// 📦 PUBLICAR PRODUCTO
// ===========================

app.post('/api/publicar', uploadPublicacion.array('imagenesProducto', 5), async (req, res) => {
  const usuario = req.session.usuario;

  // 🔒 Validación de acceso
  if (!usuario || usuario.tipo !== 'Comerciante') {
    cleanupTempFiles(req.files, tempDir);
    return res.status(403).json({ error: 'Acceso no autorizado. Solo comerciantes pueden publicar.' });
  }

  const { nombreProducto, categoriaProducto, precioProducto, cantidadProducto, descripcionProducto } = req.body;

  // 🧩 Validar campos
  if (!nombreProducto || !categoriaProducto || !precioProducto || !cantidadProducto || !descripcionProducto) {
    cleanupTempFiles(req.files, tempDir);
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  const connection = await pool.getConnection();

  try {
    // 🔹 Obtener NIT del comerciante asociado
    const [rowsComercio] = await connection.query(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ? LIMIT 1',
      [usuario.id]
    );

    if (rowsComercio.length === 0) {
      cleanupTempFiles(req.files, tempDir);
      return res.status(404).json({ error: 'No se encontró el comercio asociado al usuario.' });
    }

    const nitComercio = rowsComercio[0].NitComercio;

    // 🔹 Buscar categoría
    const [rowsCategoria] = await connection.query(
      'SELECT IdCategoria FROM categoria WHERE LOWER(NombreCategoria) = LOWER(?) LIMIT 1',
      [categoriaProducto]
    );

    if (rowsCategoria.length === 0) {
      cleanupTempFiles(req.files, tempDir);
      return res.status(400).json({ error: `La categoría '${categoriaProducto}' no existe.` });
    }

    const idCategoria = rowsCategoria[0].IdCategoria;

    // 🔹 Primero insertamos una publicación "temporal" sin imágenes
    const [resultPub] = await connection.query(
      `
      INSERT INTO Publicacion (Comerciante, NombreProducto, Descripcion, Categoria, Precio, Stock, ImagenProducto)
      VALUES (?, ?, ?, ?, ?, ?, '[]')
      `,
      [nitComercio, nombreProducto, descripcionProducto, idCategoria, precioProducto, cantidadProducto]
    );

    const idPublicacion = resultPub.insertId;
    console.log('✅ Publicación creada con ID:', idPublicacion);

    // 🔹 Crear carpeta de la publicación usando su ID
    const carpetaPublicacion = path.join(
      process.cwd(),
      'public', 'imagen', 'Comerciante', usuario.id.toString(), 'publicaciones', idPublicacion.toString()
    );
    fs.mkdirSync(carpetaPublicacion, { recursive: true });

    // 🔹 Mover imágenes desde temp a carpeta específica
    const imagenes = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach(file => {
        const destino = path.join(carpetaPublicacion, file.filename);
        fs.renameSync(file.path, destino);
        imagenes.push(
          path.join('imagen', 'Comerciante', usuario.id.toString(), 'publicaciones', idPublicacion.toString(), file.filename)
        );
      });
    }

    // 🔹 Si no hay imágenes, usar una por defecto
    const imagenFinal = imagenes.length > 0
      ? JSON.stringify(imagenes)
      : JSON.stringify(['/imagen/default_producto.jpg']);

    // 🔹 Actualizar publicación con rutas finales
    await connection.query(
      'UPDATE Publicacion SET ImagenProducto = ? WHERE IdPublicacion = ?',
      [imagenFinal, idPublicacion]
    );

    // 🔹 Insertar producto vinculado
    await connection.query(
      `
      INSERT INTO Producto (PublicacionComercio, NombreProducto, Descripcion, IdCategoria, Precio, Stock)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [idPublicacion, nombreProducto, descripcionProducto, idCategoria, precioProducto, cantidadProducto]
    );

    res.json({ mensaje: '✅ Publicación creada exitosamente', idPublicacion });

  } catch (err) {
    console.error('❌ Error en /api/publicar:', err);
    cleanupTempFiles(req.files, tempDir);
    res.status(500).json({ error: 'Error al registrar la publicación.' });
  } finally {
    connection.release();
  }
});



// REGISTRO / HISTORIAL DE PUBLICACIONES
// ----------------------
app.get('/api/publicaciones', async (req, res) => {
  try {
    const usuario = req.session.usuario;

    if (!usuario || usuario.tipo !== 'Comerciante') {
      return res.status(403).json({ error: 'Acceso no autorizado. Solo comerciantes pueden ver sus publicaciones.' });
    }

    console.log(`📋 Obteniendo publicaciones para comerciante: ${usuario.id}`);

    // 🔹 1. Buscar el NIT del comercio asociado al usuario
    const comercio = await queryPromise(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ? LIMIT 1',
      [usuario.id]
    );

    if (!comercio || comercio.length === 0) {
      console.log(`⚠️ No se encontró comercio para usuario: ${usuario.id}`);
      return res.status(404).json({ error: 'No se encontró el comercio asociado a este usuario.' });
    }

    const nitComercio = comercio[0].NitComercio;
    console.log(`✅ NIT del comercio: ${nitComercio}`);

    // 🔹 2. Obtener publicaciones del comerciante
    const publicaciones = await queryPromise(
      `
        SELECT IdPublicacion, NombreProducto, Precio, ImagenProducto
        FROM publicacion
        WHERE comerciante = ?
        ORDER BY IdPublicacion DESC
      `,
      [nitComercio]
    );

    console.log(`✅ ${publicaciones.length} publicaciones encontradas`);
    res.json(publicaciones);
  } catch (err) {
    console.error('❌ Error al obtener las publicaciones:', err);
    res.status(500).json({ error: 'Error interno al obtener las publicaciones.' });
  }
});



// ELIMINAR PUBLICACIÓN Y SU CARPETA
// ----------------------
app.delete('/api/publicaciones/:id', async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const idPublicacion = req.params.id;

    if (!usuario || usuario.tipo !== 'Comerciante') {
      return res.status(403).json({ error: 'Acceso no autorizado. Solo comerciantes pueden eliminar publicaciones.' });
    }

    // 🔹 1️⃣ Obtener el NIT del comercio asociado al usuario
    const [comercio] = await pool.query(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ? LIMIT 1',
      [usuario.id]
    );

    if (!comercio || comercio.length === 0) {
      return res.status(404).json({ error: 'No se encontró el comercio asociado.' });
    }

    const nitComercio = comercio[0].NitComercio;

    // 🔹 2️⃣ Verificar que la publicación exista y obtener las imágenes
    const [publicacion] = await pool.query(
      'SELECT ImagenProducto FROM publicacion WHERE IdPublicacion = ? AND Comerciante = ?',
      [idPublicacion, nitComercio]
    );

    if (!publicacion || publicacion.length === 0) {
      return res.status(404).json({ error: 'No se encontró la publicación o no pertenece a tu comercio.' });
    }

    let imagenes = [];
    try {
      imagenes = JSON.parse(publicacion[0].ImagenProducto || '[]');
    } catch (parseErr) {
      console.warn('⚠️ No se pudieron parsear las imágenes:', parseErr);
    }

    // 🔹 3️⃣ Eliminar productos asociados
    await pool.query('DELETE FROM producto WHERE PublicacionComercio = ?', [idPublicacion]);

    // 🔹 4️⃣ Eliminar la publicación
    await pool.query('DELETE FROM publicacion WHERE IdPublicacion = ? AND Comerciante = ?', [
      idPublicacion,
      nitComercio
    ]);

    // 🔹 5️⃣ Eliminar carpeta completa de la publicación
    const carpetaPublicacion = path.join(
      __dirname,
      'public',
      'imagen',
      'Comerciante',
      usuario.id.toString(),
      'publicaciones',
      idPublicacion.toString()
    );

    try {
      if (fs.existsSync(carpetaPublicacion)) {
        fs.rmSync(carpetaPublicacion, { recursive: true, force: true });
        console.log(`🗑️ Carpeta eliminada correctamente: ${carpetaPublicacion}`);
      } else {
        console.warn('⚠️ Carpeta no encontrada (posiblemente ya eliminada):', carpetaPublicacion);
      }
    } catch (fsErr) {
      console.error('❌ Error al eliminar carpeta:', fsErr);
    }

    // 🔹 6️⃣ Confirmar eliminación
    res.json({
      mensaje: '✅ Publicación, productos asociados y carpeta eliminados exitosamente.'
    });
  } catch (err) {
    console.error('❌ Error al eliminar publicación:', err);
    res.status(500).json({ error: 'Error interno al eliminar la publicación.' });
  }
});


// 🟢 OBTENER UNA PUBLICACIÓN EN ESPECÍFICO POR ID - editar publicacion
app.get('/api/publicaciones/:id', async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const idPublicacion = req.params.id;

    if (!usuario || usuario.tipo !== 'Comerciante') {
      return res.status(403).json({ error: 'Acceso no autorizado. Solo comerciantes pueden ver publicaciones.' });
    }

    // 🔹 1️⃣ Obtener el NIT del comercio asociado al usuario
    const [comercio] = await pool.query(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ? LIMIT 1',
      [usuario.id]
    );

    if (!comercio || comercio.length === 0) {
      return res.status(404).json({ error: 'No se encontró el comercio asociado.' });
    }

    const nitComercio = comercio[0].NitComercio;

    // 🔹 2️⃣ Traer los datos completos de la publicación
    const queryPublicacion = `
      SELECT 
        IdPublicacion,
        NombreProducto,
        Descripcion,
        Categoria AS IdCategoria,
        (SELECT NombreCategoria FROM categoria WHERE IdCategoria = Publicacion.Categoria) AS NombreCategoria,
        Precio,
        ImagenProducto
      FROM publicacion
      WHERE IdPublicacion = ? AND Comerciante = ?
      LIMIT 1
    `;

    const [publicacion] = await pool.query(queryPublicacion, [idPublicacion, nitComercio]);

    if (!publicacion || publicacion.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada o no pertenece al comerciante.' });
    }

    // 🔹 3️⃣ Parsear imágenes si existen
    const pub = publicacion[0];
    try {
      pub.ImagenProducto = JSON.parse(pub.ImagenProducto || '[]');
    } catch {
      pub.ImagenProducto = [];
    }

    // 🔹 4️⃣ Respuesta final
    res.json(pub);

  } catch (err) {
    console.error('❌ Error al obtener la publicación:', err);
    res.status(500).json({ error: 'Error interno al obtener la publicación.' });
  }
});

// ----------------------
// OBTENER TODAS LAS CATEGORÍAS
// ----------------------
app.get('/api/categorias', async (req, res) => {
  try {
    const [categorias] = await pool.query(
      'SELECT IdCategoria, NombreCategoria FROM categoria ORDER BY NombreCategoria ASC'
    );

    // 🔹 Filtramos categorías que contengan "grua"
    const categoriasFiltradas = categorias.filter(c =>
      !c.NombreCategoria.toLowerCase().includes('grua')
    );

    res.json(categoriasFiltradas);
  } catch (err) {
    console.error('❌ Error al obtener categorías:', err);
    res.status(500).json({ error: 'Error al obtener las categorías.' });
  }
});

// ----------------------
// EDITAR Y ACTUALIZAR UNA PUBLICACIÓN
// ----------------------

// 📂 MULTER PARA EDITAR PUBLICACIONES
const storageEditar = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'imagen', 'temp_editar');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadEditar = multer({ storage: storageEditar });

// 🟢 ACTUALIZAR PUBLICACIÓN
app.put('/api/publicaciones/:id', uploadEditar.array('imagenesNuevas', 10), async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const idPublicacion = req.params.id;

    if (!usuario || usuario.tipo !== 'Comerciante') {
      return res.status(403).json({ error: 'Acceso no autorizado.' });
    }

    const { titulo, precio, categoria, descripcion } = req.body;

    let imagenesActuales = [];
    try {
      imagenesActuales = JSON.parse(req.body.imagenesActuales || '[]');
    } catch {
      imagenesActuales = [];
    }

    // 🔹 1️⃣ Obtener NIT del comerciante
    const [comercio] = await pool.query(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ? LIMIT 1',
      [usuario.id]
    );

    if (!comercio || comercio.length === 0) {
      return res.status(404).json({ error: 'No se encontró el comercio asociado.' });
    }

    const nitComercio = comercio[0].NitComercio;

    // 🔹 2️⃣ Rutas de nuevas imágenes
    const nuevasImagenes = (req.files || []).map(f => f.path.replace(/\\/g, '/'));
    const todasLasImagenes = [...imagenesActuales, ...nuevasImagenes];
    const rutaBase = path.join(__dirname, 'public');

    // 🔹 3️⃣ Obtener imágenes anteriores para eliminar las que ya no están
    const [resultPub] = await pool.query(
      'SELECT ImagenProducto FROM publicacion WHERE IdPublicacion = ? AND Comerciante = ?',
      [idPublicacion, nitComercio]
    );

    if (!resultPub || resultPub.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada o no pertenece al comerciante.' });
    }

    let anteriores = [];
    try {
      anteriores = JSON.parse(resultPub[0].ImagenProducto || '[]');
    } catch {
      anteriores = [];
    }

    // 🔹 4️⃣ Eliminar del disco las imágenes quitadas por el usuario
    const eliminadas = anteriores.filter(img => !imagenesActuales.includes(img));
    eliminadas.forEach(imgPath => {
      const fullPath = path.join(rutaBase, imgPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    // 🔹 5️⃣ Actualizar la publicación en la base de datos
    const queryUpdate = `
      UPDATE Publicacion
      SET NombreProducto = ?, Precio = ?, Categoria = ?, Descripcion = ?, ImagenProducto = ?
      WHERE IdPublicacion = ? AND Comerciante = ?
    `;

    await pool.query(queryUpdate, [
      titulo,
      precio,
      categoria,
      descripcion,
      JSON.stringify(todasLasImagenes),
      idPublicacion,
      nitComercio,
    ]);

    console.log('✅ Publicación actualizada correctamente');
    res.json({ mensaje: 'Publicación actualizada correctamente.' });
  } catch (err) {
    console.error('❌ Error al actualizar publicación:', err);
    res.status(500).json({ error: 'Error interno al actualizar la publicación.' });
  }
});

// DASHBOARD USUARIO COMERCIANTE
// ----------------------

app.get('/api/dashboard/comerciante', async (req, res) => {
  try {
    // 🧩 Validar sesión activa
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ error: 'No has iniciado sesión.' });
    }

    const idUsuario = req.session.usuario.id;
    console.log('📊 Cargando dashboard del comerciante:', idUsuario);

    // 🔍 Obtener el NIT del comerciante logueado
    const comercianteRows = await queryPromise(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ?',
      [idUsuario]
    );

    if (comercianteRows.length === 0) {
      return res.status(403).json({ error: 'No se encontró información del comerciante.' });
    }

    const nitComercio = comercianteRows[0].NitComercio;

    // 🧾 Consultar las ventas del comerciante usando detallefactura
    const result = await queryPromise(`
      SELECT 
        c.NombreComercio,
        cat.NombreCategoria,
        p.NombreProducto,
        COUNT(df.IdDetalleFactura) AS totalVentas,
        SUM(df.Total) AS totalRecaudado,
        DATE(f.FechaCompra) AS fechaCompra
      FROM detallefactura df
      INNER JOIN factura f ON df.Factura = f.IdFactura
      INNER JOIN publicacion p ON df.Publicacion = p.IdPublicacion
      INNER JOIN categoria cat ON p.Categoria = cat.IdCategoria
      INNER JOIN comerciante c ON p.Comerciante = c.NitComercio
      WHERE c.NitComercio = ?
      GROUP BY cat.NombreCategoria, p.NombreProducto, fechaCompra
      ORDER BY fechaCompra DESC
    `, [nitComercio]);

    // 💰 Calcular totales
    let totalVentas = 0;
    let totalRecaudado = 0;
    let ventasPorCategoria = {};
    let categorias = new Set();

    result.forEach(row => {
      totalVentas += row.totalVentas;
      totalRecaudado += row.totalRecaudado || 0;
      categorias.add(row.NombreCategoria);
      ventasPorCategoria[row.NombreCategoria] = (ventasPorCategoria[row.NombreCategoria] || 0) + (row.totalRecaudado || 0);
    });

    // 📅 Ventas del día y de la semana
    const hoy = new Date().toISOString().split('T')[0];
    const semanaPasada = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const ventasHoy = result
      .filter(r => r.fechaCompra === hoy)
      .reduce((acc, r) => acc + (r.totalRecaudado || 0), 0);

    const ventasSemana = result
      .filter(r => r.fechaCompra >= semanaPasada)
      .reduce((acc, r) => acc + (r.totalRecaudado || 0), 0);

    console.log('✅ Dashboard del comerciante cargado correctamente');

    // 📤 Respuesta final
    res.json({
      totalVentas,
      totalRecaudado,
      ventasHoy,
      ventasSemana,
      categorias: Array.from(categorias),
      ventasPorCategoria: Array.from(categorias).map(cat => ventasPorCategoria[cat] || 0)
    });

  } catch (error) {
    console.error('❌ Error en dashboard comerciante:', error);
    res.status(500).json({ error: 'Error en el servidor al obtener el dashboard del comerciante.' });
  }
});


//  EDITAR - ACTUALIZAR PERFIL COMERCIANTE
// ===============================
app.put(
  "/api/actualizarPerfilComerciante/:idUsuario",
  upload.single("FotoPerfil"),
  async (req, res) => {
    const { idUsuario } = req.params;
    const data = req.body || {};
    const nuevaFoto = req.file || null;

    try {
      // 1️⃣ Verificar si el usuario existe
      const [usuarioRows] = await pool.query(
        "SELECT FotoPerfil FROM usuario WHERE IdUsuario = ?",
        [idUsuario]
      );

      if (usuarioRows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      let rutaFotoFinal = usuarioRows[0].FotoPerfil;

      // 2️⃣ Si se sube una nueva foto de perfil
      if (nuevaFoto) {
        const tipoFolder = "Comerciante";
        const userFolder = path.join(
          __dirname,
          "public",
          "imagen",
          tipoFolder,
          idUsuario
        );

        // Crear carpeta si no existe
        fs.mkdirSync(userFolder, { recursive: true });

        // Eliminar foto anterior (si existe)
        if (rutaFotoFinal) {
          const rutaFotoAnterior = path.join(__dirname, "public", rutaFotoFinal);
          if (fs.existsSync(rutaFotoAnterior)) {
            fs.unlinkSync(rutaFotoAnterior);
          }
        }

        // Generar nuevo nombre único
        const nuevoNombreFoto = `${Date.now()}_${Math.round(
          Math.random() * 1e6
        )}${path.extname(nuevaFoto.originalname)}`;

        const rutaDestino = path.join(userFolder, nuevoNombreFoto);

        // Mover archivo desde la carpeta temporal
        fs.renameSync(nuevaFoto.path, rutaDestino);

        // Guardar ruta relativa (para mostrar en frontend)
        rutaFotoFinal = path
          .join("imagen", tipoFolder, idUsuario, nuevoNombreFoto)
          .replace(/\\/g, "/");

        // Actualizar campo de la foto en la base de datos
        await pool.query(
          "UPDATE usuario SET FotoPerfil = ? WHERE IdUsuario = ?",
          [rutaFotoFinal, idUsuario]
        );
      }

      // 3️⃣ Actualizar información básica del usuario
      await pool.query(
        `UPDATE usuario 
         SET Nombre = ?, Apellido = ?, Telefono = ?, Correo = ?
         WHERE IdUsuario = ?`,
        [
          data.Nombre || null,
          data.Apellido || null,
          data.Telefono || null,
          data.Correo || null,
          idUsuario,
        ]
      );

      // 4️⃣ Actualizar información del comercio asociado
      await pool.query(
        `UPDATE Comerciante
         SET NombreComercio = ?, NitComercio = ?, Direccion = ?, Barrio = ?, RedesSociales = ?,
             DiasAtencion = ?, HoraInicio = ?, HoraFin = ?
         WHERE Comercio = ?`,
        [
          data.NombreComercio || null,
          data.NitComercio || null,
          data.Direccion || null,
          data.Barrio || null,
          data.RedesSociales || null,
          data.DiasAtencion || null,
          data.HoraInicio || null,
          data.HoraFin || null,
          idUsuario,
        ]
      );

      // ✅ Respuesta final
      res.json({
        mensaje: "✅ Perfil actualizado correctamente",
        fotoPerfil: rutaFotoFinal,
      });
    } catch (error) {
      console.error("❌ Error al actualizar perfil comerciante:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

// 📋 OBTENER PERFIL DEL COMERCIANTE
// ===============================
app.get("/api/perfilComerciante/:idUsuario", async (req, res) => {
  const { idUsuario } = req.params;

  try {
    console.log(`📖 Obteniendo perfil comerciante para usuario: ${idUsuario}`);
    
    const rows = await queryPromise(
      `
      SELECT 
        u.IdUsuario,
        u.Nombre,
        u.Apellido,
        u.Telefono,
        u.Correo,
        u.FotoPerfil,
        c.NombreComercio,
        c.NitComercio,
        c.Direccion,
        c.Barrio,
        c.RedesSociales,
        c.DiasAtencion,
        c.HoraInicio,
        c.HoraFin
      FROM usuario u
      LEFT JOIN comerciante c ON u.IdUsuario = c.Comercio
      WHERE u.IdUsuario = ?
      `,
      [idUsuario]
    );

    if (!rows || rows.length === 0) {
      console.log(`⚠️ Comerciante no encontrado: ${idUsuario}`);
      return res.status(404).json({ error: "Comerciante no encontrado" });
    }

    console.log(`✅ Perfil comerciante encontrado:`, rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener perfil del comerciante:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

///APARTADO DE CONTROL DE AGENDA - COMERCIANTE 

app.get('/api/citas-comerciante', async (req, res) => {
  const usuario = req.session?.usuario;

  if (!usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    // 🔍 Obtener el NIT del comerciante logueado
    const comercianteRows = await queryPromise(
      'SELECT NitComercio FROM comerciante WHERE Comercio = ?',
      [usuario.id]
    );

    if (comercianteRows.length === 0) {
      return res.status(404).json({ error: 'Comerciante no encontrado' });
    }

    const nitComercio = comercianteRows[0].NitComercio;

    // 🧾 Obtener las citas/pedidos del comerciante desde controlagendacomercio
    const citas = await queryPromise(`
      SELECT 
        ca.IdSolicitud AS id,
        p.NombreProducto AS title,
        ca.FechaServicio AS fechaServicio,
        ca.HoraServicio AS horaServicio,
        ca.ModoServicio AS modoServicio,
        ca.ComentariosAdicionales AS comentarios,
        u.Nombre AS cliente,
        dfc.Cantidad AS cantidad,
        dfc.Total AS total,
        dfc.Estado AS estado,
        f.MetodoPago AS metodoPago,
        f.FechaCompra AS fechaCompra
      FROM controlagendacomercio ca
      JOIN detallefacturacomercio dfc ON ca.DetFacturacomercio = dfc.IdDetalleFacturaComercio
      JOIN factura f ON dfc.Factura = f.IdFactura
      JOIN publicacion p ON dfc.Publicacion = p.IdPublicacion
      LEFT JOIN usuario u ON f.Usuario = u.IdUsuario
      WHERE ca.Comercio = ?
      ORDER BY ca.FechaServicio DESC, f.FechaCompra DESC
    `, [nitComercio]);

    // Formatear datos para FullCalendar y lista
    const eventosFormateados = citas.map(cita => {
      // Solo incluir en calendario si tiene fecha confirmada
      const tieneFecha = cita.fechaServicio && cita.fechaServicio !== '';
      
      return {
        id: cita.id,
        title: `${cita.title} - ${cita.cliente || 'Cliente'}`,
        start: tieneFecha ? cita.fechaServicio : null, // null = no aparece en calendario
        extendedProps: {
          descripcion: `Cliente: ${cita.cliente || 'N/A'} | Cantidad: ${cita.cantidad} | Total: $${Number(cita.total || 0).toLocaleString()} | Estado: ${cita.estado}`,
          hora: cita.horaServicio || 'Sin confirmar',
          cliente: cita.cliente,
          cantidad: cita.cantidad,
          total: cita.total,
          estado: cita.estado,
          metodoPago: cita.metodoPago,
          modoServicio: cita.modoServicio,
          comentarios: cita.comentarios,
          fechaServicio: cita.fechaServicio,
          fechaCompra: cita.fechaCompra,
          tieneFecha: tieneFecha
        }
      };
    });

    res.json(eventosFormateados);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// Endpoint para eliminar un pedido del control de agenda
app.delete('/api/eliminar-pedido/:id', async (req, res) => {
  const usuario = req.session?.usuario;
  const pedidoId = req.params.id;

  if (!usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    // Eliminar de controlagendacomercio
    await queryPromise(
      'DELETE FROM controlagendacomercio WHERE IdSolicitud = ?',
      [pedidoId]
    );

    res.json({ message: '✅ Pedido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

// Endpoint para actualizar fecha de entrega en contraentrega
app.put('/api/actualizar-fecha-pedido', async (req, res) => {
  const usuario = req.session?.usuario;
  const { id, fecha, hora } = req.body;

  if (!usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!id || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    // Actualizar fecha y hora en controlagendacomercio
    await queryPromise(
      'UPDATE controlagendacomercio SET FechaServicio = ?, HoraServicio = ? WHERE IdSolicitud = ?',
      [fecha, hora, id]
    );

    res.json({ 
      success: true,
      message: '✅ Fecha de entrega actualizada correctamente' 
    });
  } catch (error) {
    console.error('Error al actualizar fecha:', error);
    res.status(500).json({ error: 'Error al actualizar fecha' });
  }
});

// ---------------------- 
// SECCION USUARIO NATURAL 
// ----------------------
// Ruta para editar y visualizar los datos del perfil

app.put("/api/actualizarPerfilNatural/:idUsuario", upload.single("FotoPerfil"), async (req, res) => {
  const { idUsuario } = req.params;
  const data = req.body || {};
  const nuevaFoto = req.file || null;

  try {
    console.log(`📝 Actualizando perfil natural para usuario: ${idUsuario}`);
    
    const usuarioRows = await queryPromise(
      "SELECT FotoPerfil FROM usuario WHERE IdUsuario = ?",
      [idUsuario]
    );

    if (!usuarioRows || usuarioRows.length === 0) {
      console.log(`⚠️ Usuario no encontrado: ${idUsuario}`);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let rutaFotoFinal = usuarioRows[0].FotoPerfil;

    if (nuevaFoto) {
      console.log(`📸 Nueva foto detectada: ${nuevaFoto.originalname}`);
      const tipoFolder = "Natural";
      const userFolder = path.join(__dirname, "public", "imagen", tipoFolder, idUsuario);
      fs.mkdirSync(userFolder, { recursive: true });

      if (rutaFotoFinal) {
        const rutaFotoAnterior = path.join(__dirname, "public", rutaFotoFinal);
        if (fs.existsSync(rutaFotoAnterior)) {
          fs.unlinkSync(rutaFotoAnterior);
          console.log(`🗑️ Foto anterior eliminada`);
        }
      }

      const nuevoNombreFoto = `${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(nuevaFoto.originalname)}`;
      const rutaDestino = path.join(userFolder, nuevoNombreFoto);
      fs.renameSync(nuevaFoto.path, rutaDestino);

      rutaFotoFinal = path.join("imagen", tipoFolder, idUsuario, nuevoNombreFoto).replace(/\\/g, "/");

      await queryPromise("UPDATE usuario SET FotoPerfil = ? WHERE IdUsuario = ?", [rutaFotoFinal, idUsuario]);
      console.log(`✅ Foto actualizada: ${rutaFotoFinal}`);
    }

    await queryPromise(
      `UPDATE usuario 
       SET Nombre = ?, Apellido = ?, Telefono = ?, Correo = ?
       WHERE IdUsuario = ?`,
      [
        data.Nombre || null,
        data.Apellido || null,
        data.Telefono || null,
        data.Correo || null,
        idUsuario,
      ]
    );
    console.log(`✅ Datos de usuario actualizados`);

    // SQLite compatible: verificar si existe y luego UPDATE o INSERT
    const perfilExiste = await queryPromise(
      `SELECT UsuarioNatural FROM perfilnatural WHERE UsuarioNatural = ?`,
      [idUsuario]
    );

    if (perfilExiste && perfilExiste.length > 0) {
      await queryPromise(
        `UPDATE perfilnatural SET Direccion = ?, Barrio = ? WHERE UsuarioNatural = ?`,
        [data.Direccion || null, data.Barrio || null, idUsuario]
      );
      console.log(`✅ Perfil natural actualizado`);
    } else {
      await queryPromise(
        `INSERT INTO perfilnatural (UsuarioNatural, Direccion, Barrio) VALUES (?, ?, ?)`,
        [idUsuario, data.Direccion || null, data.Barrio || null]
      );
      console.log(`✅ Perfil natural creado`);
    }

    res.json({ mensaje: "✅ Perfil actualizado correctamente", fotoPerfil: rutaFotoFinal });
  } catch (error) {
    console.error("❌ Error al actualizar perfil natural:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


//visualizacion del perfil 

app.get("/api/perfilNatural/:idUsuario", async (req, res) => {
  const { idUsuario } = req.params;

  try {
    console.log(`📖 Obteniendo perfil natural para usuario: ${idUsuario}`);
    
    const rows = await queryPromise(
      `SELECT 
         u.IdUsuario,
         u.Nombre,
         u.Apellido,
         u.Telefono,
         u.Correo,
         u.FotoPerfil,
         pn.Direccion,
         pn.Barrio
       FROM usuario u
       LEFT JOIN perfilnatural pn ON u.IdUsuario = pn.UsuarioNatural
       WHERE u.IdUsuario = ?`,
      [idUsuario]
    );

    if (!rows || rows.length === 0) {
      console.log(`⚠️ Perfil no encontrado para usuario: ${idUsuario}`);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log(`✅ Perfil encontrado para: ${rows[0].Nombre} ${rows[0].Apellido}`);
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener perfil natural:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ----------------------
// PUBLICACIONES PÚBLICAS (visibles para todos)

app.get('/api/publicaciones_publicas', async (req, res) => {
  try {
    const { categoria, limite } = req.query;

    let query = `
      SELECT 
        p.IdPublicacion,
        p.NombreProducto AS nombreProducto,
        p.Precio,
        (SELECT NombreCategoria FROM categoria WHERE IdCategoria = p.Categoria) AS categoria,
        p.ImagenProducto
      FROM publicacion p
      WHERE 1
    `;

    const params = [];

    // 🔹 Filtro opcional por categoría
    if (categoria && categoria.toLowerCase() !== 'todos') {
      query += ` AND p.Categoria = (SELECT IdCategoria FROM categoria WHERE LOWER(NombreCategoria) = LOWER(?))`;
      params.push(categoria);
    }

    // 🔹 Ordenar por las más recientes
    query += ` ORDER BY p.IdPublicacion DESC`;

    // 🔹 Límite opcional
    if (limite) {
      query += ` LIMIT ?`;
      params.push(parseInt(limite));
    }

    const [rows] = await pool.query(query, params);

    // 🔹 Parsear imágenes y normalizar rutas
    const publicaciones = rows.map(pub => {
      let imagenes = [];
      try {
        imagenes = JSON.parse(pub.ImagenProducto || '[]');

        // Normalizar rutas: reemplazar backslashes y agregar /image/ si no existe
          imagenes = JSON.parse(pub.ImagenProducto || '[]');

          imagenes = imagenes.map(img => {
            let ruta = img.replace(/\\/g, '/').trim();

            // ✅ Elimina cualquier prefijo incorrecto como "Natural/"
            ruta = ruta.replace(/^Natural\//i, '');

            // ✅ Asegura que comience con "/imagen/"
            if (!ruta.startsWith('imagen/')) {
              ruta = 'imagen/' + ruta.replace(/^\/?imagen\//i, '');
            }

            return '/' + ruta;
          });



      } catch {
        imagenes = [];
      }

      return {
        idPublicacion: pub.IdPublicacion,
        nombreProducto: pub.nombreProducto,
        precio: pub.Precio,
        categoria: pub.categoria,
        imagenes
      };
    });

    res.json(publicaciones);

  } catch (error) {
    console.error('❌ Error al obtener publicaciones públicas:', error);
    res.status(500).json({ error: 'Error al obtener publicaciones públicas.' });
  }
});

// ============================
// Ruta API para detalle de publicación
// ============================
app.get('/api/detallePublicacion/:id', async (req, res) => {
    const idPublicacion = req.params.id;

    try {
        // Consulta principal de la publicación
        const [resultado] = await pool.query(
            `SELECT 
                p.IdPublicacion,
                p.NombreProducto,
                p.Descripcion,
                p.Precio,
                p.Stock,
                p.ImagenProducto,
                p.FechaPublicacion,
                c.NombreComercio,
                u.Nombre AS NombreUsuario,
                u.Apellido AS ApellidoUsuario,
                IFNULL(AVG(o.Calificacion), 0) AS CalificacionPromedio
            FROM publicacion p
            JOIN comerciante c ON p.Comerciante = c.NitComercio
            JOIN usuario u ON c.Comercio = u.IdUsuario
            LEFT JOIN Opiniones o ON o.Publicacion = p.IdPublicacion
            WHERE p.IdPublicacion = ?
            GROUP BY p.IdPublicacion, c.NombreComercio, u.Nombre, u.Apellido`,
            [idPublicacion]
        );

        if (resultado.length === 0) {
            return res.status(404).json({ msg: 'Publicación no encontrada' });
        }

        // Consulta de opiniones
        const [opiniones] = await pool.query(
            `SELECT 
                o.IdOpinion, 
                o.Comentario, 
                o.Calificacion, 
                o.FechaOpinion, 
                u.Nombre, 
                u.Apellido
            FROM Opiniones o
            JOIN usuario u ON o.UsuarioNatural = u.IdUsuario
            WHERE o.Publicacion = ?
            ORDER BY o.FechaOpinion DESC`,
            [idPublicacion]
        );

        // Guardar la imagen como string directamente (sin parse)
            let imagenes = [];
            try {
              imagenes = JSON.parse(resultado[0].ImagenProducto || '[]');

              imagenes = imagenes.map(img => {
                let ruta = img.replace(/\\/g, '/').trim();
                ruta = ruta.replace(/^Natural\//i, ''); // elimina prefijo incorrecto
                if (!ruta.startsWith('imagen/')) {
                  ruta = 'imagen/' + ruta.replace(/^\/?imagen\//i, '');
                }
                return '/' + ruta;
              });
            } catch {
              imagenes = ['/imagen/placeholder.png'];
            }

        // Enviar datos completos
          res.json({
            publicacion: {
              ...resultado[0],
              ImagenProducto: imagenes
            },
            opiniones
          });


    } catch (err) {
        console.error('Error en /api/detallePublicacion/:id', err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// Ruta del HTML detalle_producto
app.get('/detalle_producto.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detalle_producto.html'));
});


//AGREGAR AL CARRITO//

// Middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ✅ Ruta para agregar producto al carrito
app.post('/api/carrito', async (req, res) => {
    try {
        const { idUsuario, idPublicacion } = req.body;

        if (!idUsuario || !idPublicacion) {
            return res.status(400).json({ msg: 'Faltan datos necesarios' });
        }

        // 🔹 Consultar el precio del producto desde la publicación
        const [producto] = await pool.query(
            `SELECT Precio FROM publicacion WHERE IdPublicacion = ?`,
            [idPublicacion]
        );

        if (producto.length === 0) {
            return res.status(404).json({ msg: 'Publicación no encontrada' });
        }

        const precio = producto[0].Precio;

        // 🔹 Insertar en la tabla Carrito
        await pool.query(
            `INSERT INTO Carrito (UsuarioNat, Publicacion, Cantidad, SubTotal, Estado)
             VALUES (?, ?, 1, ?, 'Pendiente')`,
            [idUsuario, idPublicacion, precio]
        );

        res.json({ msg: 'Producto añadido al carrito correctamente' });
    } catch (err) {
        console.error('❌ Error al agregar al carrito:', err);
        res.status(500).json({ msg: 'Error al agregar el producto al carrito' });
    }
});

//AGREGAR OPINIONES//

app.post('/api/opiniones', async (req, res) => {
  try {
    const { usuarioId, idPublicacion, nombreUsuario, comentario, calificacion } = req.body;

    if (!usuarioId || !idPublicacion || !comentario || !calificacion) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Insertar en la tabla Opiniones
    const [resultado] = await pool.query(
      `INSERT INTO Opiniones (UsuarioNatural, Publicacion, NombreUsuario, Comentario, Calificacion)
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, idPublicacion, nombreUsuario, comentario, calificacion]
    );

    res.json({
      mensaje: '✅ Opinión guardada correctamente',
      idOpinion: resultado.insertId
    });

  } catch (error) {
    console.error('❌ Error al insertar opinión:', error);
    res.status(500).json({ error: 'Error en el servidor al guardar la opinión.' });
  }
});

// VER CARRITO DE COMPRAS DEL USUARIO LOGUEADO - NATURAL
app.get('/api/carrito', async (req, res) => {
  try {
    const usuario = req.session.usuario;
    if (!usuario) return res.status(401).json({ msg: 'No hay usuario en sesión' });

    const [carrito] = await pool.query(`
      SELECT 
        c.IdCarrito,
        p.NombreProducto,
        p.Precio,
        c.Cantidad,
        (p.Precio * c.Cantidad) AS Total
      FROM Carrito c
      JOIN publicacion p ON c.Publicacion = p.IdPublicacion
      WHERE c.UsuarioNat = ? AND c.Estado = 'Pendiente'
    `, [usuario.id]);

    res.json(carrito);
  } catch (err) {
    console.error('❌ Error al obtener el carrito:', err);
    res.status(500).json({ msg: 'Error al obtener el carrito' });
  }
});


// 🔄 Actualizar cantidad de un producto en el carrito
app.put('/api/carrito/:id', async (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  try {
    await pool.query(
      `UPDATE Carrito SET Cantidad = ?, SubTotal = (Cantidad * SubTotal / Cantidad) WHERE IdCarrito = ?`,
      [cantidad, id]
    );
    res.json({ msg: 'Cantidad actualizada' });
  } catch (err) {
    console.error('❌ Error al actualizar cantidad:', err);
    res.status(500).json({ msg: 'Error al actualizar cantidad' });
  }
});


// ❌ Eliminar producto del carrito
app.delete('/api/carrito/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Carrito WHERE IdCarrito = ?', [id]);
    res.json({ msg: 'Producto eliminado' });
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err);
    res.status(500).json({ msg: 'Error al eliminar producto' });
  }
});




// ✅ GET /api/proceso-compra
app.get('/api/proceso-compra', async (req, res) => {
  try {
    // Asegúrate de que el usuario venga de la sesión
    const usuarioSesion = req.session && req.session.usuario;
    if (!usuarioSesion) {
      return res.status(401).json({ msg: 'Usuario no autenticado' });
    }
    const idUsuarioNat = usuarioSesion.id;

    const [rows] = await pool.query(
      `SELECT
         c.IdCarrito,
         c.Cantidad,
         -- Preferimos calcular subtotal aquí para evitar inconsistencias
         (p.Precio * c.Cantidad) AS Subtotal,
         p.Precio,
         p.NombreProducto AS Producto,
         c.SubTotal AS SubTotalEnCarrito,
         cm.NombreComercio,
         cm.Direccion AS DireccionComercio,
         u.IdUsuario AS IdComercioUsuario,
         u.Nombre AS NombreUsuarioComercio,
         u.Apellido AS ApellidoUsuarioComercio
       FROM Carrito c
       JOIN publicacion p ON c.Publicacion = p.IdPublicacion
       JOIN comerciante cm ON p.Comerciante = cm.NitComercio
       JOIN usuario u ON cm.Comercio = u.IdUsuario
       WHERE c.UsuarioNat = ? AND c.Estado = 'Pendiente'`,
      [idUsuarioNat]
    );

    // Normalizar estructura que espera el frontend
    const resultado = rows.map(r => ({
      IdCarrito: r.IdCarrito,
      Cantidad: Number(r.Cantidad),
      Precio: Number(r.Precio),
      Subtotal: Number(r.Subtotal),
      Producto: r.Producto,
      // info del comercio por si la necesitas
      NombreComercio: r.NombreComercio,
      DireccionComercio: r.DireccionComercio,
      IdComercioUsuario: r.IdComercioUsuario,
      NombreUsuarioComercio: r.NombreUsuarioComercio,
      ApellidoUsuarioComercio: r.ApellidoUsuarioComercio
    }));

    res.json(resultado);
  } catch (err) {
    console.error('❌ Error en /api/proceso-compra:', err);
    res.status(500).json({ msg: 'Error al obtener productos para proceso de compra' });
  }
});


//PROCESO DE COMPRA//

app.post("/api/finalizar-compra", async (req, res) => {
  try {
    console.log("📦 Finalizando compra...");

    const usuarioSesion = req.session && req.session.usuario;
    const usuarioId = (usuarioSesion && usuarioSesion.id) || req.body.usuarioId || null;
    const metodoPago = req.body.metodoPago;

    console.log(`👤 Usuario: ${usuarioId}, 💳 Método: ${metodoPago}`);

    if (!usuarioId || !metodoPago) {
      console.log("⚠️ Faltan datos: usuario o método de pago");
      return res.status(400).json({ message: "Faltan datos del usuario o método de pago." });
    }

    if (!['contraentrega', 'recoger'].includes(metodoPago)) {
      console.log(`⚠️ Método de pago no válido: ${metodoPago}`);
      return res.status(400).json({ message: "Método de pago no válido." });
    }

    // 1️⃣ Obtener productos pendientes del carrito
    const carritoRows = await queryPromise(`
      SELECT 
        c.IdCarrito, 
        c.Cantidad, 
        pub.IdPublicacion,
        pub.NombreProducto, 
        pub.Precio, 
        (pub.Precio * c.Cantidad) AS Subtotal,
        pub.Comerciante AS Comercio
      FROM carrito c
      JOIN publicacion pub ON c.Publicacion = pub.IdPublicacion
      WHERE c.UsuarioNat = ? AND c.Estado = 'Pendiente'
    `, [usuarioId]);

    if (!carritoRows || carritoRows.length === 0) {
      console.log("⚠️ No hay productos en el carrito");
      return res.status(400).json({ message: "No hay productos pendientes en el carrito." });
    }

    console.log(`📋 ${carritoRows.length} productos en el carrito`);

    // 2️⃣ Preparar detalles
    let totalCompra = 0;
    const detallesParaInsertar = [];

    for (const item of carritoRows) {
      totalCompra += Number(item.Subtotal);
      detallesParaInsertar.push({
        publicacion: item.IdPublicacion,
        cantidad: item.Cantidad,
        precioUnitario: item.Precio,
        total: item.Subtotal,
        comercio: item.Comercio
      });
    }

    console.log(`💰 Total de la compra: $${totalCompra}`);

    // 3️⃣ Insertar factura con estado "Proceso pendiente"
    const insertFactura = await queryPromise(
      `INSERT INTO factura (Usuario, TotalPago, MetodoPago, Estado, FechaCompra)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [usuarioId, totalCompra, metodoPago, 'Proceso pendiente']
    );

    const facturaId = insertFactura.lastID || insertFactura.insertId;
    console.log(`✅ Factura creada con ID: ${facturaId}`);

    // 4️⃣ Insertar detalles con estado "Pendiente"
    for (const detalle of detallesParaInsertar) {
      await queryPromise(
        `INSERT INTO detallefactura (Factura, Publicacion, Cantidad, PrecioUnitario, Total, Estado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [facturaId, detalle.publicacion, detalle.cantidad, detalle.precioUnitario, detalle.total, 'Pendiente']
      );

      const insertDetalleComercio = await queryPromise(
        `INSERT INTO detallefacturacomercio (Factura, Publicacion, Cantidad, PrecioUnitario, Total, Estado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [facturaId, detalle.publicacion, detalle.cantidad, detalle.precioUnitario, detalle.total, 'Pendiente']
      );

      const detalleComercioId = insertDetalleComercio.lastID || insertDetalleComercio.insertId;

      let modoServicio = metodoPago === "recoger" ? "Visita al taller" : "Domicilio";
      let tipoServicio = metodoPago === "recoger" ? 1 : 2;
      let fecha = req.body.fechaRecoger || null;
      let hora = req.body.horaRecoger || null;
      let comentarios = req.body.comentariosRecoger || null;

      await queryPromise(
        `INSERT INTO controlagendacomercio 
         (Comercio, DetFacturacomercio, TipoServicio, ModoServicio, FechaServicio, HoraServicio, ComentariosAdicionales)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [detalle.comercio, detalleComercioId, tipoServicio, modoServicio, fecha, hora, comentarios]
      );
    }

    // 5️⃣ Vaciar carrito
    await queryPromise(`DELETE FROM carrito WHERE UsuarioNat = ?`, [usuarioId]);
    console.log("🗑️ Carrito vaciado");

    console.log("✅ Compra registrada con método:", metodoPago);

    // 6️⃣ Mensaje final
    let message = "";
    let redirect = null;

    if (metodoPago === "contraentrega") {
      message = "Su proceso se registró con éxito. Puede hacer seguimiento en 'Historial'.";
    } else if (metodoPago === "recoger") {
      message = "Su solicitud fue enviada al comercio con éxito.";
    }

    return res.json({ success: true, message, redirect });

  } catch (err) {
    console.error("❌ Error al finalizar compra:", err);
    res.status(500).json({ message: "Error al finalizar la compra", error: err.message });
  }
});

// 🔹 API: Obtener factura por ID - APARTADO DE MOSTRAR FACTURA DESPUES DE COMPRA USUARIO NATURAL
// ===============================
app.get('/api/factura/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Obtener datos de la factura y del comprador
    const [facturaRows] = await pool.query(`
      SELECT 
        f.IdFactura,
        f.FechaCompra,
        f.TotalPago,
        f.MetodoPago,
        f.Estado,
        u.Nombre AS NombreUsuario,
        u.Apellido AS ApellidoUsuario,
        u.Telefono,
        u.Correo
      FROM factura f
      LEFT JOIN usuario u ON f.Usuario = u.IdUsuario
      WHERE f.IdFactura = ?
    `, [id]);

    if (facturaRows.length === 0) {
      return res.status(404).json({ msg: 'Factura no encontrada' });
    }

    const factura = facturaRows[0];

    // 2️⃣ Obtener los productos asociados a la factura
    const [detalleRows] = await pool.query(`
      SELECT 
      p.NombreProducto,
      df.Cantidad,
      df.PrecioUnitario,
      df.Total
      FROM detallefactura df
      JOIN publicacion p ON df.Publicacion = p.IdPublicacion
      WHERE df.Factura = ?
    `, [id]);

    // 3️⃣ Enviar la respuesta
    res.json({
      factura,
      detalles: detalleRows
    });

  } catch (error) {
    console.error('❌ Error al obtener factura:', error);
    res.status(500).json({ msg: 'Error al obtener factura' });
  }
});

//------------------//
//SECCION GENERAL //
//------------------//

//APARTADO DE CENTRO DE AYUDA

app.post("/api/centro-ayuda", async (req, res) => {
  const { perfil, tipoSolicitud, rol, asunto, descripcion } = req.body;

  console.log('📩 Solicitud de centro de ayuda recibida:', { perfil, tipoSolicitud, rol, asunto });

  // Validación de datos
  if (!perfil) {
    console.log('⚠️ Perfil no proporcionado');
    return res.status(401).json({ error: "Debes iniciar sesión para hacer esta solicitud." });
  }

  // Validación de rol
  const rolesValidos = ["Usuario Natural", "Comerciante", "PrestadorServicio"];
  if (!rolesValidos.includes(rol)) {
    console.log('⚠️ Rol inválido:', rol);
    return res.status(400).json({ error: "Rol inválido. Selecciona una opción válida." });
  }

  try {
    const sql = `
      INSERT INTO centroayuda (Perfil, TipoSolicitud, Rol, Asunto, Descripcion)
      VALUES (?, ?, ?, ?, ?)
    `;
    await queryPromise(sql, [perfil, tipoSolicitud, rol, asunto, descripcion]);

    console.log('✅ Solicitud de ayuda registrada exitosamente');
    res.status(200).json({ message: "Solicitud registrada con éxito." });
  } catch (error) {
    console.error("❌ Error al insertar solicitud de ayuda:", error);
    res.status(500).json({ error: "Error al guardar la solicitud." });
  }
});



//----------///
// SECCION DE PRESTADOR DE SERVICIOS//
//-----------//
// ===============================
//  Perfil del Prestador de Servicios
app.get('/api/perfil-prestador', async (req, res) => {
  const usuarioSesion = req.session.usuario;
  if (!usuarioSesion || usuarioSesion.tipo !== "PrestadorServicio") {
    return res.status(401).json({ error: "No autorizado. Debes iniciar sesión como prestador de servicios." });
  }

  try {
    console.log("📊 Cargando perfil del prestador:", usuarioSesion.id);

    // 🔍 Datos del usuario
    const userRows = await queryPromise(
      `SELECT u.IdUsuario, u.Nombre, u.Documento, u.FotoPerfil
       FROM usuario u
       WHERE u.IdUsuario = ?`,
      [usuarioSesion.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = userRows[0];

    // 🖼️ Ruta de imagen
    let tipoCarpeta = usuarioSesion.tipo;
    if (tipoCarpeta === "PrestadorServicio") {
      tipoCarpeta = "PrestadorServicios"; // ✅ Corrección de nombre de carpeta
    }

    const rutaCarpeta = path.join(__dirname, 'public', 'imagen', tipoCarpeta, user.Documento.toString());
    let fotoRutaFinal = '/imagen/imagen_perfil.png'; // por defecto

    if (fs.existsSync(rutaCarpeta)) {
      const archivos = fs.readdirSync(rutaCarpeta);
      const archivoFoto = archivos.find(
        f => f.includes(user.FotoPerfil) || f.match(/\.(jpg|jpeg|png|webp)$/i)
      );
      if (archivoFoto) {
        fotoRutaFinal = `/imagen/${tipoCarpeta}/${user.Documento}/${archivoFoto}`;
      }
    } else {
      console.warn(`⚠️ Carpeta de usuario no encontrada: ${rutaCarpeta}`);
    }

    // 📊 Obtener IdServicio del prestador
    const servicioRows = await queryPromise(
      `SELECT IdServicio FROM prestadorservicio WHERE Usuario = ?`,
      [usuarioSesion.id]
    );

    let idServicio = null;
    if (servicioRows.length > 0) {
      idServicio = servicioRows[0].IdServicio;
    }

    // 📊 Calcular estadísticas desde OpinionesGrua
    let valoracionPromedio = "N/A";
    let totalOpiniones = 0;

    if (idServicio) {
      const opinionesRows = await queryPromise(
        `SELECT AVG(og.Calificacion) AS promedio, COUNT(*) AS total
         FROM opinionesgrua og
         JOIN publicaciongrua pg ON og.PublicacionGrua = pg.IdPublicacionGrua
         WHERE pg.Servicio = ?`,
        [idServicio]
      );

      if (opinionesRows.length > 0 && opinionesRows[0].promedio) {
        valoracionPromedio = parseFloat(opinionesRows[0].promedio).toFixed(1);
        totalOpiniones = opinionesRows[0].total;
      }
    }

    // 📋 Contar servicios agendados (pendientes, aceptados y completados)
    let pendientes = 0;
    let aceptados = 0;
    let completados = 0;

    if (idServicio) {
      const agendaRows = await queryPromise(
        `SELECT 
           SUM(CASE WHEN cas.Estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
           SUM(CASE WHEN cas.Estado = 'Aceptado' THEN 1 ELSE 0 END) AS aceptados,
           SUM(CASE WHEN cas.Estado = 'Terminado' THEN 1 ELSE 0 END) AS completados
         FROM controlagendaservicios cas
         JOIN publicaciongrua pg ON cas.PublicacionGrua = pg.IdPublicacionGrua
         WHERE pg.Servicio = ?`,
        [idServicio]
      );

      if (agendaRows.length > 0) {
        pendientes = agendaRows[0].pendientes || 0;
        aceptados = agendaRows[0].aceptados || 0;
        completados = agendaRows[0].completados || 0;
      }
    }

    // 📋 Últimas solicitudes de agenda de grúa
    const solicitudesRows = idServicio ? await queryPromise(
      `SELECT 
         cas.IdSolicitudServicio,
         u.Nombre AS Cliente,
         cas.DireccionRecogida AS Origen,
         cas.Destino AS Destino,
         cas.FechaServicio AS Fecha,
         cas.Estado
       FROM controlagendaservicios cas
       JOIN publicaciongrua pg ON cas.PublicacionGrua = pg.IdPublicacionGrua
       JOIN usuario u ON cas.UsuarioNatural = u.IdUsuario
       WHERE pg.Servicio = ?
       ORDER BY cas.FechaServicio DESC
       LIMIT 5`,
      [idServicio]
    ) : [];

    // ✅ Respuesta
    res.json({
      nombre: user.Nombre,
      foto: fotoRutaFinal,
      descripcion: "Prestador de servicio de grúa 24/7",
      estadisticas: {
        totalServicios: pendientes + aceptados + completados,
        pendientes: pendientes,
        aceptados: aceptados,
        completados: completados,
        valoracion: valoracionPromedio
      },
      solicitudes: solicitudesRows
    });

    console.log("✅ Perfil del prestador cargado correctamente");

  } catch (err) {
    console.error("❌ Error en perfil del prestador:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// ===============================
//  PUBLICACIONES GRUAS

// 📦 Configuración específica para publicaciones de grúa
const storagePublicacionPrestador = multer.diskStorage({
  destination: (req, file, cb) => {
    const usuario = req.session.usuario;
    const dir = path.join(__dirname, 'public', 'Publicaciones', usuario.id.toString());

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, nombreUnico);
  }
});

const uploadPublicacionPrestador = multer({
  storage: storagePublicacionPrestador,
  limits: { fileSize: 5 * 1024 * 1024 }
});



app.post('/api/publicar-grua', uploadPublicacionPrestador.array('imagenesGrua', 5), async (req, res) => {
  const usuario = req.session.usuario;

  // 🔒 Validación de acceso
  if (!usuario || usuario.tipo !== 'PrestadorServicio') {
    cleanupTempFiles(req.files, tempDirGrua);
    return res.status(403).json({ error: 'Acceso no autorizado. Solo prestadores pueden publicar.' });
  }

  const { titulo, descripcion, tarifa, zona } = req.body;

  // 🧩 Validar campos
  if (!titulo || !descripcion || !tarifa || !zona) {
    cleanupTempFiles(req.files, tempDirGrua);
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // 🔹 Obtener ID del servicio del prestador
    const [rowsServicio] = await pool.query(
      'SELECT IdServicio FROM prestadorservicio WHERE usuario = ? LIMIT 1',
      [usuario.id]
    );

    if (rowsServicio.length === 0) {
      cleanupTempFiles(req.files, tempDirGrua);
      return res.status(404).json({ error: 'No se encontró el servicio asociado al usuario.' });
    }

    const idServicio = rowsServicio[0].IdServicio;

    // 🔹 Insertar publicación sin imágenes aún
    const [resultPub] = await pool.query(
      `INSERT INTO publicaciongrua (Servicio, TituloPublicacion, DescripcionServicio, TarifaBase, ZonaCobertura, FotoPublicacion)
       VALUES (?, ?, ?, ?, ?, '')`,
      [idServicio, titulo, descripcion, tarifa, zona]
    );

    const idPublicacion = resultPub.insertId;
    console.log('✅ Publicación de grúa creada con ID:', idPublicacion);

    // 🔹 Crear carpeta de la publicación
    const carpetaPublicacion = path.join(
      process.cwd(),
      'public', 'imagen', 'PrestadorServicios', usuario.id.toString(), 'publicaciones', idPublicacion.toString()
    );
    fs.mkdirSync(carpetaPublicacion, { recursive: true });

    // 🔹 Mover imágenes desde temp a carpeta específica
    const imagenes = [];

    if (Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach(file => {
        const destino = path.join(carpetaPublicacion, file.filename);
        fs.renameSync(file.path, destino);

        const rutaRelativa = path.posix.join(
          'imagen',
          'PrestadorServicios',
          usuario.id.toString(),
          'publicaciones',
          idPublicacion.toString(),
          file.filename
        );

        imagenes.push(rutaRelativa);
      });
    }

    // ✅ Guardar todas las rutas como JSON en FotoPublicacion
    const imagenFinal = imagenes.length > 0
      ? JSON.stringify(imagenes)
      : JSON.stringify(['/imagen/default_grua.jpg']);

    await pool.query(
      'UPDATE publicaciongrua SET FotoPublicacion = ? WHERE IdPublicacionGrua = ?',
      [imagenFinal, idPublicacion]
    );

    res.json({ mensaje: '✅ Publicación de grúa creada exitosamente', idPublicacion });

  } catch (err) {
    console.error('❌ Error en /api/publicar-grua:', err);
    cleanupTempFiles(req.files, tempDirGrua);
    res.status(500).json({ error: 'Error al registrar la publicación.' });
  }
});

/// REGISTRO O HISTORIAL DE PUBLICACIONES GRUAS//

app.get('/api/publicaciones-grua', async (req, res) => {
  try {
    const usuario = req.session.usuario;

    if (!usuario || usuario.tipo !== 'PrestadorServicio') {
      return res.status(403).json({ error: 'Acceso no autorizado. Solo prestadores pueden ver sus publicaciones.' });
    }

    const [servicio] = await pool.query(
      'SELECT IdServicio FROM prestadorservicio WHERE usuario = ? LIMIT 1',
      [usuario.id]
    );

    if (!servicio || servicio.length === 0) {
      return res.status(404).json({ error: 'No se encontró el servicio asociado.' });
    }

    const idServicio = servicio[0].IdServicio;

    const [publicaciones] = await pool.query(
      `SELECT 
         IdPublicacionGrua, 
         TituloPublicacion, 
         DescripcionServicio, 
         TarifaBase, 
         ZonaCobertura, 
         FotoPublicacion
       FROM publicaciongrua
       WHERE Servicio = ?
       ORDER BY IdPublicacionGrua DESC`,
      [idServicio]
    );

    res.json(publicaciones);
  } catch (err) {
    console.error('❌ Error al obtener publicaciones de grúa:', err);
    res.status(500).json({ error: 'Error interno al obtener las publicaciones.' });
  }
});

//ELIMINAR UNA PUBLICACION DE GRUA

app.delete('/api/publicaciones-grua/:id', async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const idPublicacion = req.params.id;

    if (!usuario || usuario.tipo !== 'PrestadorServicio') {
      return res.status(403).json({ error: 'Acceso no autorizado. Solo prestadores pueden eliminar publicaciones.' });
    }

    // 🔹 1️⃣ Obtener el ID del servicio del prestador
    const [servicio] = await pool.query(
      'SELECT IdServicio FROM prestadorservicio WHERE usuario = ? LIMIT 1',
      [usuario.id]
    );

    if (!servicio || servicio.length === 0) {
      return res.status(404).json({ error: 'No se encontró el servicio asociado.' });
    }

    const idServicio = servicio[0].IdServicio;

    // 🔹 2️⃣ Verificar que la publicación exista y obtener las imágenes
    const [publicacion] = await pool.query(
      'SELECT FotoPublicacion FROM publicaciongrua WHERE IdPublicacionGrua = ? AND Servicio = ?',
      [idPublicacion, idServicio]
    );

    if (!publicacion || publicacion.length === 0) {
      return res.status(404).json({ error: 'No se encontró la publicación o no pertenece a tu servicio.' });
    }

    let imagenes = [];
    try {
      imagenes = JSON.parse(publicacion[0].FotoPublicacion || '[]');
    } catch (parseErr) {
      console.warn('⚠️ No se pudieron parsear las imágenes:', parseErr);
    }

    // 🔹 3️⃣ Eliminar la publicación
    await pool.query(
      'DELETE FROM publicaciongrua WHERE IdPublicacionGrua = ? AND Servicio = ?',
      [idPublicacion, idServicio]
    );

    // 🔹 4️⃣ Eliminar carpeta completa de la publicación
    const carpetaPublicacion = path.join(
      __dirname,
      'public',
      'imagen',
      'PrestadorServicios',
      usuario.id.toString(),
      'publicaciones',
      idPublicacion.toString()
    );

    try {
      if (fs.existsSync(carpetaPublicacion)) {
        fs.rmSync(carpetaPublicacion, { recursive: true, force: true });
        console.log(`🗑️ Carpeta eliminada correctamente: ${carpetaPublicacion}`);
      } else {
        console.warn('⚠️ Carpeta no encontrada (posiblemente ya eliminada):', carpetaPublicacion);
      }
    } catch (fsErr) {
      console.error('❌ Error al eliminar carpeta:', fsErr);
    }

    // 🔹 5️⃣ Confirmar eliminación
    res.json({
      mensaje: '✅ Publicación y carpeta eliminadas exitosamente.'
    });

  } catch (err) {
    console.error('❌ Error al eliminar publicación de grúa:', err);
    res.status(500).json({ error: 'Error interno al eliminar la publicación.' });
  }
});



//APARTADO DE EDITAR PUBLICACION GRUA - OBTENER DATOS PARA EDICIÓN
app.get('/api/publicaciones-grua/editar/:id', async (req, res) => {
  console.log("📥 Solicitud recibida para editar publicación");
  console.log("🔐 Usuario en sesión:", req.session.usuario);
  console.log("🔍 ID solicitado:", req.params.id);

  try {
    const usuario = req.session.usuario;
    const idPublicacion = req.params.id;

    if (!usuario || usuario.tipo !== 'PrestadorServicio') {
      return res.status(403).json({ error: 'Acceso no autorizado.' });
    }

    const servicioRows = await queryPromise(
      'SELECT IdServicio FROM prestadorservicio WHERE Usuario = ? LIMIT 1',
      [usuario.id]
    );

    if (servicioRows.length === 0) {
      return res.status(404).json({ error: 'No se encontró el servicio asociado.' });
    }

    const idServicio = servicioRows[0].IdServicio;

    const publicacionRows = await queryPromise(
      `SELECT 
        pg.IdPublicacionGrua,
        pg.TituloPublicacion,
        pg.DescripcionServicio,
        pg.TarifaBase,
        pg.ZonaCobertura,
        pg.FotoPublicacion
      FROM publicaciongrua pg
      WHERE pg.IdPublicacionGrua = ? AND pg.Servicio = ?
      LIMIT 1`,
      [idPublicacion, idServicio]
    );

    if (publicacionRows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada o no pertenece al prestador.' });
    }

    const pub = publicacionRows[0];
    try {
      pub.FotoPublicacion = JSON.parse(pub.FotoPublicacion || '[]');
    } catch {
      pub.FotoPublicacion = [];
    }

    res.json(pub);
  } catch (err) {
    console.error('❌ Error al obtener publicación de grúa:', err);
    res.status(500).json({ error: 'Error interno al obtener la publicación.' });
  }
});

///MODIFICAR Y/O ACTUALIZAR PUBLICACION

app.put('/api/publicaciones-grua/:id', uploadPublicacionPrestador.array('imagenesNuevas', 5), async (req, res) => {
  const usuario = req.session.usuario;
  const idPublicacion = req.params.id;

  if (!usuario || usuario.tipo !== 'PrestadorServicio') {
    cleanupTempFiles(req.files, tempDirGrua);
    return res.status(403).json({ error: 'Acceso no autorizado.' });
  }

  const { titulo, descripcion, tarifa, zona } = req.body;

  if (!titulo || !descripcion || !tarifa || !zona) {
    cleanupTempFiles(req.files, tempDirGrua);
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    const [servicioRows] = await pool.query(
      'SELECT IdServicio FROM prestadorservicio WHERE usuario = ? LIMIT 1',
      [usuario.id]
    );

    if (servicioRows.length === 0) {
      cleanupTempFiles(req.files, tempDirGrua);
      return res.status(404).json({ error: 'No se encontró el servicio asociado.' });
    }

    const idServicio = servicioRows[0].IdServicio;

    const [verificacion] = await pool.query(
      'SELECT IdPublicacionGrua FROM publicaciongrua WHERE IdPublicacionGrua = ? AND Servicio = ?',
      [idPublicacion, idServicio]
    );

    if (verificacion.length === 0) {
      cleanupTempFiles(req.files, tempDirGrua);
      return res.status(404).json({ error: 'Publicación no encontrada o no pertenece al prestador.' });
    }

    await pool.query(
      `UPDATE publicaciongrua 
       SET TituloPublicacion = ?, DescripcionServicio = ?, TarifaBase = ?, ZonaCobertura = ?
       WHERE IdPublicacionGrua = ?`,
      [titulo, descripcion, tarifa, zona, idPublicacion]
    );

    const carpetaPublicacion = path.join(
      process.cwd(),
      'public', 'imagen', 'PrestadorServicios', usuario.id.toString(), 'publicaciones', idPublicacion.toString()
    );
    fs.mkdirSync(carpetaPublicacion, { recursive: true });

    const nuevasImagenes = [];

    if (Array.isArray(req.files) && req.files.length > 0) {
      // Eliminar imágenes anteriores
      fs.readdirSync(carpetaPublicacion).forEach(file => {
        fs.unlinkSync(path.join(carpetaPublicacion, file));
      });

      req.files.forEach(file => {
        const destino = path.join(carpetaPublicacion, file.filename);
        fs.renameSync(file.path, destino);

        const rutaRelativa = path.posix.join(
          'imagen',
          'PrestadorServicios',
          usuario.id.toString(),
          'publicaciones',
          idPublicacion.toString(),
          file.filename
        );

        nuevasImagenes.push(rutaRelativa);
      });

      await pool.query(
        'UPDATE publicaciongrua SET FotoPublicacion = ? WHERE IdPublicacionGrua = ?',
        [JSON.stringify(nuevasImagenes), idPublicacion]
      );
    }

    res.json({ mensaje: '✅ Publicación actualizada correctamente' });

  } catch (err) {
    console.error('❌ Error al actualizar publicación:', err);
    cleanupTempFiles(req.files, tempDirGrua);
    res.status(500).json({ error: 'Error interno al actualizar la publicación.' });
  }
});

/// EDITAR PERFIL PRESTADOR //


app.get("/api/perfilPrestador/:idUsuario", async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT Nombre, Correo, Telefono, FotoPerfil FROM Usuario WHERE IdUsuario = ?`,
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener perfil prestador:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//ACTUALIZAR PERFIL PRESTADOR //

app.put("/api/actualizarPerfilPrestador/:idUsuario", uploadPublicacionPrestador.fields([
  { name: "FotoPerfil", maxCount: 1 },
  { name: "Certificado", maxCount: 1 }
]), async (req, res) => {
  const { idUsuario } = req.params;
  const data = req.body || {};
  const foto = req.files?.FotoPerfil?.[0] || null;
  const certificado = req.files?.Certificado?.[0] || null;

  try {
    const [usuarioRows] = await pool.query(
      "SELECT FotoPerfil FROM Usuario WHERE IdUsuario = ?",
      [idUsuario]
    );

    if (usuarioRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let rutaFotoFinal = usuarioRows[0].FotoPerfil;

    // ✅ Procesar imagen de perfil
    if (foto) {
      const folder = path.join(__dirname, "public", "imagen", "PrestadorServicios", idUsuario);
      fs.mkdirSync(folder, { recursive: true });

      // Eliminar foto anterior
      if (rutaFotoFinal) {
        const rutaAnterior = path.join(__dirname, "public", rutaFotoFinal);
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
          console.log(`🗑️ Foto anterior eliminada: ${rutaAnterior}`);
        }
      }

      const nombreFoto = `${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(foto.originalname)}`;
      const destino = path.join(folder, nombreFoto);
      fs.renameSync(foto.path, destino);

      rutaFotoFinal = path.join("imagen", "PrestadorServicios", idUsuario, nombreFoto).replace(/\\/g, "/");
      console.log(`✅ Nueva foto guardada: ${rutaFotoFinal}`);
    }
    
    // ✅ Procesar certificado
    if (certificado) {
      const folder = path.join(__dirname, "public", "Imagen", "PrestadorServicios", idUsuario, "documentos");
      fs.mkdirSync(folder, { recursive: true });

      // Obtener ruta anterior desde prestadorservicio
      const [servicioRows] = await pool.query(
        "SELECT IdServicio, Certificado FROM prestadorservicio WHERE usuario = ? LIMIT 1",
        [idUsuario]
      );

      if (servicioRows.length === 0) {
        return res.status(404).json({ error: "No se encontró el servicio asociado al usuario." });
      }

      const idServicio = servicioRows[0].IdServicio;
      const rutaCertificadoAnterior = servicioRows[0].Certificado;

      // Eliminar certificado anterior
      if (rutaCertificadoAnterior) {
        const rutaCompleta = path.join(__dirname, "public", rutaCertificadoAnterior);
        if (fs.existsSync(rutaCompleta)) {
          fs.unlinkSync(rutaCompleta);
          console.log(`🗑️ Certificado anterior eliminado`);
        }
      }

      const nombreCertificado = `${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(certificado.originalname)}`;
      const destino = path.join(folder, nombreCertificado);
      fs.renameSync(certificado.path, destino);

      const rutaCertificadoFinal = path.join("Imagen", "PrestadorServicios", idUsuario, "documentos", nombreCertificado).replace(/\\/g, "/");

      await pool.query(
        "UPDATE prestadorservicio SET Certificado = ? WHERE IdServicio = ?",
        [rutaCertificadoFinal, idServicio]
      );
    }

    // ✅ Actualizar datos en la base
    await pool.query(
      `UPDATE Usuario 
      SET Nombre = ?, Apellido = ?, Correo = ?, Telefono = ?, FotoPerfil = ?
      WHERE IdUsuario = ?`,
      [
        data.Nombre || null,
        data.Apellido || null,
        data.Correo || null,
        data.Telefono || null,
        rutaFotoFinal,
        idUsuario
      ]
    );



    res.json({ mensaje: "✅ Perfil actualizado correctamente", fotoPerfil: rutaFotoFinal, certificado: rutaCertificadoFinal });

  } catch (error) {
    console.error("❌ Error al actualizar perfil prestador:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//HISTORIAL DE SERVICIOS -  PRESTADOR//

app.get("/api/historial-servicios/:idPrestador", async (req, res) => {
  const { idPrestador } = req.params;

  try {
    const [servicioRows] = await pool.query(
      "SELECT IdServicio FROM prestadorservicio WHERE usuario = ? LIMIT 1",
      [idPrestador]
    );

    if (servicioRows.length === 0) {
      return res.status(404).json({ error: "Prestador no encontrado" });
    }

    const idServicio = servicioRows[0].IdServicio;

    const [historial] = await pool.query(
      `SELECT 
         hs.IdHistorial,
         u.Nombre AS Cliente,
         pg.TituloPublicacion AS Servicio,
         CONCAT(cas.DireccionRecogida, IF(cas.Destino IS NOT NULL, CONCAT(' → ', cas.Destino), '')) AS Ubicacion,
         cas.FechaServicio AS Fecha,
         cas.Estado,
         pg.TarifaBase AS Total
       FROM historialservicios hs
       JOIN controlagendaservicios cas ON hs.SolicitudServicio = cas.IdSolicitudServicio
       JOIN publicaciongrua pg ON cas.PublicacionGrua = pg.IdPublicacionGrua
       JOIN usuario u ON cas.UsuarioNatural = u.IdUsuario
       WHERE pg.Servicio = ?
       ORDER BY cas.FechaServicio DESC`,
      [idServicio]
    );

    res.json(historial);
  } catch (err) {
    console.error("❌ Error al obtener historial de servicios:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//AGENDA DE SERVICIOS/SOLICITUDES - USUARIO PRESTADOR//
app.get("/api/solicitudes-grua/:idPrestador", async (req, res) => {
  const { idPrestador } = req.params;

  try {
    const servicioRows = await queryPromise(
      "SELECT IdServicio FROM prestadorservicio WHERE usuario = ? LIMIT 1",
      [idPrestador]
    );

    if (servicioRows.length === 0) {
      return res.status(404).json({ error: "Prestador no encontrado" });
    }

    const idServicio = servicioRows[0].IdServicio;

    const solicitudes = await queryPromise(
      `SELECT 
         cas.IdSolicitudServicio,
         u.Nombre AS Cliente,
         pg.TituloPublicacion AS Servicio,
         cas.DireccionRecogida,
         cas.Destino,
         cas.FechaServicio,
         cas.Estado
       FROM controlagendaservicios cas
       JOIN publicaciongrua pg ON cas.PublicacionGrua = pg.IdPublicacionGrua
       JOIN usuario u ON cas.UsuarioNatural = u.IdUsuario
       WHERE pg.Servicio = ?
       ORDER BY cas.FechaServicio DESC`,
      [idServicio]
    );

    res.json(solicitudes);
  } catch (err) {
    console.error("❌ Error al obtener solicitudes:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
//  ACTUALIZAR ESTADO DE SOLICITUD DE GRÚA - PRESTADOR
// ===============================
app.put('/api/solicitudes-grua/estado/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  // Validar que el estado sea válido
  const estadosValidos = ['Aceptado', 'Rechazado', 'Cancelado'];
  
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Estado no válido. Debe ser: Aceptado, Rechazado o Cancelado' 
    });
  }

  try {
    // Verificar que la solicitud existe
    const solicitud = await queryPromise(
      'SELECT IdSolicitudServicio, Estado FROM controlagendaservicios WHERE IdSolicitudServicio = ?',
      [id]
    );

    if (!solicitud || solicitud.length === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }

    // Actualizar el estado
    await queryPromise(
      'UPDATE controlagendaservicios SET Estado = ? WHERE IdSolicitudServicio = ?',
      [estado, id]
    );

    res.status(200).json({
      success: true,
      message: `Solicitud #${id} ${estado.toLowerCase()} correctamente.`
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado de solicitud:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

//MARKETPLACE DE GRUAS - SOLO VISUALIZACION DE USUARIO NATURAL//

app.get("/api/marketplace-gruas", async (req, res) => {
  try {
    const [publicaciones] = await pool.query(
      `SELECT 
         pg.IdPublicacionGrua,
         pg.TituloPublicacion,
         pg.DescripcionServicio,
         pg.ZonaCobertura,
         pg.FotoPublicacion,
         ps.Usuario
       FROM publicaciongrua pg
       JOIN prestadorservicio ps ON pg.Servicio = ps.IdServicio
       ORDER BY pg.IdPublicacionGrua DESC`
    );

    res.json(publicaciones);
  } catch (err) {
    console.error("❌ Error al obtener publicaciones:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

///DETALLE O VISUALIZACION DE EL DETALLE DE LA PUBLICACION DE GRUAS/// 
// 🔹 DETALLE PÚBLICO DE PUBLICACIÓN DE GRÚA (para usuarios naturales)
app.get("/api/publicaciones-grua/:id", async (req, res) => {
  const { id } = req.params;
  console.log("📥 Solicitud recibida con ID:", id);

  try {
    const rows = await queryPromise(
      `SELECT 
         pg.IdPublicacionGrua,
         pg.TituloPublicacion,
         pg.DescripcionServicio,
         pg.ZonaCobertura,
         pg.TarifaBase,
         pg.FotoPublicacion,
         u.Nombre AS NombrePrestador,
         u.Telefono,
         u.Correo
       FROM publicaciongrua pg
       JOIN prestadorservicio ps ON pg.Servicio = ps.IdServicio
       JOIN usuario u ON ps.Usuario = u.IdUsuario
       WHERE pg.IdPublicacionGrua = ?`,
      [id]
    );

    console.log("📊 Resultado de la consulta:", rows);

    if (rows.length === 0) {
      console.warn("⚠️ No se encontró publicación para el ID:", id);
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error al obtener publicación:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


//opiniones grua //
app.post('/api/opiniones-grua', async (req, res) => {
  try {
    const { usuarioId, idPublicacionGrua, nombreUsuario, comentario, calificacion } = req.body;

    if (!usuarioId || !idPublicacionGrua || !comentario || !calificacion) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const [resultado] = await pool.query(
      `INSERT INTO OpinionesGrua (UsuarioNatural, PublicacionGrua, NombreUsuario, Comentario, Calificacion)
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, idPublicacionGrua, nombreUsuario, comentario, calificacion]
    );

    res.json({
      mensaje: '✅ Opinión guardada correctamente',
      idOpinion: resultado.insertId
    });
  } catch (error) {
    console.error('❌ Error al insertar opinión de grúa:', error);
    res.status(500).json({ error: 'Error en el servidor al guardar la opinión.' });
  }
});

app.get('/api/opiniones-grua/:idPublicacionGrua', async (req, res) => {
  const { idPublicacionGrua } = req.params;

  try {
    const opiniones = await queryPromise(
      `SELECT NombreUsuario, Comentario, Calificacion, Fecha
       FROM opinionesgrua
       WHERE PublicacionGrua = ?
       ORDER BY Fecha DESC`,
      [idPublicacionGrua]
    );

    res.json(opiniones);
  } catch (error) {
    console.error('❌ Error al obtener opiniones de grúa:', error);
    res.status(500).json({ error: 'Error en el servidor al consultar opiniones.' });
  }
});

// ===============================
// 🔹 Agendar Servicio de Grúa
// ===============================
app.post('/api/agendar-grua', async (req, res) => {
  try {
    const { usuarioId, idPublicacionGrua, fecha, hora, direccion, destino, detalle } = req.body;

    console.log("📅 Agendando servicio de grúa:", req.body);

    if (!usuarioId || !idPublicacionGrua || !fecha || !hora || !direccion) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para agendar el servicio.' });
    }

    await queryPromise(
      `INSERT INTO controlagendaservicios 
       (UsuarioNatural, PublicacionGrua, FechaServicio, HoraServicio, DireccionRecogida, Destino, ComentariosAdicionales, Estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')`,
      [usuarioId, idPublicacionGrua, fecha, hora, direccion, destino || null, detalle || null]
    );

    console.log("✅ Servicio agendado correctamente");
    res.json({ success: true, message: 'Servicio agendado con éxito.' });

  } catch (error) {
    console.error('❌ Error al agendar servicio de grúa:', error);
    res.status(500).json({ error: 'Error en el servidor al agendar el servicio.' });
  }
});

// ===============================
// 🔹 Historial de Servicios del Prestador
// ===============================
app.get('/api/historial-servicios-prestador/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;

  try {
    console.log("📊 Cargando historial de servicios para prestador:", usuarioId);

    // Obtener el IdServicio del prestador
    const servicioRows = await queryPromise(
      'SELECT IdServicio FROM prestadorservicio WHERE Usuario = ?',
      [usuarioId]
    );

    if (servicioRows.length === 0) {
      console.log("⚠️ No se encontró servicio asociado al prestador");
      return res.json([]);
    }

    const idServicio = servicioRows[0].IdServicio;

    // Obtener todos los servicios agendados
    const servicios = await queryPromise(
      `SELECT 
         cas.IdSolicitudServicio,
         u.Nombre AS Cliente,
         pg.TituloPublicacion AS Servicio,
         cas.DireccionRecogida AS Origen,
         cas.Destino,
         cas.FechaServicio AS Fecha,
         cas.HoraServicio AS Hora,
         cas.Estado
       FROM controlagendaservicios cas
       JOIN publicaciongrua pg ON cas.PublicacionGrua = pg.IdPublicacionGrua
       JOIN usuario u ON cas.UsuarioNatural = u.IdUsuario
       WHERE pg.Servicio = ?
       ORDER BY cas.FechaServicio DESC`,
      [idServicio]
    );

    console.log(`✅ ${servicios.length} servicios encontrados`);
    res.json(servicios);

  } catch (error) {
    console.error('❌ Error al obtener historial de servicios:', error);
    res.status(500).json({ error: 'Error en el servidor al consultar historial.' });
  }
});