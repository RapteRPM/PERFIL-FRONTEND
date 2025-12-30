-- ===============================
-- Migración: Agregar campo Estado a tabla usuario
-- ===============================
-- Este script agrega el campo Estado para permitir activar/desactivar usuarios
-- Los comerciantes y prestadores de servicio se crearán inactivos por defecto

-- 1. Agregar el campo Estado a la tabla usuario
ALTER TABLE usuario 
ADD COLUMN Estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo' 
AFTER FotoPerfil;

-- 2. Actualizar todos los usuarios existentes a Activo (por defecto)
UPDATE usuario 
SET Estado = 'Activo' 
WHERE Estado IS NULL;

-- Verificar que se agregó correctamente
SELECT 'Estado agregado correctamente' AS Mensaje;
SELECT * FROM usuario LIMIT 5;
