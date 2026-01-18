import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'rpm_market.db'));

console.log('📥 Verificando si la BD necesita datos de prueba...');

// Verificar cuántos usuarios hay
const countUsuarios = db.prepare('SELECT COUNT(*) as total FROM usuario').get();
const countCredenciales = db.prepare('SELECT COUNT(*) as total FROM credenciales').get();

if (countUsuarios.total === 0 || countCredenciales.total === 0) {
  console.log('⚠️  BD vacía detectada. Insertando datos de prueba...');

  try {
    // Insertar usuario administrador
    db.prepare(`
      INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
      VALUES (999999999, 'Administrador', 'Administrador', 'Sistema', '999999999', '3000000000', 'admin@rpm.com', 'imagen/imagen_perfil.png', 'Activo')
    `).run();

    db.prepare(`
      INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
      VALUES (999999999, 'admin@rpm.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6')
    `).run();

    console.log('  ✅ Admin insertado');

    console.log('\n✅ Datos de prueba restaurados exitosamente\n');

    // Mostrar resumen
    console.log('📊 Resumen de datos insertados:');
    const usuarios = db.prepare('SELECT IdUsuario, Nombre, TipoUsuario FROM usuario').all();
    usuarios.forEach(u => console.log(`   - ${u.Nombre} (${u.TipoUsuario})`));

  } catch (error) {
    console.error('❌ Error al insertar datos:', error.message);
    process.exit(1);
  }
} else {
  console.log(`✅ BD con datos. Usuarios: ${countUsuarios.total}, Credenciales: ${countCredenciales.total}`);
}

db.close();
