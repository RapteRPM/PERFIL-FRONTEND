// controllers/enviarCorreo.js
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const enviarCorreo = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Servidor SMTP de Gmail
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER || "rpmservice2026@gmail.com",
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

export default enviarCorreo;
