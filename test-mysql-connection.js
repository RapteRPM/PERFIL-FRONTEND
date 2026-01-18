import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('🔍 Probando conexión a MySQL Railway...');
  
  try {
    const conn = await mysql.createConnection({
      host: 'shortline.proxy.rlwy.net',
      port: 10158,
      user: 'root',
      password: 'nhXnxcTkSvzpoQHQWgMPcDiIyDYXLxJq',
      database: 'railway',
      connectTimeout: 10000
    });
    
    console.log('✅ Conexión exitosa!');
    
    const [usuarios] = await conn.query('SELECT COUNT(*) as total FROM usuario');
    console.log('📊 Total usuarios:', usuarios[0].total);
    
    const [admin] = await conn.query("SELECT * FROM credenciales WHERE NombreUsuario = 'admin@rpm.com'");
    console.log('👤 Admin existe:', admin.length > 0);
    
    if (admin.length > 0) {
      console.log('🔑 Contraseña hash admin:', admin[0].Contrasena?.substring(0, 20) + '...');
    }
    
    await conn.end();
    console.log('✅ Prueba completada');
    
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    console.error('Detalles:', err.code);
  }
}

testConnection();
