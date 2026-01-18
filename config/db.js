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

// Función auxiliar para restaurar datos si la BD está vacía
const restaurarDatosVacios = (db) => {
  try {
    const count = db.prepare('SELECT COUNT(*) as total FROM usuario').get();
    if (count.total === 0) {
      console.log('⚠️  BD vacía. Restaurando datos de prueba...');
      
      // Insertar usuario administrador
      db.prepare(`
        INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
        VALUES (999999999, 'Administrador', 'Administrador', 'Sistema', '999999999', '3000000000', 'admin@rpm.com', 'imagen/imagen_perfil.png', 'Activo')
      `).run();

      db.prepare(`
        INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
        VALUES (999999999, 'admin@rpm.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6')
      `).run();

      // Insertar usuario natural
      db.prepare(`
        INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
        VALUES (123456789, 'Natural', 'Juan', 'Pérez', '123456789', '3001234567', 'juan@test.com', 'imagen/imagen_perfil.png', 'Activo')
      `).run();

      db.prepare(`
        INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
        VALUES (123456789, 'juan@test.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6')
      `).run();

      db.prepare(`
        INSERT INTO perfilnatural (UsuarioNatural, Direccion, Barrio)
        VALUES (123456789, 'Calle 123 #45-67', 'Centro')
      `).run();

      // Insertar usuario comerciante
      db.prepare(`
        INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
        VALUES (987654321, 'Comerciante', 'María', 'González', '987654321', '3009876543', 'maria@test.com', 'imagen/imagen_perfil.png', 'Activo')
      `).run();

      db.prepare(`
        INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
        VALUES (987654321, 'maria@test.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6')
      `).run();

      db.prepare(`
        INSERT INTO comerciante (NitComercio, Comercio, NombreComercio, Direccion, Barrio, DiasAtencion, HoraInicio, HoraFin, Latitud, Longitud)
        VALUES ('900123456', 987654321, 'Repuestos María', 'Avenida 68 #45-12', 'Kennedy', 'Lunes a Sábado', '08:00', '18:00', 4.6097, -74.0817)
      `).run();

      // Insertar usuario prestador inactivo
      db.prepare(`
        INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
        VALUES (555555555, 'PrestadorServicio', 'Carlos', 'Ramírez', '555555555', '3005555555', 'carlos@test.com', 'imagen/imagen_perfil.png', 'Inactivo')
      `).run();

      db.prepare(`
        INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
        VALUES (555555555, 'carlos@test.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6')
      `).run();

      db.prepare(`
        INSERT INTO prestadorservicio (Usuario, Direccion, Barrio, Certificado, DiasAtencion, HoraInicio, HoraFin)
        VALUES (555555555, 'Calle 80 #10-20', 'Suba', 'imagen/certificado.pdf', 'Todos los días', '00:00', '23:59')
      `).run();

      console.log('✅ Datos de prueba restaurados');
    }
  } catch (err) {
    console.warn('⚠️ No se pudo restaurar datos:', err.message);
  }
};

// Intentar conectar a MySQL primero
try {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'root',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'rpm_market',
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
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
          // Ignorar errores comunes de inicialización
          if (!execErr.message.includes('already exists') && 
              !execErr.message.includes('UNIQUE constraint failed')) {
            console.warn('⚠️ Error en statement SQL:', execErr.message);
          }
        }
      }
    });
    
    console.log('✅ Esquema SQLite inicializado desde rpm_market.sql');
    
    // Restaurar datos si la BD está vacía
    restaurarDatosVacios(sqliteDb);
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
