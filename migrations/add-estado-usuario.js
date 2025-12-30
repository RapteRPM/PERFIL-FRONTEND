// Migración: Agregar campo Estado a la tabla usuario
// Este campo permite activar/desactivar usuarios desde el panel de administración
// Los comerciantes y prestadores de servicio se crearán inactivos por defecto hasta ser aprobados

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrar() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'rpm_market'
    });

    console.log('✅ Conectado a la base de datos');
    console.log('📝 Agregando campo Estado a tabla usuario...');

    // Verificar si el campo ya existe
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM usuario LIKE 'Estado'"
    );

    if (columns.length > 0) {
      console.log('⚠️ El campo Estado ya existe en la tabla usuario');
      return;
    }

    // Agregar el campo Estado
    await connection.query(`
      ALTER TABLE usuario 
      ADD COLUMN Estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo' 
      AFTER FotoPerfil
    `);

    console.log('✅ Campo Estado agregado correctamente');

    // Actualizar todos los usuarios existentes a Activo (por defecto)
    await connection.query(`
      UPDATE usuario 
      SET Estado = 'Activo' 
      WHERE Estado IS NULL
    `);

    console.log('✅ Usuarios existentes actualizados a Activo');
    console.log('');
    console.log('🎉 Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar migración
migrar()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ La migración falló:', error);
    process.exit(1);
  });
