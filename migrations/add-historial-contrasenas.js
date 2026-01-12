import pool from '../config/db.js';

async function addHistorialContrasenas() {
  try {
    console.log('🔧 Creando tabla historial_contrasenas...');
    
    // Crear tabla de historial de contraseñas (compatible con SQLite y MySQL)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS historial_contrasenas (
        IdHistorial INTEGER PRIMARY KEY AUTOINCREMENT,
        Usuario INT NOT NULL,
        ContrasenaHash VARCHAR(255) NOT NULL,
        FechaCambio DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tabla historial_contrasenas creada correctamente');
    
    // Crear índices
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial_contrasenas(Usuario)
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_contrasenas(FechaCambio)
      `);
      
      console.log('✅ Índices creados correctamente');
    } catch (error) {
      console.log('⚠️ Los índices podrían ya existir');
    }
    
    // Migrar contraseñas actuales al historial
    console.log('📦 Migrando contraseñas existentes al historial...');
    
    const [existingPasswords] = await pool.query(`
      SELECT Usuario, Contrasena FROM credenciales
    `);
    
    for (const row of existingPasswords) {
      // Verificar si ya existe en el historial
      const [existing] = await pool.query(`
        SELECT IdHistorial FROM historial_contrasenas WHERE Usuario = ? AND ContrasenaHash = ?
      `, [row.Usuario, row.Contrasena]);
      
      if (!existing || existing.length === 0) {
        await pool.query(`
          INSERT INTO historial_contrasenas (Usuario, ContrasenaHash)
          VALUES (?, ?)
        `, [row.Usuario, row.Contrasena]);
      }
    }
    
    console.log(`✅ ${existingPasswords.length} contraseñas procesadas en el historial`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

addHistorialContrasenas();
