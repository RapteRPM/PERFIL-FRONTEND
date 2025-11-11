import bcrypt from 'bcrypt';
import pool from '../config/db.js';

/**
 * 🔐 Crea las credenciales del usuario al registrarlo.
 * @param {string|number} idUsuario - ID del usuario recién creado (la cédula).
 * @param {string} correoDestino - Correo del usuario (solo informativo).
 * @returns {Promise<{usuario: string, token: string}>}
 */
export async function crearCredenciales(idUsuario, correoDestino) {
  try {
    const docStr = String(idUsuario).trim();

    // 🔑 Generar token temporal (8 caracteres aleatorios)
    const generarTokenTemporal = () => {
      const letras = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let token = '';
      for (let i = 0; i < 8; i++) token += letras.charAt(Math.floor(Math.random() * letras.length));
      return token;
    };
    const tokenTemporal = generarTokenTemporal();

    // 🔒 Encriptar token
    const hash = await bcrypt.hash(tokenTemporal, 10);

    // 💾 Insertar credenciales
    const sql = `
      INSERT INTO Credenciales (Usuario, NombreUsuario, Contrasena)
      VALUES (?, ?, ?)
    `;
    await pool.query(sql, [docStr, docStr, hash]);

    console.log(`✅ Credenciales creadas para: ${docStr}`);
    console.log(`🔑 Token temporal generado: ${tokenTemporal}`);

    return { usuario: docStr, token: tokenTemporal };

  } catch (error) {
    console.error('❌ Error al crear credenciales:', error.message);
    throw new Error('Error interno al generar credenciales');
  }
}
