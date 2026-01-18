/**
 * Script para configurar el usuario admin con la contraseña real (RPM2026*)
 * Usar cuando MySQL no está disponible pero necesitas el admin real en SQLite
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function configurarAdminReal() {
  const dbPath = path.join(__dirname, 'rpm_market.db');
  
  console.log('📂 Abriendo base de datos:', dbPath);
  const db = new Database(dbPath);
  
  // Verificar usuarios existentes
  const usuarios = db.prepare('SELECT IdUsuario, TipoUsuario, Correo, Estado FROM usuario').all();
  console.log('\n📊 Usuarios en la base de datos:');
  console.table(usuarios);
  
  // Verificar credenciales
  const credenciales = db.prepare('SELECT Usuario, NombreUsuario FROM credenciales').all();
  console.log('\n🔑 Credenciales registradas:');
  console.table(credenciales);
  
  // Buscar admin existente
  const adminExistente = db.prepare("SELECT * FROM credenciales WHERE NombreUsuario = 'admin@rpm.com'").get();
  
  if (adminExistente) {
    console.log('\n👤 Admin existente encontrado. Actualizando contraseña...');
    
    // Generar hash de la contraseña real
    const contrasenaReal = 'RPM2026*';
    const hashReal = await bcrypt.hash(contrasenaReal, 10);
    
    // Actualizar
    db.prepare("UPDATE credenciales SET Contrasena = ? WHERE NombreUsuario = 'admin@rpm.com'").run(hashReal);
    
    console.log('✅ Contraseña de admin actualizada a: RPM2026*');
    console.log('🔑 Hash generado:', hashReal);
  } else {
    console.log('\n⚠️ No existe admin. Creando usuario admin...');
    
    // Crear usuario admin
    db.prepare(`
      INSERT OR REPLACE INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
      VALUES (999999999, 'Administrador', 'Administrador', 'Sistema', '999999999', '3000000000', 'admin@rpm.com', 'imagen/imagen_perfil.png', 'Activo')
    `).run();
    
    const hashReal = await bcrypt.hash('RPM2026*', 10);
    
    db.prepare(`
      INSERT OR REPLACE INTO credenciales (Usuario, NombreUsuario, Contrasena)
      VALUES (999999999, 'admin@rpm.com', ?)
    `).run(hashReal);
    
    console.log('✅ Usuario admin creado con contraseña: RPM2026*');
  }
  
  // Verificar el cambio
  const adminActualizado = db.prepare("SELECT NombreUsuario, Contrasena FROM credenciales WHERE NombreUsuario = 'admin@rpm.com'").get();
  console.log('\n✅ Verificación:');
  console.log('   Usuario:', adminActualizado.NombreUsuario);
  console.log('   Hash:', adminActualizado.Contrasena.substring(0, 30) + '...');
  
  // Verificar que el hash es correcto
  const esValido = await bcrypt.compare('RPM2026*', adminActualizado.Contrasena);
  console.log('   ¿Contraseña RPM2026* válida?:', esValido ? '✅ Sí' : '❌ No');
  
  db.close();
  console.log('\n✅ Base de datos cerrada correctamente');
}

configurarAdminReal().catch(console.error);
