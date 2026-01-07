#!/bin/bash

# ═══════════════════════════════════════════════════════
# 🔍 Verificador de Estado - Sistema de Correos RPM Market
# ═══════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🔍 Verificación del Sistema de Correos               ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Contadores
OK=0
WARN=0
ERROR=0

# Función para mostrar estado
check() {
    if [ $2 -eq 0 ]; then
        echo "✅ $1"
        ((OK++))
    elif [ $2 -eq 1 ]; then
        echo "⚠️  $1"
        ((WARN++))
    else
        echo "❌ $1"
        ((ERROR++))
    fi
}

echo "📋 Verificando configuración..."
echo ""

# 1. Verificar archivo .env
if [ -f .env ]; then
    check "Archivo .env existe" 0
    
    # Verificar EMAIL_USER
    if grep -q "EMAIL_USER=rpmservice2026@gmail.com" .env; then
        check "EMAIL_USER configurado correctamente" 0
    else
        check "EMAIL_USER no está configurado" 2
    fi
    
    # Verificar EMAIL_PASS
    if grep -q "EMAIL_PASS=.\+" .env && ! grep -q "EMAIL_PASS=$" .env && ! grep -q "EMAIL_PASS= *$" .env; then
        check "EMAIL_PASS configurado (no vacío)" 0
    else
        check "EMAIL_PASS está vacío - DEBE CONFIGURARSE" 2
        echo "   💡 Sigue las instrucciones en INSTRUCCIONES_CONTRASEÑA_GMAIL.md"
    fi
else
    check "Archivo .env NO EXISTE" 2
    echo "   💡 Ejecuta: cp .env.example .env"
fi

echo ""

# 2. Verificar .gitignore
if [ -f .gitignore ]; then
    if grep -q "^\.env$" .gitignore; then
        check ".env está en .gitignore (seguridad)" 0
    else
        check ".env NO está en .gitignore - RIESGO DE SEGURIDAD" 2
        echo "   💡 Ejecuta: echo '.env' >> .gitignore"
    fi
else
    check ".gitignore no existe" 1
fi

echo ""

# 3. Verificar dependencias
if [ -f package.json ]; then
    if grep -q '"nodemailer"' package.json; then
        check "nodemailer instalado en package.json" 0
    else
        check "nodemailer NO está en package.json" 2
        echo "   💡 Ejecuta: npm install nodemailer"
    fi
    
    if grep -q '"dotenv"' package.json; then
        check "dotenv instalado en package.json" 0
    else
        check "dotenv NO está en package.json" 2
        echo "   💡 Ejecuta: npm install dotenv"
    fi
else
    check "package.json no existe" 2
fi

echo ""

# 4. Verificar archivos clave
if [ -f controllers/enviarCorreo.js ]; then
    if grep -q "smtp.gmail.com" controllers/enviarCorreo.js; then
        check "Configuración SMTP apunta a Gmail" 0
    else
        check "Configuración SMTP no apunta a Gmail" 2
    fi
else
    check "controllers/enviarCorreo.js no existe" 2
fi

if [ -f test-email.js ]; then
    check "Script de prueba existe" 0
else
    check "Script de prueba no existe" 1
fi

echo ""

# 5. Verificar documentación
docs=0
[ -f GUIA_CONFIGURACION_CORREOS.md ] && ((docs++))
[ -f INSTRUCCIONES_CONTRASEÑA_GMAIL.md ] && ((docs++))
[ -f RESUMEN_ACTUALIZACION_CORREOS.md ] && ((docs++))

if [ $docs -eq 3 ]; then
    check "Documentación completa disponible ($docs/3 archivos)" 0
elif [ $docs -gt 0 ]; then
    check "Documentación parcial ($docs/3 archivos)" 1
else
    check "Documentación no encontrada" 2
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Resumen
TOTAL=$((OK + WARN + ERROR))
echo "📊 RESUMEN:"
echo "   ✅ Correctos: $OK/$TOTAL"
echo "   ⚠️  Advertencias: $WARN/$TOTAL"
echo "   ❌ Errores: $ERROR/$TOTAL"
echo ""

# Estado general
if [ $ERROR -eq 0 ] && [ $WARN -eq 0 ]; then
    echo "🎉 ¡PERFECTO! Todo está configurado correctamente."
    echo ""
    echo "🚀 Siguiente paso:"
    echo "   node test-email.js"
elif [ $ERROR -eq 0 ]; then
    echo "✅ Sistema operativo con advertencias menores."
    echo ""
    echo "🚀 Siguiente paso:"
    echo "   node test-email.js"
elif [ $ERROR -eq 1 ] && grep -q "EMAIL_PASS está vacío" <<< "$OUTPUT" 2>/dev/null; then
    echo "⚠️  Sistema casi listo - Solo falta configurar EMAIL_PASS"
    echo ""
    echo "📝 Siguiente paso:"
    echo "   1. Obtén la contraseña: INSTRUCCIONES_CONTRASEÑA_GMAIL.md"
    echo "   2. Edita: nano .env"
    echo "   3. Prueba: node test-email.js"
else
    echo "❌ Se encontraron errores que deben corregirse."
    echo ""
    echo "📚 Revisa:"
    echo "   - RESUMEN_ACTUALIZACION_CORREOS.md"
    echo "   - GUIA_CONFIGURACION_CORREOS.md"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📚 Documentación: RESUMEN_ACTUALIZACION_CORREOS.md"
echo "🆘 Soporte: rpmservice2026@gmail.com | 301 403 8181"
echo "═══════════════════════════════════════════════════════"
echo ""
