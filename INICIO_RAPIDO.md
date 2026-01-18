# 🚀 INICIO RÁPIDO - Configuración de Correos

## ⏱️ 5 MINUTOS PARA CONFIGURAR

### Paso 1: Obtener Contraseña (3 min)
1. Abre: https://myaccount.google.com
2. Inicia sesión: **rpmservice2026@gmail.com**
3. Seguridad → Verificación en dos pasos (activar)
4. Contraseñas de aplicaciones → Generar
5. Copiar la contraseña de 16 caracteres

### Paso 2: Configurar (1 min)
```bash
# Editar archivo .env
nano .env
```

Pega la contraseña en:
```
EMAIL_PASS=tu_contraseña_aqui
```

Guardar: `Ctrl+X`, `Y`, `Enter`

### Paso 3: Probar (1 min)
```bash
# Ejecutar prueba
node test-email.js
```

Deberías ver:
```
✅ Conexión exitosa con el servidor SMTP
✅ Correo enviado exitosamente!
```

---

## 🆘 SI TIENES PROBLEMAS

### Error: "Invalid login"
→ La contraseña es incorrecta. Genera una nueva.

### Error: "EMAIL_PASS vacío"
→ No guardaste el archivo .env correctamente.

### Error: "Connection timeout"
→ Revisa tu conexión a internet.

---

## 📚 Documentación Completa

- **Paso a paso detallado:** INSTRUCCIONES_CONTRASEÑA_GMAIL.md
- **Guía técnica completa:** GUIA_CONFIGURACION_CORREOS.md
- **Resumen de cambios:** RESUMEN_ACTUALIZACION_CORREOS.md

---

## 🛠️ Comandos Útiles

```bash
# Verificar estado del sistema
./verificar-estado.sh

# Configuración interactiva
./setup-email.sh

# Probar correos
node test-email.js
```

---

## ✅ LO QUE YA ESTÁ HECHO

- ✅ Configuración cambiada de Outlook a Gmail
- ✅ 33 páginas HTML actualizadas con nuevo correo
- ✅ Sistema de correo funcional
- ✅ Scripts de prueba listos
- ✅ Documentación completa

**Solo falta:** Configurar EMAIL_PASS en .env

---

🎯 **¡Empieza ahora!** → https://myaccount.google.com
