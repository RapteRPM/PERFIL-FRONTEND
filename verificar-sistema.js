/**
 * Script de verificación completa del sistema RPM Market
 * Ejecutar: node verificar-sistema.js
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'rpm_market.db');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║       VERIFICACIÓN COMPLETA DEL SISTEMA RPM MARKET          ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Verificar existencia de BD
if (!fs.existsSync(dbPath)) {
  console.log('❌ No existe rpm_market.db - Se creará al iniciar el servidor');
  process.exit(1);
}

const db = new Database(dbPath);

// ============================================
// 1. VERIFICAR TABLAS
// ============================================
console.log('📋 1. VERIFICANDO ESTRUCTURA DE TABLAS');
console.log('─'.repeat(50));

const tablas = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
const tablasRequeridas = [
  'usuario', 'credenciales', 'perfilnatural', 'comerciante', 
  'prestadorservicio', 'publicacion', 'pqr', 'sesion_activa',
  'tokens_verificacion', 'historial_contrasenas', 'registros_pendientes'
];

const tablasExistentes = tablas.map(t => t.name);
console.log('Tablas encontradas:', tablasExistentes.length);

tablasRequeridas.forEach(tabla => {
  const existe = tablasExistentes.includes(tabla);
  console.log(`  ${existe ? '✅' : '❌'} ${tabla}`);
});

// ============================================
// 2. VERIFICAR USUARIOS
// ============================================
console.log('\n📋 2. VERIFICANDO USUARIOS');
console.log('─'.repeat(50));

try {
  const usuarios = db.prepare('SELECT IdUsuario, TipoUsuario, Nombre, Apellido, Correo, Estado FROM usuario').all();
  console.log(`Total usuarios: ${usuarios.length}`);
  
  if (usuarios.length > 0) {
    console.table(usuarios.map(u => ({
      ID: u.IdUsuario,
      Tipo: u.TipoUsuario,
      Nombre: `${u.Nombre} ${u.Apellido}`,
      Correo: u.Correo,
      Estado: u.Estado
    })));
  } else {
    console.log('⚠️ No hay usuarios en la base de datos');
  }
} catch (err) {
  console.log('❌ Error al verificar usuarios:', err.message);
}

// ============================================
// 3. VERIFICAR Y CONFIGURAR ADMIN
// ============================================
console.log('\n📋 3. VERIFICANDO USUARIO ADMIN');
console.log('─'.repeat(50));

try {
  const admin = db.prepare("SELECT * FROM credenciales WHERE NombreUsuario = 'admin@rpm.com'").get();
  
  if (admin) {
    console.log('✅ Admin encontrado');
    
    // Verificar si la contraseña es la real (RPM2026*) o la de prueba (123456)
    const esReal = await bcrypt.compare('RPM2026*', admin.Contrasena);
    const esPrueba = await bcrypt.compare('123456', admin.Contrasena);
    
    if (esReal) {
      console.log('✅ Contraseña del admin: RPM2026* (REAL)');
    } else if (esPrueba) {
      console.log('⚠️ Contraseña del admin: 123456 (PRUEBA)');
      console.log('   Actualizando a contraseña real...');
      
      const hashReal = await bcrypt.hash('RPM2026*', 10);
      db.prepare("UPDATE credenciales SET Contrasena = ? WHERE NombreUsuario = 'admin@rpm.com'").run(hashReal);
      console.log('✅ Contraseña actualizada a: RPM2026*');
    } else {
      console.log('❓ Contraseña desconocida');
    }
  } else {
    console.log('⚠️ Admin no existe. Creando...');
    
    // Verificar si existe el usuario en la tabla usuario
    const usuarioAdmin = db.prepare("SELECT * FROM usuario WHERE IdUsuario = 999999999").get();
    
    if (!usuarioAdmin) {
      db.prepare(`
        INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
        VALUES (999999999, 'Administrador', 'Administrador', 'Sistema', '999999999', '3000000000', 'admin@rpm.com', 'imagen/imagen_perfil.png', 'Activo')
      `).run();
    }
    
    const hashReal = await bcrypt.hash('RPM2026*', 10);
    db.prepare(`
      INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
      VALUES (999999999, 'admin@rpm.com', ?)
    `).run(hashReal);
    
    console.log('✅ Admin creado con contraseña: RPM2026*');
  }
} catch (err) {
  console.log('❌ Error con admin:', err.message);
}

// ============================================
// 4. VERIFICAR CREDENCIALES
// ============================================
console.log('\n📋 4. VERIFICANDO TODAS LAS CREDENCIALES');
console.log('─'.repeat(50));

try {
  const credenciales = db.prepare(`
    SELECT c.NombreUsuario, u.TipoUsuario, u.Estado 
    FROM credenciales c 
    JOIN usuario u ON c.Usuario = u.IdUsuario
  `).all();
  
  console.log(`Total credenciales: ${credenciales.length}`);
  if (credenciales.length > 0) {
    console.table(credenciales);
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

// ============================================
// 5. VERIFICAR PUBLICACIONES
// ============================================
console.log('\n📋 5. VERIFICANDO PUBLICACIONES');
console.log('─'.repeat(50));

try {
  const publicaciones = db.prepare('SELECT COUNT(*) as total FROM publicacion').get();
  console.log(`Total publicaciones: ${publicaciones.total}`);
  
  if (publicaciones.total > 0) {
    const ultimas = db.prepare('SELECT IdPublicacion, TipoPublicacion, Titulo, Estado FROM publicacion LIMIT 5').all();
    console.table(ultimas);
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

// ============================================
// 6. VERIFICAR PQRs
// ============================================
console.log('\n📋 6. VERIFICANDO PQRs');
console.log('─'.repeat(50));

try {
  const pqrs = db.prepare('SELECT COUNT(*) as total FROM pqr').get();
  console.log(`Total PQRs: ${pqrs.total}`);
} catch (err) {
  console.log('❌ Error:', err.message);
}

// ============================================
// 7. VERIFICAR SESIONES ACTIVAS
// ============================================
console.log('\n📋 7. VERIFICANDO SESIONES ACTIVAS');
console.log('─'.repeat(50));

try {
  const sesiones = db.prepare('SELECT COUNT(*) as total FROM sesion_activa').get();
  console.log(`Sesiones activas: ${sesiones.total}`);
} catch (err) {
  console.log('❌ Error:', err.message);
}

// ============================================
// 8. VERIFICAR REGISTROS PENDIENTES
// ============================================
console.log('\n📋 8. VERIFICANDO REGISTROS PENDIENTES');
console.log('─'.repeat(50));

try {
  const pendientes = db.prepare('SELECT COUNT(*) as total FROM registros_pendientes').get();
  console.log(`Registros pendientes de verificación: ${pendientes.total}`);
} catch (err) {
  console.log('⚠️ Tabla registros_pendientes no existe (se creará al iniciar)');
}

// ============================================
// 9. VERIFICAR ARCHIVOS IMPORTANTES
// ============================================
console.log('\n📋 9. VERIFICANDO ARCHIVOS DEL SISTEMA');
console.log('─'.repeat(50));

const archivosImportantes = [
  'server.js',
  'config/db.js',
  'routes/auth.js',
  'routes/protected.js',
  'controllers/enviarCorreo.js',
  '.env',
  'public/General/index.html',
  'public/General/Ingreso.html',
  'public/General/crear-contrasena.html',
  'public/Administrador/panel_admin.html'
];

archivosImportantes.forEach(archivo => {
  const existe = fs.existsSync(path.join(__dirname, archivo));
  console.log(`  ${existe ? '✅' : '❌'} ${archivo}`);
});

// ============================================
// 10. VERIFICAR CONFIGURACIÓN .env
// ============================================
console.log('\n📋 10. VERIFICANDO CONFIGURACIÓN .env');
console.log('─'.repeat(50));

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  const tieneEmail = envContent.includes('EMAIL_USER=') && envContent.includes('EMAIL_PASS=');
  const tieneDB = envContent.includes('DB_HOST=');
  
  console.log(`  ${tieneEmail ? '✅' : '❌'} Configuración de email`);
  console.log(`  ${tieneDB ? '✅' : '❌'} Configuración de base de datos MySQL`);
  console.log('  ℹ️  Usando SQLite para desarrollo local');
} catch (err) {
  console.log('❌ No se pudo leer .env:', err.message);
}

// ============================================
// RESUMEN FINAL
// ============================================
console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                      RESUMEN FINAL                           ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

console.log('\n🔑 CREDENCIALES DE ACCESO:');
console.log('   Admin: admin@rpm.com / RPM2026*');
console.log('   (Otros usuarios dependen de lo que exista en la BD)');

console.log('\n🚀 PARA INICIAR EL SERVIDOR:');
console.log('   node server.js');

console.log('\n🌐 URLs PRINCIPALES:');
console.log('   http://localhost:3000/ - Página principal');
console.log('   http://localhost:3000/General/Ingreso.html - Login');
console.log('   http://localhost:3000/Administrador/panel_admin.html - Panel Admin');

console.log('\n📝 FUNCIONALIDADES A PROBAR:');
console.log('   1. Login con admin@rpm.com / RPM2026*');
console.log('   2. Gestión de usuarios (aprobar/rechazar/eliminar)');
console.log('   3. Registro de nuevo usuario con verificación por email');
console.log('   4. Gestión de publicaciones');
console.log('   5. Sistema de PQRs');

db.close();
console.log('\n✅ Verificación completada\n');
