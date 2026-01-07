-- ================================================
-- Migración: Sistema de Verificación de Contraseña por Correo
-- ================================================
-- Agrega campos necesarios para el nuevo flujo de registro
-- Fecha: 2026-01-07

-- 1. Agregar campo para indicar si el usuario ha creado su contraseña
ALTER TABLE usuario 
ADD COLUMN ContrasenaCreada ENUM('Si','No') DEFAULT 'No';

-- 2. Crear tabla para tokens de verificación/creación de contraseña
CREATE TABLE IF NOT EXISTS tokens_verificacion (
  IdToken INT PRIMARY KEY AUTO_INCREMENT,
  Usuario INT NOT NULL,
  Token VARCHAR(100) NOT NULL UNIQUE,
  TipoToken ENUM('CrearContrasena','RecuperarContrasena') NOT NULL,
  FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FechaExpiracion DATETIME NOT NULL,
  Usado ENUM('Si','No') DEFAULT 'No',
  CONSTRAINT fk_token_usuario FOREIGN KEY (Usuario) REFERENCES usuario (IdUsuario) ON DELETE CASCADE,
  INDEX idx_token (Token),
  INDEX idx_usuario_tipo (Usuario, TipoToken),
  INDEX idx_expiracion (FechaExpiracion)
);

-- 3. Actualizar usuarios existentes para que tengan contraseña creada
-- (solo los que ya tienen credenciales)
UPDATE usuario u
SET ContrasenaCreada = 'Si'
WHERE EXISTS (
  SELECT 1 FROM credenciales c WHERE c.Usuario = u.IdUsuario
);

-- 4. Los usuarios sin credenciales quedan con ContrasenaCreada = 'No'
-- y estarán bloqueados hasta que creen su contraseña

SELECT 'Migración completada exitosamente' AS Resultado;
