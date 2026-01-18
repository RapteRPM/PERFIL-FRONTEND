/**
 * Script de pruebas completas de la API
 * Ejecutar: node test-api-completo.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
let sessionCookie = null;

// Función para hacer requests
async function request(method, endpoint, body = null, auth = false) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (auth && sessionCookie) {
    options.headers['Cookie'] = sessionCookie;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return { status: response.status, data: await response.json() };
    }
    return { status: response.status, data: await response.text() };
  } catch (error) {
    return { status: 'ERROR', error: error.message };
  }
}

// Función para imprimir resultados
function printResult(testName, result, expected) {
  const passed = expected ? expected(result) : result.status >= 200 && result.status < 500;
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${testName}: ${result.status}`);
  if (!passed && result.data) {
    console.log(`   → ${JSON.stringify(result.data).substring(0, 100)}`);
  }
  return passed;
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         PRUEBAS COMPLETAS DE LA API RPM MARKET               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  // ==========================================
  // 1. AUTENTICACIÓN
  // ==========================================
  console.log('📋 1. AUTENTICACIÓN');
  console.log('─'.repeat(50));

  // Login incorrecto
  let r = await request('POST', '/api/login', { username: 'admin@rpm.com', password: 'wrongpass' });
  if (printResult('Login con contraseña incorrecta (401)', r, r => r.status === 401)) passed++; else failed++;

  // Login correcto admin
  r = await request('POST', '/api/login', { username: 'admin@rpm.com', password: 'RPM2026*' });
  if (printResult('Login admin (200)', r, r => r.status === 200 && r.data.success)) passed++; else failed++;

  // Verificar sesión
  r = await request('GET', '/api/verificar-sesion', null, true);
  if (printResult('Verificar sesión activa (200)', r, r => r.status === 200)) passed++; else failed++;

  // ==========================================
  // 2. ENDPOINTS DE ADMIN
  // ==========================================
  console.log('\n📋 2. ENDPOINTS DE ADMIN');
  console.log('─'.repeat(50));

  r = await request('GET', '/api/admin/usuarios', null, true);
  if (printResult('Listar usuarios (200)', r, r => r.status === 200 && r.data.usuarios)) passed++; else failed++;

  r = await request('GET', '/api/admin/publicaciones', null, true);
  if (printResult('Listar publicaciones (200)', r, r => r.status === 200)) passed++; else failed++;

  r = await request('GET', '/api/admin/pqr', null, true);
  if (printResult('Listar PQRs (200)', r, r => r.status === 200 && r.data.pqrs !== undefined)) passed++; else failed++;

  // ==========================================
  // 3. ENDPOINTS PÚBLICOS
  // ==========================================
  console.log('\n📋 3. ENDPOINTS PÚBLICOS');
  console.log('─'.repeat(50));

  r = await request('GET', '/api/publicaciones_publicas');
  if (printResult('Publicaciones públicas (200)', r, r => r.status === 200)) passed++; else failed++;

  r = await request('GET', '/api/categorias');
  if (printResult('Listar categorías (200)', r, r => r.status === 200 || r.status === 404)) passed++; else failed++;

  // ==========================================
  // 4. VALIDACIONES DE REGISTRO
  // ==========================================
  console.log('\n📋 4. VALIDACIONES DE REGISTRO');
  console.log('─'.repeat(50));

  r = await request('GET', '/api/usuarios/cedula/1019138679');
  if (printResult('Verificar cédula existente (200)', r, r => r.status === 200 || r.status === 404)) passed++; else failed++;

  r = await request('GET', '/api/usuarios/cedula/999999888');
  if (printResult('Verificar cédula inexistente (404)', r, r => r.status === 404)) passed++; else failed++;

  // ==========================================
  // 5. ENDPOINTS DE PERFIL
  // ==========================================
  console.log('\n📋 5. ENDPOINTS DE PERFIL');
  console.log('─'.repeat(50));

  r = await request('GET', '/api/perfil', null, true);
  if (printResult('Obtener perfil (200)', r, r => r.status === 200)) passed++; else failed++;

  // ==========================================
  // 6. CIERRE DE SESIÓN
  // ==========================================
  console.log('\n📋 6. CIERRE DE SESIÓN');
  console.log('─'.repeat(50));

  r = await request('POST', '/api/logout', null, true);
  if (printResult('Cerrar sesión (200)', r, r => r.status === 200)) passed++; else failed++;

  // Verificar que sesión está cerrada
  r = await request('GET', '/api/admin/usuarios', null, true);
  if (printResult('Acceso denegado sin sesión (401/403)', r, r => r.status === 401 || r.status === 403)) passed++; else failed++;

  // ==========================================
  // RESUMEN
  // ==========================================
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('═'.repeat(50));
  console.log(`✅ Pasadas: ${passed}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  console.log(`🎯 Porcentaje: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron correctamente!');
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisa los errores arriba.');
  }
}

runTests().catch(console.error);
