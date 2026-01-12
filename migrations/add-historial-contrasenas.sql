-- Tabla para el historial de contraseñas
CREATE TABLE IF NOT EXISTS historial_contrasenas (
  IdHistorial INT PRIMARY KEY AUTO_INCREMENT,
  Usuario INT NOT NULL,
  ContrasenaHash VARCHAR(255) NOT NULL,
  FechaCambio DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_usuario FOREIGN KEY (Usuario) REFERENCES usuario (IdUsuario)
);

-- Índice para mejorar el rendimiento de las búsquedas
CREATE INDEX idx_historial_usuario ON historial_contrasenas(Usuario);
CREATE INDEX idx_historial_fecha ON historial_contrasenas(FechaCambio);
