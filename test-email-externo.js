// Prueba de envío a correo externo
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const enviarCorreoPrueba = async () => {
  console.log('\n📨 Enviando correo de prueba a davidfelipemh03@gmail.com...\n');

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "rpmservice2026@gmail.com",
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    const info = await transporter.sendMail({
      from: `"RPM Market - Sistema de Notificaciones" <${process.env.EMAIL_USER || 'rpmservice2026@gmail.com'}>`,
      to: 'davidfelipemh03@gmail.com',
      subject: '✅ Prueba de Sistema de Correos - RPM Market',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50; text-align: center;">🎉 ¡Sistema de Correos Operativo!</h1>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              Hola,
            </p>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              Este es un correo de prueba del sistema de notificaciones de <strong>RPM Market</strong>.
            </p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">✅ Sistema Configurado Correctamente</h3>
              <ul style="color: #1b5e20;">
                <li>Correo remitente: rpmservice2026@gmail.com</li>
                <li>Servidor: Gmail SMTP</li>
                <li>Estado: ✅ Operativo</li>
              </ul>
            </div>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              El sistema ahora puede enviar:
            </p>
            
            <ul style="color: #34495e; font-size: 14px; line-height: 1.8;">
              <li>📧 Correos de recuperación de contraseña</li>
              <li>🔔 Notificaciones de cambios importantes</li>
              <li>💬 Respuestas a PQRs</li>
              <li>📅 Confirmaciones de citas y cambios de fecha</li>
              <li>✉️ Comunicaciones con clientes</li>
            </ul>
            
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <p style="margin: 0; color: #e65100;">
                <strong>📌 Nota:</strong> Si recibiste este correo, significa que el sistema de notificaciones de RPM Market está funcionando perfectamente.
              </p>
            </div>
            
            <p style="color: #7f8c8d; font-size: 14px; text-align: center; margin-top: 30px;">
              Fecha de prueba: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
            </p>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
            
            <div style="text-align: center; padding: 20px 0;">
              <p style="color: #95a5a6; font-size: 14px; margin: 5px 0;">
                <strong>RPM Market</strong>
              </p>
              <p style="color: #95a5a6; font-size: 12px; margin: 5px 0;">
                📧 rpmservice2026@gmail.com | 📞 301 403 8181
              </p>
              <p style="color: #95a5a6; font-size: 12px; margin: 5px 0;">
                © 2026 RPM Market - Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      `
    });

    console.log('✅ ¡Correo enviado exitosamente!\n');
    console.log('📋 Detalles del envío:');
    console.log('   - Message ID:', info.messageId);
    console.log('   - Destinatario: davidfelipemh03@gmail.com');
    console.log('   - Estado:', info.response);
    console.log('\n💡 Revisa la bandeja de entrada de davidfelipemh03@gmail.com');
    console.log('   (También revisa la carpeta de Spam por si acaso)\n');
    
  } catch (error) {
    console.error('\n❌ Error al enviar el correo:');
    console.error('   ', error.message);
  }
};

enviarCorreoPrueba().catch(console.error);
