// Script para resetear usuarios y crear admin
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function resetearUsuarios() {
  let connection;
  
  try {
    console.log('\n🔄 Conectando a la base de datos...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'rpm_market',
      multipleStatements: true
    });

    console.log('✅ Conexión establecida\n');

    // Desactivar verificación de claves foráneas temporalmente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Verificación de claves foráneas desactivada\n');

    // Eliminar todos los datos de las tablas relacionadas
    console.log('🗑️  Eliminando datos de todas las tablas...\n');

    const tablas = [
      'tokens_verificacion',
      'centroayuda',
      'opinionesgrua',
      'controlagendaservicios',
      'detalleagenda',
      'controllagenda',
      'opiniones',
      'factura',
      'detallefactura',
      'carrito',
      'publicacion',
      'publicaciongrua',
      'perfilnatural',
      'comerciante',
      'prestadorservicio',
      'credenciales',
      'usuario'
    ];

    for (const tabla of tablas) {
      try {
        await connection.query(`DELETE FROM ${tabla}`);
        console.log(`   ✓ Tabla ${tabla} limpiada`);
      } catch (err) {
        console.log(`   ℹ️  Tabla ${tabla}: ${err.message}`);
      }
    }

    console.log('\n✅ Todas las tablas han sido limpiadas\n');

    // Crear nuevo usuario administrador
    console.log('👤 Creando nuevo usuario administrador...\n');

    const idAdmin = 1001092582;
    const correoAdmin = 'admin@rpm.com';
    const contrasenaAdmin = 'RPM2026*';

    // Hashear la contraseña
    const hashContrasena = await bcrypt.hash(contrasenaAdmin, 10);
    console.log('🔐 Contraseña hasheada correctamente\n');

    // Insertar usuario
    await connection.query(
      `INSERT INTO usuario 
       (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado, ContrasenaCreada) 
       VALUES (?, 'Administrador', 'Administrador', 'RPM', ?, '3014038181', ?, 'imagen/admin.png', 'Activo', 'Si')`,
      [idAdmin, idAdmin.toString(), correoAdmin]
    );
    console.log('   ✓ Usuario administrador creado');

    // Insertar credenciales
    await connection.query(
      `INSERT INTO credenciales 
       (Usuario, NombreUsuario, Contrasena) 
       VALUES (?, ?, ?)`,
      [idAdmin, correoAdmin, hashContrasena]
    );
    console.log('   ✓ Credenciales creadas\n');

    // Reactivar verificación de claves foráneas
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Verificación de claves foráneas reactivada\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ¡PROCESO COMPLETADO EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 CREDENCIALES DEL ADMINISTRADOR:\n');
    console.log('   ID Usuario:  1001092582');
    console.log('   Usuario:     admin@rpm.com');
    console.log('   Contraseña:  RPM2026*');
    console.log('   Tipo:        Administrador');
    console.log('   Estado:      Activo');
    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nDetalles:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

// Ejecutar script
resetearUsuarios();
