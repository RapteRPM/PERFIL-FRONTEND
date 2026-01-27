#!/bin/bash

# ===============================
# 🚀 Script de Preparación del Backend
# ===============================
# Este script prepara el repositorio backend eliminando
# archivos que deben ir al frontend

echo "🚀 RPM Market - Preparación del Backend"
echo "========================================"
echo ""
echo "⚠️  ADVERTENCIA: Este script eliminará archivos HTML, CSS y JS del frontend"
echo "    Asegúrate de haber hecho backup o de tener todo en git antes de continuar"
echo ""
read -p "¿Deseas continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]
then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "📋 Eliminando archivos del frontend..."
echo ""

# Eliminar carpetas de frontend (excepto imagen que el backend la sirve)
if [ -d "public/Administrador" ]; then
    echo "  ❌ Eliminando public/Administrador/"
    rm -rf public/Administrador
fi

if [ -d "public/Comerciante" ]; then
    echo "  ❌ Eliminando public/Comerciante/"
    rm -rf public/Comerciante
fi

if [ -d "public/General" ]; then
    echo "  ❌ Eliminando public/General/"
    rm -rf public/General
fi

if [ -d "public/Natural" ]; then
    echo "  ❌ Eliminando public/Natural/"
    rm -rf public/Natural
fi

if [ -d "public/PrestadorServicios" ]; then
    echo "  ❌ Eliminando public/PrestadorServicios/"
    rm -rf public/PrestadorServicios
fi

if [ -d "public/JS" ]; then
    echo "  ❌ Eliminando public/JS/"
    rm -rf public/JS
fi

if [ -d "public/image" ]; then
    echo "  ❌ Eliminando public/image/"
    rm -rf public/image
fi

if [ -d "public/Publicaciones" ]; then
    echo "  ❌ Eliminando public/Publicaciones/"
    rm -rf public/Publicaciones
fi

# Eliminar archivo de test
if [ -f "test-login.html" ]; then
    echo "  ❌ Eliminando test-login.html"
    rm test-login.html
fi

# Crear carpeta imagen si no existe (necesaria para el backend)
if [ ! -d "public/imagen" ]; then
    echo "  ✅ Creando public/imagen/"
    mkdir -p public/imagen
fi

# Crear estructura de carpetas para imágenes
mkdir -p public/imagen/Comerciante
mkdir -p public/imagen/Natural
mkdir -p public/imagen/PrestadorServicios
mkdir -p public/imagen/temp

# Crear carpeta uploads si no existe
if [ ! -d "uploads" ]; then
    echo "  ✅ Creando uploads/"
    mkdir -p uploads
fi

echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📁 Estructura del backend:"
echo "   ├── config/"
echo "   ├── controllers/"
echo "   ├── middlewares/"
echo "   ├── routes/"
echo "   ├── migrations/"
echo "   ├── public/imagen/     (imágenes servidas por el backend)"
echo "   ├── uploads/           (archivos subidos)"
echo "   ├── server.js"
echo "   ├── package.json"
echo "   ├── .env.example"
echo "   └── .gitignore"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Verifica que tienes el archivo .env configurado"
echo "   2. Ejecuta: npm install"
echo "   3. Importa la BD: mysql -u root -p rpm_market < rpm_market.sql"
echo "   4. Inicia el servidor: npm start"
echo ""
echo "📚 Para más información, lee:"
echo "   - README.md"
echo "   - SEPARACION-FRONTEND.md"
echo ""
