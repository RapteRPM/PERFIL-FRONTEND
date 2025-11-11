import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'rpm_market',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión
try {
  const connection = await pool.getConnection();
  console.log('✅ Conectado a la base de datos con ID ' + connection.threadId);
  connection.release();
} catch (err) {
  console.error('❌ Error conectando a la base de datos:', err);
}

export default pool;
