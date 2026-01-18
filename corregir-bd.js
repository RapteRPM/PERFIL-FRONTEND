/**
 * Script para corregir la estructura de la base de datos SQLite
 * Añade columnas faltantes a las tablas existentes
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'rpm_market.db');
const db = new Database(dbPath);

console.log('🔧 Corrigiendo estructura de base de datos...\n');

// Función para verificar si una columna existe
function columnaExiste(tabla, columna) {
  try {
    const info = db.prepare(`PRAGMA table_info(${tabla})`).all();
    return info.some(col => col.name === columna);
  } catch {
    return false;
  }
}

// Función para agregar columna de forma segura
function agregarColumna(tabla, columna, tipo, defaultValue = null) {
  if (columnaExiste(tabla, columna)) {
    console.log(`  ✓ ${tabla}.${columna} ya existe`);
    return false;
  }
  
  try {
    let sql = `ALTER TABLE ${tabla} ADD COLUMN ${columna} ${tipo}`;
    if (defaultValue !== null) {
      sql += ` DEFAULT ${defaultValue}`;
    }
    db.exec(sql);
    console.log(`  ✅ ${tabla}.${columna} agregada`);
    return true;
  } catch (err) {
    console.log(`  ❌ Error en ${tabla}.${columna}: ${err.message}`);
    return false;
  }
}

// Función para crear tabla si no existe
function crearTablaSiNoExiste(nombre, sql) {
  try {
    const existe = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(nombre);
    if (existe) {
      console.log(`  ✓ Tabla ${nombre} ya existe`);
      return false;
    }
    db.exec(sql);
    console.log(`  ✅ Tabla ${nombre} creada`);
    return true;
  } catch (err) {
    console.log(`  ❌ Error creando ${nombre}: ${err.message}`);
    return false;
  }
}

// ==========================================
// 1. TABLA centroayuda - Agregar campos de respuesta
// ==========================================
console.log('📋 1. Tabla centroayuda:');
agregarColumna('centroayuda', 'Respuesta', 'TEXT', "NULL");
agregarColumna('centroayuda', 'FechaRespuesta', 'TEXT', "NULL");
agregarColumna('centroayuda', 'Respondida', 'TEXT', "'No'");
agregarColumna('centroayuda', 'FechaCreacion', 'TEXT', "CURRENT_TIMESTAMP");

// ==========================================
// 2. TABLA credenciales - Agregar ContrasenaTemporal
// ==========================================
console.log('\n📋 2. Tabla credenciales:');
agregarColumna('credenciales', 'ContrasenaTemporal', 'TEXT', "'No'");

// ==========================================
// 3. TABLA usuario - Agregar campos necesarios
// ==========================================
console.log('\n📋 3. Tabla usuario:');
agregarColumna('usuario', 'FechaCreacion', 'TEXT', "CURRENT_TIMESTAMP");
agregarColumna('usuario', 'FechaModificacion', 'TEXT', "NULL");

// ==========================================
// 4. TABLA tokens_verificacion
// ==========================================
console.log('\n📋 4. Tabla tokens_verificacion:');
crearTablaSiNoExiste('tokens_verificacion', `
  CREATE TABLE tokens_verificacion (
    IdToken INTEGER PRIMARY KEY AUTOINCREMENT,
    Usuario INTEGER NOT NULL,
    Token TEXT NOT NULL,
    TipoToken TEXT DEFAULT 'RecuperarContrasena',
    Usado TEXT DEFAULT 'No',
    FechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
    FechaExpiracion TEXT,
    CodigoVerificacion TEXT DEFAULT NULL,
    CodigoVerificado TEXT DEFAULT 'No'
  )
`);
agregarColumna('tokens_verificacion', 'CodigoVerificacion', 'TEXT', "NULL");
agregarColumna('tokens_verificacion', 'CodigoVerificado', 'TEXT', "'No'");

// ==========================================
// 5. TABLA sesion_activa
// ==========================================
console.log('\n📋 5. Tabla sesion_activa:');
crearTablaSiNoExiste('sesion_activa', `
  CREATE TABLE sesion_activa (
    IdSesion INTEGER PRIMARY KEY AUTOINCREMENT,
    Usuario INTEGER NOT NULL,
    SessionId TEXT NOT NULL UNIQUE,
    FechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
    FechaExpiracion TEXT,
    Activa TEXT DEFAULT 'Si'
  )
`);

// ==========================================
// 6. TABLA historial_contrasenas
// ==========================================
console.log('\n📋 6. Tabla historial_contrasenas:');
crearTablaSiNoExiste('historial_contrasenas', `
  CREATE TABLE historial_contrasenas (
    IdHistorial INTEGER PRIMARY KEY AUTOINCREMENT,
    Usuario INTEGER NOT NULL,
    ContrasenaAnterior TEXT NOT NULL,
    FechaCambio TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// ==========================================
// 7. TABLA registros_pendientes
// ==========================================
console.log('\n📋 7. Tabla registros_pendientes:');
crearTablaSiNoExiste('registros_pendientes', `
  CREATE TABLE registros_pendientes (
    IdRegistro INTEGER PRIMARY KEY AUTOINCREMENT,
    Token TEXT UNIQUE NOT NULL,
    TipoUsuario TEXT NOT NULL,
    Nombre TEXT NOT NULL,
    Apellido TEXT NOT NULL,
    Documento TEXT NOT NULL,
    Telefono TEXT NOT NULL,
    Correo TEXT NOT NULL,
    Direccion TEXT,
    Barrio TEXT,
    NitComercio TEXT,
    NombreComercio TEXT,
    DiasAtencion TEXT,
    HoraInicio TEXT,
    HoraFin TEXT,
    Latitud REAL,
    Longitud REAL,
    Certificado TEXT,
    FotoPerfil TEXT,
    CodigoVerificacion TEXT,
    CodigoVerificado TEXT DEFAULT 'No',
    FechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
    FechaExpiracion TEXT,
    Estado TEXT DEFAULT 'Pendiente'
  )
`);

// ==========================================
// 8. TABLA publicacion - Campos adicionales
// ==========================================
console.log('\n📋 8. Tabla publicacion:');
agregarColumna('publicacion', 'FechaCreacion', 'TEXT', "CURRENT_TIMESTAMP");
agregarColumna('publicacion', 'FechaModificacion', 'TEXT', "NULL");

// ==========================================
// 9. TABLA publicacion_grua - Campos adicionales
// ==========================================
console.log('\n📋 9. Tabla publicacion_grua:');
agregarColumna('publicacion_grua', 'FechaCreacion', 'TEXT', "CURRENT_TIMESTAMP");
agregarColumna('publicacion_grua', 'FechaModificacion', 'TEXT', "NULL");

// ==========================================
// VERIFICACIÓN FINAL
// ==========================================
console.log('\n' + '═'.repeat(50));
console.log('📊 VERIFICACIÓN DE TABLAS:');
console.log('═'.repeat(50));

const tablas = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
tablas.forEach(t => {
  const cols = db.prepare(`PRAGMA table_info(${t.name})`).all();
  console.log(`\n📋 ${t.name} (${cols.length} columnas)`);
});

db.close();
console.log('\n✅ Corrección completada\n');
