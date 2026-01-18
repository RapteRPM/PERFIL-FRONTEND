import pool from './config/db.js';

async function verificarTablaHistorial() {
  try {
    console.log('🔍 Verificando tabla historial_contrasenas...\n');
    
    // Verificar si la tabla existe
    const [tables] = await pool.query(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='historial_contrasenas'
    `);
    
    if (tables && tables.length > 0) {
      console.log('✅ La tabla historial_contrasenas existe');
      
      // Mostrar estructura
      const [schema] = await pool.query(`
        PRAGMA table_info(historial_contrasenas)
      `);
      
      console.log('\n📋 Estructura de la tabla:');
      schema.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });
      
      // Contar registros
      const [count] = await pool.query(`
        SELECT COUNT(*) as total FROM historial_contrasenas
      `);
      
      console.log(`\n📊 Total de registros: ${count[0].total}`);
      
      // Mostrar algunos registros
      const [records] = await pool.query(`
        SELECT Usuario, SUBSTR(ContrasenaHash, 1, 20) as HashInicio, FechaCambio 
        FROM historial_contrasenas 
        LIMIT 5
      `);
      
      console.log('\n📝 Últimos registros:');
      records.forEach(rec => {
        console.log(`  - Usuario: ${rec.Usuario}, Hash: ${rec.HashInicio}..., Fecha: ${rec.FechaCambio}`);
      });
      
    } else {
      console.log('❌ La tabla historial_contrasenas NO existe');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarTablaHistorial();
