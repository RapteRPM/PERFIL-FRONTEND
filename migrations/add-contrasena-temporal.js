// Migración para SQLite: Agregar campo de contraseña temporal
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../rpm_market.db');
const db = new Database(dbPath);

console.log('🔧 Aplicando migración: Contraseña temporal en credenciales\n');

try {
  // Agregar columna ContrasenaTemporal a credenciales
  db.exec(`
    ALTER TABLE credenciales 
    ADD COLUMN ContrasenaTemporal TEXT DEFAULT 'No'
  `);
  console.log('✅ Columna ContrasenaTemporal agregada a credenciales');
} catch (err) {
  if (err.message.includes('duplicate column')) {
    console.log('ℹ️  La columna ya existe');
  } else {
    console.error('❌ Error:', err.message);
  }
}

// Eliminar tabla tokens_verificacion si existe y recrearla sin el campo Usuario duplicado
try {
  db.exec('DROP TABLE IF EXISTS tokens_verificacion');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens_verificacion (
      IdToken INTEGER PRIMARY KEY AUTOINCREMENT,
      Usuario INTEGER NOT NULL,
      Token TEXT NOT NULL UNIQUE,
      TipoToken TEXT NOT NULL,
      FechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      FechaExpiracion TEXT NOT NULL,
      Usado TEXT DEFAULT 'No',
      FOREIGN KEY (Usuario) REFERENCES usuario (IdUsuario) ON DELETE CASCADE
    )
  `);
  console.log('✅ Tabla tokens_verificacion recreada correctamente');
} catch (err) {
  console.error('❌ Error al recrear tokens_verificacion:', err.message);
}

db.close();
console.log('\n✅ Migración completada\n');
