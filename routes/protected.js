// routes/protected.js
const express = require('express');
const path = require('path');
const router = express.Router();
const { verificarSesion } = require('../middlewares/sesion');

// Ruta protegida al index.html (página principal)
router.get('/General/index.html', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/General/index.html'));
});

// Natural
router.get('/Natural/perfil_usuario.html', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/Natural/perfil_usuario.html'));
});

// Comerciante
router.get('/Comerciante/dashboard_comerciante.html', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/Comerciante/dashboard_comerciante.html'));
});

router.get('/Comerciante/Historial_ventas.html', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/Comerciante/Historial_ventas.html'));
});

// Prestador de servicio
router.get('/PrestadorServicios/perfil_servicios.html', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/PrestadorServicios/perfil_servicios.html'));
});

module.exports = router;
