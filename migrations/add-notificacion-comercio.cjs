/**
 * Migración: Agregar campos de notificación de cambio de fecha a controlagendacomercio
 * 
 * Esto permite que cuando un comerciante modifica la fecha de entrega,
 * el usuario natural vea una notificación en su historial de compras.
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'rpm_market.db');

let db;
try {
  db = new Database(dbPath);
  console.log('✅ Conectado a la base de datos SQLite');
} catch (err) {
  console.error('❌ Error al conectar con la base de datos:', err.message);
  process.exit(1);
}

// Función para verificar si una columna existe
function columnExists(tableName, columnName) {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return rows.some(row => row.name === columnName);
}

// Función para agregar columna si no existe
function addColumnIfNotExists(tableName, columnName, columnDef) {
  if (columnExists(tableName, columnName)) {
    console.log(`⚠️ Columna ${columnName} ya existe en ${tableName}`);
    return;
  }

  const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`;
  db.prepare(sql).run();
  console.log(`✅ Columna ${columnName} agregada a ${tableName}`);
}

function runMigration() {
  try {
    console.log('\n🔄 Iniciando migración para notificaciones de comercio...\n');

    // Agregar FechaModificadaPor a controlagendacomercio
    addColumnIfNotExists(
      'controlagendacomercio',
      'FechaModificadaPor',
      'DATETIME DEFAULT NULL'
    );

    // Agregar NotificacionVista a controlagendacomercio
    addColumnIfNotExists(
      'controlagendacomercio',
      'NotificacionVista',
      'INTEGER DEFAULT 1'  // 1 = vista por defecto, 0 = no vista (cuando se modifica)
    );

    console.log('\n✅ Migración completada exitosamente\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    db.close();
    console.log('📤 Conexión a la base de datos cerrada');
  }
}

runMigration();
