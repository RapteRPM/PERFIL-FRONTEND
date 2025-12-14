#!/usr/bin/env node

/**
 * Script de prueba de API endpoints
 * Verifica que todos los endpoints del CRUD funcionen correctamente
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const client = axios.create({ baseURL: BASE_URL });
let sessionCookie = '';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(type, message, details = '') {
  const timestamp = new Date().toLocaleTimeString();
  switch(type) {
    case 'success':
      console.log(`${colors.green}✅ [${timestamp}] ${message}${colors.reset}`, details);
      break;
    case 'error':
      console.log(`${colors.red}❌ [${timestamp}] ${message}${colors.reset}`, details);
      break;
    case 'warning':
      console.log(`${colors.yellow}⚠️  [${timestamp}] ${message}${colors.reset}`, details);
      break;
    case 'info':
      console.log(`${colors.blue}ℹ️  [${timestamp}] ${message}${colors.reset}`, details);
      break;
    case 'test':
      console.log(`${colors.cyan}🧪 [${timestamp}] ${message}${colors.reset}`, details);
      break;
  }
}

async function testHealthCheck() {
  log('test', 'Prueba: Health Check');
  try {
    const response = await client.get('/health');
    if (response.data.status === 'OK') {
      log('success', 'Health Check funcionando', JSON.stringify(response.data));
      return true;
    }
  } catch (err) {
    log('error', 'Health Check falló', err.message);
    return false;
  }
}

async function testDbStatus() {
  log('test', 'Prueba: DB Status');
  try {
    const response = await client.get('/api/db-status');
    log('success', 'DB Status OK', `Usuarios: ${response.data.usuarios}, Publicaciones: ${response.data.publicaciones}`);
    return true;
  } catch (err) {
    log('error', 'DB Status falló', err.message);
    return false;
  }
}

async function testLogin() {
  log('test', 'Prueba: Login Demo');
  try {
    const response = await client.post('/api/login/demo', {
      username: 'usuario1',
      password: '123456'
    });
    
    if (response.data.success) {
      sessionCookie = response.headers['set-cookie'];
      log('success', 'Login Demo exitoso', `Usuario: ${response.data.usuario}, Tipo: ${response.data.tipo}`);
      return true;
    }
  } catch (err) {
    log('error', 'Login Demo falló', err.response?.data?.error || err.message);
    return false;
  }
}

async function testGetUsuarioActual() {
  log('test', 'Prueba: Obtener Usuario Actual');
  try {
    const response = await client.get('/api/usuario-actual');
    log('success', 'Usuario Actual obtenido', JSON.stringify(response.data));
    return true;
  } catch (err) {
    log('warning', 'Usuario Actual (requiere sesión)', err.message);
    return false;
  }
}

async function testGetPublicaciones() {
  log('test', 'Prueba: Obtener Publicaciones');
  try {
    const response = await client.get('/api/publicaciones');
    log('success', 'Publicaciones obtenidas', `Total: ${Array.isArray(response.data) ? response.data.length : response.data.count}`);
    return true;
  } catch (err) {
    log('error', 'Obtener Publicaciones falló', err.message);
    return false;
  }
}

async function testGetPublicacionesPublicas() {
  log('test', 'Prueba: Obtener Publicaciones Públicas');
  try {
    const response = await client.get('/api/publicaciones_publicas');
    log('success', 'Publicaciones Públicas obtenidas', `Total: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
    return true;
  } catch (err) {
    log('error', 'Obtener Publicaciones Públicas falló', err.message);
    return false;
  }
}

async function testGetCategorias() {
  log('test', 'Prueba: Obtener Categorías');
  try {
    const response = await client.get('/api/categorias');
    const count = Array.isArray(response.data) ? response.data.length : response.data.count;
    log('success', 'Categorías obtenidas', `Total: ${count}`);
    return true;
  } catch (err) {
    log('error', 'Obtener Categorías falló', err.message);
    return false;
  }
}

async function testGetTalleres() {
  log('test', 'Prueba: Obtener Talleres');
  try {
    const response = await client.get('/api/talleres');
    const count = Array.isArray(response.data) ? response.data.length : response.data.count;
    log('success', 'Talleres obtenidos', `Total: ${count}`);
    return true;
  } catch (err) {
    log('error', 'Obtener Talleres falló', err.message);
    return false;
  }
}

async function testGetHistorial() {
  log('test', 'Prueba: Obtener Historial');
  try {
    const response = await client.get('/api/historial');
    const count = Array.isArray(response.data) ? response.data.length : response.data.count || 0;
    log('success', 'Historial obtenido', `Total: ${count}`);
    return true;
  } catch (err) {
    log('warning', 'Obtener Historial (puede requerir parámetros)', err.message);
    return false;
  }
}

async function testGetMarketplaceGruas() {
  log('test', 'Prueba: Obtener Marketplace de Grúas');
  try {
    const response = await client.get('/api/marketplace-gruas');
    const count = Array.isArray(response.data) ? response.data.length : response.data.count || 0;
    log('success', 'Marketplace de Grúas obtenido', `Total: ${count}`);
    return true;
  } catch (err) {
    log('warning', 'Obtener Marketplace de Grúas', err.message);
    return false;
  }
}

async function testVerificarSesion() {
  log('test', 'Prueba: Verificar Sesión');
  try {
    const response = await client.get('/api/verificar-sesion');
    log('success', 'Verificación de sesión', JSON.stringify(response.data));
    return true;
  } catch (err) {
    log('warning', 'Verificar Sesión (puede no tener sesión activa)', err.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + colors.cyan + '═════════════════════════════════════════');
  console.log('🚀 INICIANDO PRUEBAS DE API ENDPOINTS');
  console.log('═════════════════════════════════════════' + colors.reset + '\n');

  let passed = 0;
  let failed = 0;

  // Pruebas básicas
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'DB Status', fn: testDbStatus },
    { name: 'Login Demo', fn: testLogin },
    { name: 'Verificar Sesión', fn: testVerificarSesion },
    { name: 'Usuario Actual', fn: testGetUsuarioActual },
    { name: 'Publicaciones', fn: testGetPublicaciones },
    { name: 'Publicaciones Públicas', fn: testGetPublicacionesPublicas },
    { name: 'Categorías', fn: testGetCategorias },
    { name: 'Talleres', fn: testGetTalleres },
    { name: 'Historial', fn: testGetHistorial },
    { name: 'Marketplace de Grúas', fn: testGetMarketplaceGruas },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      result ? passed++ : failed++;
      await new Promise(r => setTimeout(r, 300)); // Esperar entre pruebas
    } catch (err) {
      log('error', `Error en ${test.name}`, err.message);
      failed++;
    }
  }

  console.log('\n' + colors.cyan + '═════════════════════════════════════════');
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('═════════════════════════════════════════' + colors.reset);
  console.log(`${colors.green}✅ Exitosas: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Fallidas: ${failed}${colors.reset}`);
  console.log(`📈 Porcentaje: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

  if (failed === 0) {
    log('success', '¡TODAS LAS PRUEBAS PASARON!');
  } else {
    log('warning', `${failed} prueba(s) no completada(s) - Revisar resultados arriba`);
  }
}

// Ejecutar pruebas
runAllTests().catch(err => {
  log('error', 'Error fatal durante pruebas', err.message);
  process.exit(1);
});
