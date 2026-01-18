-- ================================================
-- Script para Resetear Usuarios y Crear Admin
-- ================================================
-- Fecha: 2026-01-07
-- IMPORTANTE: Este script eliminará TODOS los usuarios y datos relacionados

-- Desactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- ELIMINAR DATOS DE TODAS LAS TABLAS
-- ================================================

-- Tablas relacionadas con tokens y verificación
DELETE FROM tokens_verificacion;
ALTER TABLE tokens_verificacion AUTO_INCREMENT = 1;

-- Tablas de centro de ayuda y opiniones
DELETE FROM centroayuda;
ALTER TABLE centroayuda AUTO_INCREMENT = 1;

DELETE FROM opinionesgrua;
ALTER TABLE opinionesgrua AUTO_INCREMENT = 1;

DELETE FROM opiniones;
ALTER TABLE opiniones AUTO_INCREMENT = 1;

-- Tablas de servicios y agenda
DELETE FROM controlagendaservicios;
ALTER TABLE controlagendaservicios AUTO_INCREMENT = 1;

DELETE FROM detalleagenda;
DELETE FROM controllagenda;
ALTER TABLE controllagenda AUTO_INCREMENT = 1;

-- Tablas de ventas y facturas
DELETE FROM detallefactura;
DELETE FROM factura;
ALTER TABLE factura AUTO_INCREMENT = 1;

DELETE FROM carrito;
ALTER TABLE carrito AUTO_INCREMENT = 1;

-- Tablas de publicaciones
DELETE FROM publicacion;
ALTER TABLE publicacion AUTO_INCREMENT = 1;

DELETE FROM publicaciongrua;
ALTER TABLE publicaciongrua AUTO_INCREMENT = 1;

-- Tablas de perfiles
DELETE FROM perfilnatural;
DELETE FROM comerciante;
DELETE FROM prestadorservicio;

-- Credenciales y usuarios
DELETE FROM credenciales;
ALTER TABLE credenciales AUTO_INCREMENT = 1;

DELETE FROM usuario;

-- ================================================
-- CREAR NUEVO ADMINISTRADOR
-- ================================================

-- Insertar usuario administrador
-- ID: 1001092582
-- Usuario: admin@rpm.com
-- Contraseña: RPM2026* (hasheada con bcrypt)
INSERT INTO usuario 
  (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado, ContrasenaCreada) 
VALUES 
  (1001092582, 'Administrador', 'Administrador', 'RPM', '1001092582', '3014038181', 'admin@rpm.com', 'imagen/admin.png', 'Activo', 'Si');

-- Insertar credenciales del administrador
-- Contraseña: RPM2026* (hash bcrypt generado)
-- NOTA: El hash puede variar, este es un ejemplo. Deberás generar el hash correcto.
INSERT INTO credenciales 
  (Usuario, NombreUsuario, Contrasena) 
VALUES 
  (1001092582, 'admin@rpm.com', '$2b$10$wjeQNjVCbxCGWkqEAjryp.ox5nhvfysZuqa8LfbUbM4QBnUPX.oSq');

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- VERIFICACIÓN
-- ================================================
SELECT '✅ Script ejecutado. Verificando usuarios...' AS Mensaje;

SELECT 
  u.IdUsuario,
  u.TipoUsuario,
  u.Nombre,
  u.Correo,
  u.Estado,
  u.ContrasenaCreada,
  c.NombreUsuario
FROM usuario u
LEFT JOIN credenciales c ON c.Usuario = u.IdUsuario;

SELECT '================================================' AS Separador;
SELECT 'CREDENCIALES DEL ADMINISTRADOR:' AS Info;
SELECT 'ID Usuario: 1001092582' AS Info;
SELECT 'Usuario: admin@rpm.com' AS Info;
SELECT 'Contraseña: RPM2026*' AS Info;
SELECT 'Tipo: Administrador' AS Info;
SELECT '================================================' AS Separador;
