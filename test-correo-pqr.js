// Test de envío de correo al responder PQR
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('🧪 Probando envío de correo de respuesta a PQR...\n');

const correoDestino = 'sebastianduarte-25@outlook.com';
const nombreUsuario = 'Sebastián Duarte';
const asuntoPQR = 'Problema con mi pedido';
const descripcionPQR = 'Mi pedido no ha llegado y ya pasó una semana';
const respuestaPQR = 'Estimado usuario, hemos verificado tu pedido y está en proceso de entrega. Llegará en las próximas 48 horas.';

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

async function enviarCorreoPQR() {
  try {
    console.log('📨 Enviando correo de respuesta a PQR...');
    
    const info = await transporter.sendMail({
      from: `"RPM Market" <${process.env.EMAIL_USER || 'rpmservice2026@gmail.com'}>`,
      to: correoDestino,
      subject: `Respuesta a tu Queja: ${asuntoPQR}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-left: 4px solid #667eea; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .badge { display: inline-block; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; background: #dc3545; color: white; }
            .respuesta-box { background: white; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .descripcion-box { background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Hemos Respondido tu Solicitud</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombreUsuario}</strong>,</p>
              <p>Hemos revisado tu <span class="badge">QUEJA</span> y queremos informarte lo siguiente:</p>
              
              <div class="descripcion-box">
                <p><strong>📋 Tu solicitud:</strong></p>
                <p><strong>Asunto:</strong> ${asuntoPQR}</p>
                <p><strong>Descripción:</strong> ${descripcionPQR}</p>
              </div>
              
              <div class="respuesta-box">
                <p><strong>💬 Nuestra respuesta:</strong></p>
                <p>${respuestaPQR}</p>
              </div>
              
              <p>Si tienes alguna pregunta adicional, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
              <p>Atención al Cliente: rpmservice2026@gmail.com</p>
              <p>Teléfono: 301 403 8181</p>
              <p>&copy; 2026 RPM Market - Todos los derechos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Correo enviado exitosamente!');
    console.log('   - Message ID:', info.messageId);
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

enviarCorreoPQR();
