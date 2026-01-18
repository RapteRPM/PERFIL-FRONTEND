// Generar hash para la contraseña del admin
import bcrypt from 'bcrypt';
import fs from 'fs';

const contrasena = 'RPM2026*';

console.log('\n🔐 Generando hash para la contraseña: RPM2026*\n');

bcrypt.hash(contrasena, 10, (err, hash) => {
  if (err) {
    console.error('❌ Error al generar hash:', err);
    return;
  }

  console.log('✅ Hash generado exitosamente:\n');
  console.log(hash);
  console.log('\n');

  // Leer el archivo SQL
  const sqlPath = './resetear-usuarios.sql';
  let sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Reemplazar el placeholder con el hash real
  sqlContent = sqlContent.replace('$2b$10$PLACEHOLDER_HASH_AQUI', hash);

  // Guardar el archivo actualizado
  fs.writeFileSync(sqlPath, sqlContent);

  console.log('✅ Archivo resetear-usuarios.sql actualizado con el hash correcto\n');
  console.log('📝 Ahora puedes ejecutar el archivo SQL en tu base de datos:\n');
  console.log('   - Opción 1: Desde Railway, importa el archivo resetear-usuarios.sql');
  console.log('   - Opción 2: Ejecuta: mysql -u root -p rpm_market < resetear-usuarios.sql\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('CREDENCIALES DEL ADMINISTRADOR:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Usuario:     admin@rpm.com');
  console.log('Contraseña:  RPM2026*');
  console.log('ID:          1001092582');
  console.log('═══════════════════════════════════════════════════════\n');
});
