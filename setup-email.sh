#!/bin/bash

# ===============================
# 🚀 Script de Configuración Inicial
# RPM Market - Sistema de Correos
# ===============================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📧 Configuración del Sistema de Correos - RPM Market          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ No se encontró el archivo .env"
    echo "📝 Creando archivo .env desde plantilla..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo ""
fi

echo "📋 PASOS PARA CONFIGURAR EL CORREO:"
echo ""
echo "1️⃣  Abre tu navegador y ve a: https://myaccount.google.com"
echo "2️⃣  Inicia sesión con: rpmservice2026@gmail.com"
echo "3️⃣  Ve a 'Seguridad' en el menú lateral"
echo "4️⃣  Activa 'Verificación en dos pasos' (si no está activa)"
echo "5️⃣  Busca 'Contraseñas de aplicaciones'"
echo "6️⃣  Genera una nueva contraseña:"
echo "    - Aplicación: Correo"
echo "    - Dispositivo: Otro → 'RPM Market'"
echo "7️⃣  Copia la contraseña de 16 caracteres (sin espacios)"
echo "8️⃣  Edita el archivo .env y pega la contraseña en EMAIL_PASS="
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""

read -p "¿Ya configuraste la contraseña en el archivo .env? (s/n): " configured

if [ "$configured" = "s" ] || [ "$configured" = "S" ]; then
    echo ""
    echo "🧪 Ejecutando prueba de correo..."
    echo ""
    node test-email.js
else
    echo ""
    echo "📝 Por favor:"
    echo "   1. Sigue los pasos anteriores para obtener la contraseña"
    echo "   2. Edita el archivo .env con tu editor favorito:"
    echo "      - VS Code: code .env"
    echo "      - Nano: nano .env"
    echo "      - Vim: vim .env"
    echo "   3. Ejecuta este script nuevamente o ejecuta: node test-email.js"
    echo ""
fi

echo "────────────────────────────────────────────────────────────────"
echo "📚 Documentación completa: GUIA_CONFIGURACION_CORREOS.md"
echo "🔧 Soporte: rpmservice2026@gmail.com | 301 403 8181"
echo "════════════════════════════════════════════════════════════════"
echo ""
