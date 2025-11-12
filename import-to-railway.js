import mysql from 'mysql2/promise';
import fs from 'fs';

const connection = await mysql.createConnection({
  host: 'shortline.proxy.rlwy.net',
  port: 10158,
  user: 'root',
  password: 'nhXnxcTkSvzpoQHQWgMPcDiIyDYXLxJq',
  database: 'railway'
});

console.log('✅ Conectado a Railway MySQL');

// Leer archivo SQL
const sqlContent = fs.readFileSync('datos_railway_mysql.sql', 'utf-8');
const statements = sqlContent.split('\n').filter(s => s.trim().length > 0);

console.log(`📦 Ejecutando ${statements.length} INSERTs...`);

let successful = 0;
let failed = 0;

for (const statement of statements) {
  try {
    await connection.query(statement);
    successful++;
    process.stdout.write('.');
  } catch (err) {
    failed++;
    console.error(`\n❌ Error: ${err.message.substring(0, 100)}`);
  }
}

console.log(`\n\n✅ Completado: ${successful} exitosos, ${failed} fallidos`);

// Verificar resultados
const [usuarios] = await connection.query('SELECT COUNT(*) as total FROM usuario');
const [publicaciones] = await connection.query('SELECT COUNT(*) as total FROM publicacion');
const [gruas] = await connection.query('SELECT COUNT(*) as total FROM publicaciongrua');

console.log('\n📊 Datos importados:');
console.log(`   Usuarios: ${usuarios[0].total}`);
console.log(`   Publicaciones: ${publicaciones[0].total}`);
console.log(`   Grúas: ${gruas[0].total}`);

await connection.end();
