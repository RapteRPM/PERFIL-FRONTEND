#!/bin/bash

# ===============================
# 🔍 Script de Verificación del Backend
# ===============================

echo "🔍 RPM Market - Verificación del Backend"
echo "========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
    else
        echo -e "${RED}❌${NC} $1 (no encontrado)"
        ((errors++))
    fi
}

# Función para verificar carpeta
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
    else
        echo -e "${YELLOW}⚠️${NC}  $1/ (no existe, se creará en runtime)"
        ((warnings++))
    fi
}

echo "📁 Verificando estructura de archivos..."
echo ""

echo "Archivos principales:"
check_file "server.js"
check_file "package.json"
check_file ".env.example"
check_file ".gitignore"
check_file "rpm_market.sql"

echo ""
echo "Configuración:"
check_file "config/db.js"

echo ""
echo "Controladores:"
check_file "controllers/credenciales.js"
check_file "controllers/enviarCorreo.js"

echo ""
echo "Middlewares:"
check_file "middlewares/sesion.js"

echo ""
echo "Rutas:"
check_file "routes/auth.js"
check_file "routes/protected.js"

echo ""
echo "Documentación:"
check_file "README.md"
check_file "README-BACKEND.md"
check_file "SEPARACION-FRONTEND.md"
check_file "GUIA-RAPIDA.md"
check_file "MIGRATION-GUIDE.md"
check_file "FRONTEND-CONFIG-EXAMPLE.js"

echo ""
echo "Scripts:"
check_file "preparar-backend.sh"

echo ""
echo "Carpetas necesarias:"
check_dir "uploads"
check_dir "public/imagen"

echo ""
echo "========================================="

# Verificar .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✅${NC} Archivo .env encontrado"
    
    # Verificar variables importantes
    if grep -q "DB_HOST=" .env && grep -q "DB_USER=" .env; then
        echo -e "${GREEN}✅${NC} Variables de base de datos configuradas"
    else
        echo -e "${RED}❌${NC} Faltan variables de base de datos en .env"
        ((errors++))
    fi
    
    if grep -q "SESSION_SECRET=" .env; then
        echo -e "${GREEN}✅${NC} SESSION_SECRET configurado"
    else
        echo -e "${RED}❌${NC} Falta SESSION_SECRET en .env"
        ((errors++))
    fi
else
    echo -e "${YELLOW}⚠️${NC}  Archivo .env no encontrado"
    echo "   Copia .env.example a .env y configúralo:"
    echo "   cp .env.example .env"
    ((warnings++))
fi

echo ""

# Verificar node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} Dependencias instaladas (node_modules/)"
else
    echo -e "${YELLOW}⚠️${NC}  Dependencias no instaladas"
    echo "   Ejecuta: npm install"
    ((warnings++))
fi

echo ""

# Verificar MySQL
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✅${NC} MySQL instalado"
    
    if [ -f ".env" ]; then
        DB_NAME=$(grep "DB_NAME=" .env | cut -d '=' -f2)
        if [ -n "$DB_NAME" ]; then
            echo "   Base de datos configurada: $DB_NAME"
        fi
    fi
else
    echo -e "${YELLOW}⚠️${NC}  MySQL no encontrado (se usará SQLite en desarrollo)"
    ((warnings++))
fi

echo ""
echo "========================================="
echo ""

# Resumen
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todo listo! El backend está correctamente configurado${NC}"
    echo ""
    echo "Para iniciar el servidor:"
    echo "  npm start"
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Backend parcialmente configurado${NC}"
    echo "   Errores: $errors"
    echo "   Advertencias: $warnings"
    echo ""
    echo "Revisa las advertencias arriba y corrígelas antes de continuar."
else
    echo -e "${RED}❌ Se encontraron $errors errores${NC}"
    echo "   Advertencias: $warnings"
    echo ""
    echo "Corrige los errores antes de iniciar el servidor."
fi

echo ""
echo "📚 Para más información:"
echo "   - README.md: Documentación principal"
echo "   - GUIA-RAPIDA.md: Guía de inicio rápido"
echo "   - SEPARACION-FRONTEND.md: Cómo separar frontend/backend"
echo ""

exit $errors
