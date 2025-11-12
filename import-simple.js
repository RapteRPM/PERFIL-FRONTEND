import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'shortline.proxy.rlwy.net',
  port: 10158,
  user: 'root',
  password: 'nhXnxcTkSvzpoQHQWgMPcDiIyDYXLxJq',
  database: 'railway'
});

console.log('✅ Conectado a Railway MySQL');

try {
  // 1. Insertar usuarios
  console.log('📦 Insertando usuarios...');
  await connection.query(`INSERT INTO usuario (IdUsuario,TipoUsuario,Nombre,Apellido,Documento,Telefono,Correo,FotoPerfil) VALUES(1001092582,'Natural','David','Duarte','1001092582','3014038181','sebastianduarte-25@outlook.com','imagen/Natural/1001092582/1762835266597_398492.png')`);
  await connection.query(`INSERT INTO usuario (IdUsuario,TipoUsuario,Nombre,Apellido,Documento,Telefono,Correo,FotoPerfil) VALUES(1019138679,'Comerciante','Carlos','Rojas','1019138679','3204586589','carlos@gmail.com','imagen/Comerciante/1019138679/1762909829670_990922.jpg')`);
  await connection.query(`INSERT INTO usuario (IdUsuario,TipoUsuario,Nombre,Apellido,Documento,Telefono,Correo,FotoPerfil) VALUES(52343847,'PrestadorServicio','Liliana','pineda','52343847','3176942129','lili@gmail.com','imagen/PrestadorServicios/52343847/1762910023230_175012.jpg')`);
  await connection.query(`INSERT INTO usuario (IdUsuario,TipoUsuario,Nombre,Apellido,Documento,Telefono,Correo,FotoPerfil) VALUES(999999999,'Comerciante','Admin','RPM','1000000000','3014038181','admin@rpm.com','default.png')`);
  console.log('✅ 4 usuarios insertados');

  // 2. Insertar credenciales
  console.log('📦 Insertando credenciales...');
  await connection.query(`INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena) VALUES(1001092582,'1001092582','$2b$10$J7FGShRW5/0wSuJtWvNnquZHYogSUafltoOhbyNYgRrOfvQ8CrioC')`);
  await connection.query(`INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena) VALUES(1019138679,'1019138679','$2b$10$pEvggtN4mtrhirpR8mMkFeXTBXMeuTT7A7ewXFyi6DDA2kxK2jfcm')`);
  await connection.query(`INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena) VALUES(52343847,'52343847','$2b$10$4CjtLPBQj8QIQ23/s0vD.uV.lIY.95Pt2OUyTfc5fVIytHYJKOdI.')`);
  await connection.query(`INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena) VALUES(999999999,'admin@rpm.com','$2b$10$pEvggtN4mtrhirpR8mMkFeXTBXMeuTT7A7ewXFyi6DDA2kxK2jfcm')`);
  console.log('✅ 4 credenciales insertadas');

  // 3. Insertar perfil natural
  console.log('📦 Insertando perfil natural...');
  await connection.query(`INSERT INTO perfilnatural VALUES(1001092582,'Cra 152 # 139-35','Santa rita')`);
  console.log('✅ 1 perfil natural insertado');

  // 4. Insertar comerciante
  console.log('📦 Insertando comerciante...');
  await connection.query(`INSERT INTO comerciante VALUES(234567890,1019138679,'RPM MOTOS','Carrera 152#139- 30',4.74740010000000012,-74.1244525000000038,'Santa rita','@RPMMOTOS','Lunes - Viernes','11:53','23:53')`);
  console.log('✅ 1 comerciante insertado');

  // 5. Insertar prestador de servicio
  console.log('📦 Insertando prestador...');
  await connection.query(`INSERT INTO prestadorservicio VALUES(1,52343847,'calle 139 # 145 - 35','Santa rita','@RPMMOTOS','imagen/PrestadorServicios/52343847/1762839754958_351529.pdf','Lunes - Viernes','00:42','12:42')`);
  console.log('✅ 1 prestador insertado');

  // 6. Insertar publicaciones
  console.log('📦 Insertando publicaciones...');
  await connection.query(`INSERT INTO publicacion (IdPublicacion, Comerciante, NombreProducto, Descripcion, Categoria, Precio, Stock, ImagenProducto) VALUES(2,234567890,'CHAQUETA REFLECTIVA','CHAQUETAS REFLECTIVAS Y APRUEBA DE BALAS',1,89000.0,50,'["imagen/Comerciante/1019138679/publicaciones/2/1762836930717-411100184.png"]')`);
  await connection.query(`INSERT INTO publicacion (IdPublicacion, Comerciante, NombreProducto, Descripcion, Categoria, Precio, Stock, ImagenProducto) VALUES(3,234567890,'CASCO REDBULL','CASCO PARA QUE CAMBIE ESE CACHARRO',1,156000.0,10,'["imagen/Comerciante/1019138679/publicaciones/3/1762836962072-46391501.png"]')`);
  await connection.query(`INSERT INTO publicacion (IdPublicacion, Comerciante, NombreProducto, Descripcion, Categoria, Precio, Stock, ImagenProducto) VALUES(4,234567890,'REVISION TECNO MECANICA','REVISION PARA TODO TIPO DE MOTO',3,219000.0,1,'["imagen/Comerciante/1019138679/publicaciones/4/1762836990964-201135565.png"]')`);
  await connection.query(`INSERT INTO publicacion (IdPublicacion, Comerciante, NombreProducto, Descripcion, Categoria, Precio, Stock, ImagenProducto) VALUES(5,234567890,'MANTENIMIENTO GENERAL DE MOTOS','MATENIMIENTO DE MOTOS, SE LA DEJAMOS COMO NUEVA',3,200000.0,1,'["imagen/Comerciante/1019138679/publicaciones/5/1762837028133-111515409.jpg"]')`);
  console.log('✅ 4 publicaciones insertadas');

  // 7. Insertar publicaciones de grúa
  console.log('📦 Insertando publicaciones de grúa...');
  await connection.query(`INSERT INTO publicaciongrua VALUES(1,1,'LA MEJOR GRUA Y RAPIDA',50000.0,'BOGOTA','["imagen/PrestadorServicios/52343847/publicaciones/1/1762839834263-326815299.png"]','GRUA 24/07')`);
  await connection.query(`INSERT INTO publicaciongrua VALUES(3,1,'LAS MEJORES',82000.0,'KENNEDY','["imagen/PrestadorServicios/52343847/publicaciones/3/1762840166647-663581090.png"]','GRUAS A TODO')`);
  await connection.query(`INSERT INTO publicaciongrua VALUES(4,1,'GRUAS 24/7',25000.0,'BOGOTA','["imagen/PrestadorServicios/52343847/publicaciones/4/1762968718900-916373545.png"]','GRUAS A DOS MIL')`);
  await connection.query(`INSERT INTO publicaciongrua VALUES(5,1,'HOLA',100000.0,'SUBA','["imagen/PrestadorServicios/52343847/publicaciones/5/1762969163258-650762881.png"]','GRUAAAAA')`);
  console.log('✅ 4 publicaciones de grúa insertadas');

  console.log('\n🎉 Importación completada exitosamente!');

  // Verificar
  const [usuarios] = await connection.query('SELECT COUNT(*) as total FROM usuario');
  const [publicaciones] = await connection.query('SELECT COUNT(*) as total FROM publicacion');
  const [gruas] = await connection.query('SELECT COUNT(*) as total FROM publicaciongrua');

  console.log('\n📊 Datos en Railway:');
  console.log(`   Usuarios: ${usuarios[0].total}`);
  console.log(`   Publicaciones: ${publicaciones[0].total}`);
  console.log(`   Grúas: ${gruas[0].total}`);

} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await connection.end();
}
