// Test de envío de correo al registrar usuario
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('🧪 Probando envío de correo de registro...\n');

const correoDestino = 'sebastianduarte-25@outlook.com';
const nombreUsuario = 'Sebastián Duarte';

console.log('📧 Configuración:');
console.log('   - Usuario:', process.env.EMAIL_USER || 'rpmservice2026@gmail.com');
console.log('   - Contraseña configurada:', process.env.EMAIL_PASS ? '✅ Sí' : '❌ No');
console.log('   - Destinatario:', correoDestino);
console.log();

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

async function enviarCorreoRegistro() {
  try {
    console.log('📨 Enviando correo de registro...');
    
    const info = await transporter.sendMail({
      from: `"RPM Market" <${process.env.EMAIL_USER || 'rpmservice2026@gmail.com'}>`,
      to: correoDestino,
      subject: '🔐 Completa tu Registro - Crea tu Contraseña',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Bienvenido a RPM Market!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombreUsuario}</strong>,</p>
              <p>¡Gracias por registrarte! Para activar tu cuenta, necesitas crear tu contraseña.</p>
              <p>Haz clic en el siguiente botón para crear tu contraseña:</p>
              <a href="http://localhost:3000/General/crear-contrasena.html?token=TEST123" class="button">Crear mi Contraseña</a>
              <p><strong>⚠️ Este enlace es válido por 24 horas.</strong></p>
            </div>
            <div class="footer">
              <p>Este correo es automático, por favor no responder.</p>
              <p>&copy; 2026 RPM Market - Todos los derechos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Correo enviado exitosamente!');
    console.log('   - Message ID:', info.messageId);
    console.log('   - Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log();
    console.log('📬 Revisa la bandeja de entrada de:', correoDestino);
    
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    console.error('   - Código:', error.code);
    console.error('   - Respuesta:', error.response);
    
    if (error.code === 'EAUTH') {
      console.log('\n⚠️  Error de autenticación. Verifica:');
      console.log('   1. Que EMAIL_PASS esté correctamente configurado en .env');
      console.log('   2. Que la contraseña de aplicación de Gmail sea válida');
    }
  }
}

enviarCorreoRegistro();
