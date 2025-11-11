// controllers/enviarCorreo.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const enviarCorreo = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com", // Servidor SMTP de Outlook
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.sendMail({
      from: `"RPMMarket" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📨 Correo enviado correctamente a ${to}`);
  } catch (err) {
    console.warn("⚠️ No se pudo enviar el correo:", err.message);
  }
};

module.exports = enviarCorreo;
