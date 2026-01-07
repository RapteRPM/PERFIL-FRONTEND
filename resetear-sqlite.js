// Resetear usuarios en SQLite local
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetearSQLite() {
  try {
    console.log('\n🔄 Conectando a SQLite local...\n');
    
    const dbPath = path.join(__dirname, 'rpm_market.db');
    const db = new Database(dbPath);
    
    console.log('✅ Conectado a:', dbPath);
    console.log('\n🗑️  Eliminando todos los datos...\n');

    // Eliminar todos los datos
    const tablas = [
      'tokens_verificacion',
      'centroayuda',
      'opinionesgrua',
      'controlagendaservicios',
      'detalleagenda',
      'controllagenda',
      'opiniones',
      'detallefactura',
      'factura',
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
        db.prepare(`DELETE FROM ${tabla}`).run();
        console.log(`   ✓ ${tabla} limpiada`);
      } catch (err) {
        console.log(`   ℹ️  ${tabla}: ${err.message}`);
      }
    }

    console.log('\n👤 Creando nuevo administrador...\n');

    // Datos del admin
    const idAdmin = 1001092582;
    const correoAdmin = 'admin@rpm.com';
    const contrasenaAdmin = 'RPM2026*';
    const hashContrasena = await bcrypt.hash(contrasenaAdmin, 10);

    // Insertar usuario
    db.prepare(`
      INSERT INTO usuario 
      (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      idAdmin,
      'Administrador',
      'Administrador',
      'RPM',
      idAdmin.toString(),
      '3014038181',
      correoAdmin,
      'imagen/admin.png',
      'Activo'
    );
    console.log('   ✓ Usuario administrador creado');

    // Insertar credenciales con ContrasenaTemporal = 'No' (ya tiene contraseña definitiva)
    db.prepare(`
      INSERT INTO credenciales 
      (Usuario, NombreUsuario, Contrasena, ContrasenaTemporal) 
      VALUES (?, ?, ?, 'No')
    `).run(idAdmin, correoAdmin, hashContrasena);
    console.log('   ✓ Credenciales creadas');

    // Verificar
    const usuario = db.prepare(`
      SELECT u.*, c.NombreUsuario, c.ContrasenaTemporal
      FROM usuario u
      LEFT JOIN credenciales c ON c.Usuario = u.IdUsuario
      WHERE u.IdUsuario = ?
    `).get(idAdmin);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ ¡PROCESO COMPLETADO EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 CREDENCIALES DEL ADMINISTRADOR:\n');
    console.log('   ID Usuario:  1001092582');
    console.log('   Usuario:     admin@rpm.com');
    console.log('   Contraseña:  RPM2026*');
    console.log('   Tipo:        Administrador');
    console.log('   Estado:      Activo');
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✅ Usuario verificado en la base de datos:');
    console.log(usuario);
    console.log('\n🚀 Puedes iniciar sesión en: /General/Ingreso.html\n');

    db.close();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

resetearSQLite();
