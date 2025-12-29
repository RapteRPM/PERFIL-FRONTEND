import pool from '../config/db.js';

async function migrar() {
  console.log('🔄 Ejecutando migración: Agregar campos de notificación de cambio de fecha...');
  
  try {
    // Intentar agregar la columna FechaModificadaPor
    try {
      await pool.query(`
        ALTER TABLE controlagendaservicios 
        ADD COLUMN FechaModificadaPor DATETIME DEFAULT NULL
      `);
      console.log('✅ Columna FechaModificadaPor agregada');
    } catch (err) {
      if (err.message.includes('duplicate column') || err.message.includes('Duplicate column')) {
        console.log('⚠️ Columna FechaModificadaPor ya existe');
      } else {
        throw err;
      }
    }
    
    // Intentar agregar la columna NotificacionVista
    try {
      await pool.query(`
        ALTER TABLE controlagendaservicios 
        ADD COLUMN NotificacionVista BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Columna NotificacionVista agregada');
    } catch (err) {
      if (err.message.includes('duplicate column') || err.message.includes('Duplicate column')) {
        console.log('⚠️ Columna NotificacionVista ya existe');
      } else {
        throw err;
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

migrar();
