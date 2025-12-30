-- ===============================
-- Script de Datos de Prueba
-- ===============================
-- Este script inserta usuarios de prueba en la base de datos
-- IMPORTANTE: Todas las contraseñas son "123456"

-- 1. Usuario Administrador
INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
VALUES (999999999, 'Administrador', 'Administrador', 'Sistema', '999999999', '3000000000', 'admin@rpm.com', 'imagen/imagen_perfil.png', 'Activo');

INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
VALUES (999999999, 'admin@rpm.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6');

-- 2. Usuario Natural Activo
INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
VALUES (123456789, 'Natural', 'Juan', 'Pérez', '123456789', '3001234567', 'juan@test.com', 'imagen/imagen_perfil.png', 'Activo');

INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
VALUES (123456789, 'juan@test.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6');

INSERT INTO perfilnatural (UsuarioNatural, Direccion, Barrio)
VALUES (123456789, 'Calle 123 #45-67', 'Centro');

-- 3. Usuario Comerciante Activo
INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
VALUES (987654321, 'Comerciante', 'María', 'González', '987654321', '3009876543', 'maria@test.com', 'imagen/imagen_perfil.png', 'Activo');

INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
VALUES (987654321, 'maria@test.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6');

INSERT INTO comerciante (NitComercio, Comercio, NombreComercio, Direccion, Barrio, DiasAtencion, HoraInicio, HoraFin, Latitud, Longitud)
VALUES ('900123456', 987654321, 'Repuestos María', 'Avenida 68 #45-12', 'Kennedy', 'Lunes a Sábado', '08:00', '18:00', 4.6097, -74.0817);

-- 4. Usuario Prestador de Servicio Inactivo (para probar aprobación)
INSERT INTO usuario (IdUsuario, TipoUsuario, Nombre, Apellido, Documento, Telefono, Correo, FotoPerfil, Estado)
VALUES (555555555, 'PrestadorServicio', 'Carlos', 'Ramírez', '555555555', '3005555555', 'carlos@test.com', 'imagen/imagen_perfil.png', 'Inactivo');

INSERT INTO credenciales (Usuario, NombreUsuario, Contrasena)
VALUES (555555555, 'carlos@test.com', '$2b$10$Auy9be68AJYCQq9KVKUYOOsPX7/0LbPwr9lN1Ewc1w0t/B1j5B/g6');

INSERT INTO prestadorservicio (Usuario, Direccion, Barrio, Certificado, DiasAtencion, HoraInicio, HoraFin)
VALUES (555555555, 'Calle 80 #10-20', 'Suba', 'imagen/certificado.pdf', 'Todos los días', '00:00', '23:59');

-- 5. Publicación de ejemplo
INSERT INTO publicacion (
    IdPublicacion, Comercio, Categoria, NombrePublicacion, PrecioVenta, 
    Descripcion, Imagen, Estado, FechaCreacion
) VALUES (
    1, 987654321, 1, 'Filtro de Aceite', 25000, 
    'Filtro de aceite para motor', 'imagen/producto.jpg', 'Disponible', CURRENT_TIMESTAMP
);

-- Verificar datos insertados
SELECT 'Usuarios creados:' as Resumen;
SELECT IdUsuario, TipoUsuario, Nombre, Estado FROM usuario;

SELECT 'Credenciales creadas:' as Resumen;
SELECT Usuario, NombreUsuario FROM credenciales;
