import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let usarSQLite = false;
let sqliteDb = null;
let mysqlPool = null;

// Intentar conectar a MySQL primero
try {
  mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'rpm_market',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const connection = await mysqlPool.getConnection();
  console.log('✅ Conectado a MySQL con ID ' + connection.threadId);
  connection.release();
  usarSQLite = false;
} catch (err) {
  console.warn('⚠️ MySQL no disponible, usando SQLite como fallback');
  usarSQLite = true;
  
  // Crear base de datos SQLite
  const dbPath = path.join(__dirname, '../rpm_market.db');
  sqliteDb = new Database(dbPath);
  
  console.log('✅ Base de datos SQLite creada en:', dbPath);
  
  // Leer y ejecutar el script SQL si la BD está vacía
  try {
    const sqlScript = fs.readFileSync(path.join(__dirname, '../rpm_market.sql'), 'utf-8');
    
    // Adaptar SQL de MySQL a SQLite
    const sqliteScript = sqlScript
      .replace(/INT PRIMARY KEY AUTO_INCREMENT/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
      .replace(/ENUM\([^)]+\)/gi, 'TEXT')
      .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TEXT DEFAULT CURRENT_TIMESTAMP')
      .replace(/TIME/gi, 'TEXT')
      .replace(/DATE/gi, 'TEXT')
      .replace(/DECIMAL\(\d+,\d+\)/gi, 'REAL')
      .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
      .replace(/TEXT,/gi, 'TEXT,')
      .replace(/CONSTRAINT [^\s]+ FOREIGN KEY/gi, 'FOREIGN KEY')
      .replace(/CONSTRAINT [^\s]+ CHECK/gi, 'CHECK');
    
    // Ejecutar statements uno por uno
    const statements = sqliteScript.split(';').filter(s => s.trim());
    statements.forEach(statement => {
      if (statement.trim()) {
        try {
          sqliteDb.exec(statement + ';');
        } catch (execErr) {
          // Ignorar errores de tablas que ya existen
          if (!execErr.message.includes('already exists')) {
            console.warn('⚠️ Error en statement SQL:', execErr.message);
          }
        }
      }
    });
    
    console.log('✅ Esquema SQLite inicializado desde rpm_market.sql');
  } catch (sqlErr) {
    console.error('❌ Error al inicializar esquema SQLite:', sqlErr.message);
  }
}

// Wrapper para hacer compatible la API de MySQL con SQLite
const pool = {
  async query(sql, params = []) {
    if (usarSQLite) {
      try {
        // Convertir placeholders de MySQL (?) a SQLite
        const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
        
        if (isSelect) {
          const stmt = sqliteDb.prepare(sql);
          const rows = stmt.all(...params);
          return [rows, null];
        } else {
          const stmt = sqliteDb.prepare(sql);
          const result = stmt.run(...params);
          return [{
            affectedRows: result.changes,
            insertId: result.lastInsertRowid
          }, null];
        }
      } catch (err) {
        console.error('❌ Error SQLite query:', err.message);
        throw err;
      }
    } else {
      return mysqlPool.query(sql, params);
    }
  },
  
  async getConnection() {
    if (usarSQLite) {
      return {
        query: pool.query,
        release: () => {},
        beginTransaction: () => Promise.resolve(),
        commit: () => Promise.resolve(),
        rollback: () => Promise.resolve()
      };
    } else {
      return mysqlPool.getConnection();
    }
  }
};

export default pool;
