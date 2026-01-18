# 📧 Guía de Configuración del Sistema de Correos - RPM Market

## ✅ Cambios Realizados

Se ha actualizado el sistema de correos para usar **Gmail** como servicio de envío:

### 📁 Archivos Modificados

1. **controllers/enviarCorreo.js**
   - ✅ Cambiado de Outlook a Gmail (smtp.gmail.com)
   - ✅ Puerto 587 con TLS
   - ✅ Correo predeterminado: rpmservice2026@gmail.com

2. **33 archivos HTML actualizados** con el nuevo correo de contacto:
   - ✅ Todas las páginas de Administrador
   - ✅ Todas las páginas de Comerciante
   - ✅ Todas las páginas de Usuario Natural
   - ✅ Todas las páginas de Prestador de Servicios
   - ✅ Páginas generales (index, registro, ayuda, etc.)
   - ✅ Server.js (plantillas de correo)

---

## 🔧 Configuración Requerida

### Paso 1: Crear Contraseña de Aplicación en Gmail

Para que Gmail permita el envío de correos desde la aplicación, necesitas crear una **Contraseña de Aplicación**:

1. Ve a tu cuenta de Google: https://myaccount.google.com
2. En el menú lateral, selecciona **Seguridad**
3. Activa la **Verificación en dos pasos** (si no está activada)
4. Busca **Contraseñas de aplicaciones**
5. Genera una nueva contraseña:
   - Selecciona: "Correo"
   - Dispositivo: "Otro (nombre personalizado)" → escribe "RPM Market"
6. Google generará una contraseña de 16 caracteres
7. Copia esta contraseña (sin espacios)

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
EMAIL_USER=rpmservice2026@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion_de_16_caracteres
```

**Ejemplo:**
```env
EMAIL_USER=rpmservice2026@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # (sin espacios en la realidad)
```

---

## 🧪 Probar el Envío de Correos

Una vez configuradas las variables de entorno, ejecuta el script de prueba:

```bash
node test-email.js
```

### Resultados Esperados:

✅ **Prueba Exitosa:**
```
🧪 Iniciando prueba de envío de correos...
📧 Configuración:
   - Servidor: smtp.gmail.com
   - Puerto: 587
   - Usuario: rpmservice2026@gmail.com
   - Contraseña configurada: ✅ Sí

🔍 Verificando conexión con el servidor SMTP...
✅ Conexión exitosa con el servidor SMTP

📨 Enviando correo de prueba...
✅ Correo enviado exitosamente!

📋 Detalles del envío:
   - Message ID: <xxxxx@gmail.com>
   - Destinatario: rpmservice2026@gmail.com
   - Estado: 250 OK
```

❌ **Errores Comunes:**

1. **"Invalid login"** → La contraseña de aplicación es incorrecta
2. **"No se ha configurado EMAIL_PASS"** → Falta el archivo .env
3. **"Connection timeout"** → Problema de conexión a internet
4. **"454 Too many login attempts"** → Gmail bloqueó temporalmente el acceso

---

## 📤 Funciones de Envío de Correo en el Sistema

El sistema envía correos en los siguientes casos:

### 1. **Recuperación de Contraseña** (`POST /api/recuperar-contrasena`)
```javascript
// Envía un token de 6 dígitos para recuperar la contraseña
Subject: "Recuperación de Contraseña - RPM Market"
```

### 2. **Cambio de Contraseña** (`POST /api/cambiar-contrasena`)
```javascript
// Notifica al usuario que su contraseña fue cambiada
Subject: "Contraseña Actualizada - RPM Market"
```

### 3. **Respuesta a PQR** (`POST /api/responder-pqr/:id`)
```javascript
// Envía la respuesta del administrador al usuario
Subject: "Respuesta a tu solicitud - RPM Market"
```

### 4. **Cambio de Fecha de Cita** (Comerciantes)
```javascript
// Notifica al cliente sobre un cambio de fecha
Subject: "Cambio de Fecha en tu Cita - RPM Market"
```

### 5. **Registro de Usuario** (Pendiente de activación)
```javascript
// Correo de bienvenida y confirmación
Subject: "¡Bienvenido a RPM Market!"
```

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE:

1. **NUNCA** subas el archivo `.env` a Git
2. El archivo `.gitignore` debe incluir: `.env`
3. Usa `.env.example` como plantilla sin datos reales
4. Cambia la contraseña de aplicación regularmente
5. Si la contraseña se compromete, revoca el acceso inmediatamente

### Verificar .gitignore:

```bash
# Asegúrate de que .gitignore contiene:
.env
node_modules/
```

---

## 📊 Límites de Gmail

Gmail tiene límites de envío para cuentas gratuitas:

- **500 correos por día** (cuentas Gmail normales)
- **2000 correos por día** (cuentas Google Workspace)
- **100 destinatarios por correo**

Para un marketplace, estos límites deberían ser suficientes. Si necesitas más, considera:
- Google Workspace
- SendGrid
- AWS SES
- Mailgun

---

## 🛠️ Solución de Problemas

### Problema: "Invalid login credentials"
**Solución:**
1. Verifica que hayas creado una contraseña de aplicación (no la contraseña normal)
2. Asegúrate de que la verificación en dos pasos esté activada
3. Revisa que copiaste la contraseña completa sin espacios

### Problema: "Connection timeout"
**Solución:**
1. Verifica tu conexión a internet
2. Algunos firewalls bloquean el puerto 587
3. Intenta con el puerto 465 (SSL)

### Problema: No llegan los correos
**Solución:**
1. Revisa la carpeta de Spam
2. Verifica que el correo destino sea válido
3. Revisa los logs del servidor

---

## 📝 Testing Manual

Para probar cada función de correo manualmente:

### 1. Recuperar Contraseña:
```bash
curl -X POST http://localhost:3000/api/recuperar-contrasena \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com"}'
```

### 2. Verificar Token:
```bash
curl -X POST http://localhost:3000/api/verificar-token \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com", "token": "123456"}'
```

### 3. Cambiar Contraseña:
```bash
curl -X POST http://localhost:3000/api/cambiar-contrasena \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com", "nuevaContrasena": "NuevaPass123"}'
```

---

## 📧 Correo Actualizado en Toda la Página

El correo **rpmservice2026@gmail.com** ahora aparece en:

- Pies de página de todas las páginas HTML
- Sistema de contacto y ayuda
- Notificaciones automáticas
- Plantillas de correo del servidor

---

## ✨ Próximos Pasos

1. ✅ Crear archivo `.env` con las credenciales
2. ✅ Ejecutar `node test-email.js` para verificar
3. ✅ Probar recuperación de contraseña en el sistema
4. ✅ Probar respuesta a PQR
5. ✅ Monitorear los logs de envío

---

## 📞 Contacto de Soporte

Si tienes problemas con la configuración:
- 📧 Email: rpmservice2026@gmail.com
- 📞 Teléfono: 301 403 8181

---

**Última actualización:** Enero 7, 2026
**Versión:** 2.0
