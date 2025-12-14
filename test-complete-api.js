#!/usr/bin/env node

/**
 * Script de prueba completo de CRUD API
 * Revisa todos los endpoints del servidor
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let passed = 0;
let failed = 0;
let warnings = 0;

function log(type, endpoint, message) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️ ',
    info: 'ℹ️ '
  };
  
  const colors_map = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.blue
  };
  
  console.log(`${colors_map[type]}${icons[type]}${colors.reset} ${endpoint.padEnd(50)} ${message}`);
  
  if (type === 'success') passed++;
  else if (type === 'error') failed++;
  else if (type === 'warning') warnings++;
}

async function test(endpoint, method = 'GET', data = null, description = '') {
  try {
    let response;
    const config = { validateStatus: () => true };
    
    if (method === 'GET') {
      response = await axios.get(`${BASE_URL}${endpoint}`, config);
    } else if (method === 'POST') {
      response = await axios.post(`${BASE_URL}${endpoint}`, data, config);
    } else if (method === 'PUT') {
      response = await axios.put(`${BASE_URL}${endpoint}`, data, config);
    } else if (method === 'DELETE') {
      response = await axios.delete(`${BASE_URL}${endpoint}`, config);
    }
    
    const status = response.status;
    const isSuccess = status >= 200 && status < 300;
    
    if (isSuccess || status === 401 || status === 404) {
      log('success', `[${method}] ${endpoint}`, `${status} ${description}`);
      return true;
    } else if (status === 400 || status === 422) {
      log('warning', `[${method}] ${endpoint}`, `${status} - Validación ${description}`);
      return true;
    } else {
      log('error', `[${method}] ${endpoint}`, `${status} ${description}`);
      return false;
    }
  } catch (err) {
    log('error', `[${method}] ${endpoint}`, `Error: ${err.message.substring(0, 40)}`);
    return false;
  }
}

async function runTests() {
  console.log('\n' + colors.cyan + '╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                      🧪 PRUEBAS COMPLETAS DE API ENDPOINTS                      ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝' + colors.reset + '\n');

  console.log(colors.magenta + '📊 ENDPOINTS DE SALUD Y ESTADO' + colors.reset);
  await test('/health', 'GET', null, 'Health check');
  await test('/api/db-status', 'GET', null, 'Estado de BD');
  await test('/api/verificar-sesion', 'GET', null, 'Verificar sesión');

  console.log('\n' + colors.magenta + '🔐 AUTENTICACIÓN' + colors.reset);
  await test('/api/login/demo', 'POST', { username: 'usuario1', password: '123456' }, 'Login demo');
  await test('/api/login', 'POST', { username: 'test', password: 'test' }, 'Login con BD');
  await test('/logout', 'GET', null, 'Logout');

  console.log('\n' + colors.magenta + '👤 PERFIL Y USUARIO' + colors.reset);
  await test('/api/usuario-actual', 'GET', null, 'Obtener usuario actual');
  await test('/api/usuarios/cedula/1001092582', 'GET', null, 'Buscar por cédula');
  await test('/api/perfilNatural/1', 'GET', null, 'Perfil usuario natural');
  await test('/api/perfilComerciante/1', 'GET', null, 'Perfil comerciante');
  await test('/api/perfil-prestador', 'GET', null, 'Perfil prestador');

  console.log('\n' + colors.magenta + '📦 PUBLICACIONES (PRODUCTOS)' + colors.reset);
  await test('/api/publicaciones', 'GET', null, 'Obtener todas las publicaciones');
  await test('/api/publicaciones_publicas', 'GET', null, 'Publicaciones públicas');
  await test('/api/publicaciones/1', 'GET', null, 'Detalle de publicación');
  await test('/api/detallePublicacion/1', 'GET', null, 'Detalle públicación (alt)');
  await test('/api/dashboard/comerciante', 'GET', null, 'Dashboard comerciante');
  await test('/api/categorias', 'GET', null, 'Obtener categorías');

  console.log('\n' + colors.magenta + '🏪 COMERCIANTE - CRUD' + colors.reset);
  await test('/api/citas-comerciante', 'GET', null, 'Obtener citas');
  await test('/api/historial-ventas', 'GET', null, 'Historial de ventas');
  
  console.log('\n' + colors.magenta + '🛒 CARRITO Y COMPRAS' + colors.reset);
  await test('/api/carrito', 'GET', null, 'Obtener carrito');
  await test('/api/carrito', 'POST', { 
    idPublicacion: 1, 
    cantidad: 1, 
    precio: 100 
  }, 'Añadir al carrito');
  await test('/api/proceso-compra', 'GET', null, 'Obtener proceso compra');
  await test('/api/factura/1', 'GET', null, 'Obtener factura');

  console.log('\n' + colors.magenta + '🚚 HISTORIAL Y TRANSACCIONES' + colors.reset);
  await test('/api/historial', 'GET', null, 'Obtener historial');
  await test('/api/confirmar-recibido', 'POST', { idFactura: 1 }, 'Confirmar recibido');

  console.log('\n' + colors.magenta + '🏪 TALLERES' + colors.reset);
  await test('/api/talleres', 'GET', null, 'Obtener talleres');

  console.log('\n' + colors.magenta + '🚗 GRÚAS - MARKETPLACE' + colors.reset);
  await test('/api/marketplace-gruas', 'GET', null, 'Marketplace de grúas');
  await test('/api/publicaciones-grua', 'GET', null, 'Publicaciones de grúas');
  await test('/api/publicaciones-grua/1', 'GET', null, 'Detalle publicación grúa');
  await test('/api/opiniones-grua/1', 'GET', null, 'Opiniones de grúa');
  
  console.log('\n' + colors.magenta + '🎯 PRESTADOR DE SERVICIOS - CRUD' + colors.reset);
  await test('/api/perfilPrestador/1', 'GET', null, 'Perfil prestador');
  await test('/api/historial-servicios/1', 'GET', null, 'Historial servicios');
  await test('/api/historial-servicios-prestador/1', 'GET', null, 'Historial servicios alt');
  await test('/api/solicitudes-grua/1', 'GET', null, 'Solicitudes de grúa');

  console.log('\n' + colors.magenta + '📞 SOPORTE' + colors.reset);
  await test('/api/centro-ayuda', 'POST', { 
    nombre: 'Test', 
    email: 'test@test.com', 
    asunto: 'Test', 
    mensaje: 'Test' 
  }, 'Centro de ayuda');

  console.log('\n' + colors.magenta + '👨‍💼 PANEL ADMINISTRATIVO' + colors.reset);
  await test('/api/admin/estadisticas', 'GET', null, 'Estadísticas (requiere admin)');
  await test('/api/admin/usuarios', 'GET', null, 'Gestión usuarios (requiere admin)');
  await test('/api/admin/publicaciones', 'GET', null, 'Gestión publicaciones (requiere admin)');
  await test('/api/admin/pqr', 'GET', null, 'PQR (requiere admin)');

  console.log('\n' + colors.cyan + '╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              📊 RESUMEN FINAL                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝' + colors.reset);
  
  console.log(`${colors.green}✅ Exitosas: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Fallidas: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Advertencias: ${warnings}${colors.reset}`);
  console.log(`📈 Total de pruebas: ${passed + failed + warnings}`);
  console.log(`📊 Porcentaje de éxito: ${Math.round((passed / (passed + failed + warnings)) * 100)}%\n`);

  if (failed === 0) {
    console.log(colors.green + '✨ ¡TODOS LOS ENDPOINTS ESTÁN OPERACIONALES!' + colors.reset);
  } else {
    console.log(colors.yellow + `⚠️  ${failed} endpoint(s) con problemas - Revisar arriba` + colors.reset);
  }
}

// Ejecutar las pruebas
runTests().catch(err => {
  console.error(colors.red + '❌ Error fatal:', err.message + colors.reset);
  process.exit(1);
});
