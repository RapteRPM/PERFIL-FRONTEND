// ===============================
// 🧪 Script de Prueba de Envío de Correos
// ===============================
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';

// Configurar __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

import nodemailer from 'nodemailer';

const testEmail = async () => {
  console.log('\n🧪 Iniciando prueba de envío de correos...\n');
  console.log('📧 Configuración:');
  console.log('   - Servidor: smtp.gmail.com');
  console.log('   - Puerto: 587');
  console.log('   - Usuario:', process.env.EMAIL_USER || 'rpmservice2026@gmail.com');
  console.log('   - Contraseña configurada:', process.env.EMAIL_PASS ? '✅ Sí' : '❌ No');
  console.log('');

  // Verificar que las credenciales estén configuradas
  if (!process.env.EMAIL_PASS) {
    console.error('❌ ERROR: No se ha configurado EMAIL_PASS en las variables de entorno');
    console.log('\n💡 Para configurar:');
    console.log('   1. Crea un archivo .env en la raíz del proyecto');
    console.log('   2. Agrega las siguientes líneas:');
    console.log('      EMAIL_USER=rpmservice2026@gmail.com');
    console.log('      EMAIL_PASS=tu_contraseña_de_aplicación_de_gmail');
    console.log('\n📚 Nota: Para Gmail necesitas usar una "Contraseña de aplicación"');
    console.log('   Instrucciones: https://support.google.com/accounts/answer/185833');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "rpmservice2026@gmail.com",
      pass: process.env.EMAIL_PASS
    },
    tls: { 
      rejectUnauthorized: false 
    }
  });

  // Verificar conexión
  try {
    console.log('🔍 Verificando conexión con el servidor SMTP...');
    await transporter.verify();
    console.log('✅ Conexión exitosa con el servidor SMTP\n');
  } catch (error) {
    console.error('❌ Error al conectar con el servidor SMTP:');
    console.error('   ', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verifica que EMAIL_PASS sea una contraseña de aplicación de Gmail');
    console.log('   2. Asegúrate de tener habilitada la verificación en dos pasos');
    console.log('   3. Verifica tu conexión a internet');
    return;
  }

  // Enviar correo de prueba
  try {
    console.log('📨 Enviando correo de prueba...');
    
    const info = await transporter.sendMail({
      from: `"RPM Market - Prueba" <${process.env.EMAIL_USER || 'rpmservice2026@gmail.com'}>`,
      to: process.env.EMAIL_USER || 'rpmservice2026@gmail.com', // Enviar a sí mismo como prueba
      subject: '✅ Prueba de Configuración de Correo - RPM Market',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50; text-align: center;">🎉 ¡Prueba Exitosa!</h1>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              Este es un correo de prueba del sistema de notificaciones de <strong>RPM Market</strong>.
            </p>
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">✅ Configuración Correcta</h3>
              <ul style="color: #1b5e20;">
                <li>Servidor SMTP: Gmail (smtp.gmail.com)</li>
                <li>Correo remitente: rpmservice2026@gmail.com</li>
                <li>Estado: Operativo</li>
              </ul>
            </div>
            <p style="color: #7f8c8d; font-size: 14px; text-align: center; margin-top: 30px;">
              Fecha de prueba: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
            </p>
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
            <p style="color: #95a5a6; font-size: 12px; text-align: center;">
              RPM Market © 2026 - Sistema de Notificaciones
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Correo enviado exitosamente!');
    console.log('\n📋 Detalles del envío:');
    console.log('   - Message ID:', info.messageId);
    console.log('   - Destinatario:', process.env.EMAIL_USER || 'rpmservice2026@gmail.com');
    console.log('   - Estado:', info.response);
    console.log('\n✨ ¡El sistema de correos está funcionando correctamente!');
    console.log('💡 Revisa tu bandeja de entrada para ver el correo de prueba.');
    
  } catch (error) {
    console.error('\n❌ Error al enviar el correo:');
    console.error('   ', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verifica que la contraseña de aplicación sea correcta');
    console.log('   2. Asegúrate de que el correo destino sea válido');
    console.log('   3. Revisa los límites de envío de Gmail');
  }
};

// Ejecutar la prueba
testEmail().catch(console.error);
