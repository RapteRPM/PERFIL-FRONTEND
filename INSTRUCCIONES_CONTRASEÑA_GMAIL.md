# 📧 Cómo Obtener la Contraseña de Aplicación de Gmail

## 🎯 ¿Qué es una Contraseña de Aplicación?

Una **Contraseña de Aplicación** es una clave especial de 16 caracteres que Gmail genera para permitir que aplicaciones externas (como nuestro sistema RPM Market) envíen correos en tu nombre, sin usar tu contraseña principal de Gmail.

---

## 📝 Requisitos Previos

- ✅ Tener acceso a la cuenta: **rpmservice2026@gmail.com**
- ✅ Tener la contraseña principal de esta cuenta
- ✅ Activar la Verificación en dos pasos (lo haremos en los pasos)

---

## 🚀 Pasos Detallados

### Paso 1: Acceder a tu Cuenta de Google

1. Abre tu navegador web
2. Ve a: **https://myaccount.google.com**
3. Inicia sesión con:
   - Email: **rpmservice2026@gmail.com**
   - Contraseña: (tu contraseña principal)

```
┌─────────────────────────────────────────┐
│  🔐 Iniciar sesión                      │
│  ───────────────────────────────────    │
│  📧 rpmservice2026@gmail.com            │
│  🔑 ••••••••••••••••                    │
│                                         │
│  [  Siguiente  ]                        │
└─────────────────────────────────────────┘
```

---

### Paso 2: Ir a Seguridad

1. En el panel principal de tu cuenta, busca el menú lateral izquierdo
2. Haz clic en **"Seguridad"**

```
Cuenta de Google
├── 🏠 Inicio
├── 📧 Información personal
├── 🔒 Datos y privacidad
├── 🛡️ Seguridad ← AQUÍ
└── ⚙️ Ajustes
```

---

### Paso 3: Activar Verificación en Dos Pasos

⚠️ **IMPORTANTE:** La verificación en dos pasos DEBE estar activada para crear contraseñas de aplicación.

1. En la sección "Seguridad", busca **"Verificación en dos pasos"**
2. Si aparece **"Desactivada"**, haz clic en ella
3. Sigue los pasos para activarla:
   - Google te pedirá tu contraseña nuevamente
   - Elige un método (SMS, app Google Authenticator, etc.)
   - Completa la configuración

```
Cómo accedes a Google
├── Contraseña ••••••••••
├── Verificación en dos pasos
│   └── [Desactivada] → ACTIVAR ESTO
└── Contraseñas de aplicaciones
```

4. Una vez activada, verás: **"Activada ✓"**

---

### Paso 4: Acceder a Contraseñas de Aplicaciones

1. Regresa a la sección **"Seguridad"**
2. Busca **"Contraseñas de aplicaciones"**
   - Si no la ves, asegúrate de que la verificación en dos pasos esté activada
3. Haz clic en **"Contraseñas de aplicaciones"**

```
Verificación en dos pasos: Activada ✓

┌────────────────────────────────────────┐
│ Contraseñas de aplicaciones         >  │
│ Usa contraseñas específicas...         │
└────────────────────────────────────────┘
     ↑
   CLIC AQUÍ
```

---

### Paso 5: Crear Nueva Contraseña de Aplicación

1. Google te pedirá tu contraseña nuevamente (por seguridad)
2. Verás un formulario para crear una nueva contraseña:

```
┌──────────────────────────────────────────────┐
│  Contraseñas de aplicaciones                 │
│  ─────────────────────────────────────────   │
│                                              │
│  Selecciona la app:                          │
│  [ Correo ▾ ]                               │
│                                              │
│  Selecciona el dispositivo:                  │
│  [ Otro (nombre personalizado) ▾ ]          │
│                                              │
│  Nombre del dispositivo:                     │
│  [ RPM Market                        ]      │
│                                              │
│  [  Generar  ]                              │
└──────────────────────────────────────────────┘
```

3. Selecciona:
   - **App:** Correo
   - **Dispositivo:** Otro (nombre personalizado)
   - **Nombre:** Escribe "RPM Market"
4. Haz clic en **"Generar"**

---

### Paso 6: Copiar la Contraseña Generada

Google generará una contraseña de 16 caracteres:

```
┌──────────────────────────────────────────────┐
│  ✅ Contraseña generada                       │
│  ─────────────────────────────────────────   │
│                                              │
│  Tu contraseña de aplicación para            │
│  "RPM Market" es:                            │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │                                    │     │
│  │   abcd efgh ijkl mnop              │     │
│  │                                    │     │
│  └────────────────────────────────────┘     │
│                                              │
│  [  Copiar  ]                  [  Listo  ]  │
│                                              │
│  ⚠️ Esta contraseña solo se mostrará una    │
│     vez. Guárdala en un lugar seguro.       │
└──────────────────────────────────────────────┘
```

⚠️ **MUY IMPORTANTE:**
- Copia TODA la contraseña (los 16 caracteres)
- Copia SIN los espacios (o copia con espacios y luego los quitas)
- Esta contraseña solo se mostrará UNA VEZ
- Si la pierdes, tendrás que generar una nueva

---

### Paso 7: Configurar en el Archivo .env

1. Abre el archivo `.env` en tu editor:
   ```bash
   code .env
   # o
   nano .env
   # o
   vim .env
   ```

2. Busca la línea que dice:
   ```env
   EMAIL_PASS=
   ```

3. Pega la contraseña SIN espacios:
   ```env
   EMAIL_PASS=abcdefghijklmnop
   ```

4. **EJEMPLO COMPLETO del archivo .env:**
   ```env
   # Configuración de Correo
   EMAIL_USER=rpmservice2026@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   
   # Base de Datos
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password_mysql
   DB_NAME=rpm_market
   
   # Otras configuraciones...
   ```

5. Guarda el archivo:
   - VS Code: `Ctrl + S` (Windows/Linux) o `Cmd + S` (Mac)
   - Nano: `Ctrl + X`, luego `Y`, luego `Enter`
   - Vim: `:wq` y `Enter`

---

### Paso 8: Probar el Envío de Correos

Ejecuta el script de prueba:

```bash
node test-email.js
```

**Si todo está correcto, verás:**

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
   - Message ID: <xxxx@gmail.com>
   - Destinatario: rpmservice2026@gmail.com
   - Estado: 250 OK

✨ ¡El sistema de correos está funcionando correctamente!
💡 Revisa tu bandeja de entrada para ver el correo de prueba.
```

---

## ❌ Solución de Errores Comunes

### Error: "Invalid login credentials"

**Problema:** La contraseña es incorrecta o no es una contraseña de aplicación.

**Solución:**
1. Verifica que copiaste la contraseña completa (16 caracteres)
2. Asegúrate de que NO tiene espacios
3. Verifica que usaste una contraseña de aplicación (no tu contraseña normal de Gmail)
4. Si tienes dudas, genera una nueva contraseña de aplicación

---

### Error: "No se ha configurado EMAIL_PASS"

**Problema:** El archivo .env no existe o está vacío.

**Solución:**
1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Abre el archivo y verifica que tiene la línea `EMAIL_PASS=...`
3. Asegúrate de haber guardado el archivo después de editarlo

---

### Error: "Connection timeout"

**Problema:** No se puede conectar al servidor de Gmail.

**Solución:**
1. Verifica tu conexión a internet
2. Algunos firewalls o proxies bloquean el puerto 587
3. Si estás en una red corporativa, consulta con IT

---

### Error: "454 Too many login attempts"

**Problema:** Gmail bloqueó temporalmente el acceso por muchos intentos fallidos.

**Solución:**
1. Espera 15-30 minutos antes de intentar nuevamente
2. Verifica que la contraseña sea correcta antes de reintentar
3. No ejecutes el script de prueba muchas veces seguidas

---

## 🔒 Seguridad

### ✅ Buenas Prácticas

- ✅ Usa contraseñas de aplicación, NO tu contraseña principal
- ✅ NUNCA compartas tu contraseña de aplicación
- ✅ NO subas el archivo `.env` a Git
- ✅ Revoca contraseñas de aplicación que no uses
- ✅ Cambia las contraseñas regularmente

### ❌ NO HAGAS ESTO

- ❌ NO uses tu contraseña principal de Gmail en el código
- ❌ NO compartas el archivo `.env` con nadie
- ❌ NO subas `.env` a repositorios públicos
- ❌ NO dejes contraseñas en comentarios del código
- ❌ NO uses la misma contraseña para todo

---

## 📱 Gestionar Contraseñas de Aplicación

### Ver tus contraseñas activas:

1. Ve a: https://myaccount.google.com/apppasswords
2. Verás una lista de todas las contraseñas de aplicación activas
3. Puedes revocar las que no uses

```
┌────────────────────────────────────────┐
│  Contraseñas de aplicaciones activas   │
│  ────────────────────────────────────  │
│                                        │
│  ✉️ RPM Market                         │
│  Creada: Ene 7, 2026                   │
│  [  Revocar  ]                         │
│                                        │
│  + Crear nueva contraseña              │
└────────────────────────────────────────┘
```

### Revocar una contraseña:

Si tu contraseña se comprometió o ya no la necesitas:

1. Haz clic en **"Revocar"** junto a la contraseña
2. Google deshabilitará esa contraseña inmediatamente
3. Cualquier aplicación que la use dejará de funcionar
4. Crea una nueva si la necesitas

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas con la configuración:

- 📧 Email: rpmservice2026@gmail.com
- 📞 Teléfono: 301 403 8181
- 📚 Documentación: GUIA_CONFIGURACION_CORREOS.md

---

## 🎓 Recursos Adicionales

- [Contraseñas de aplicación de Google (Oficial)](https://support.google.com/accounts/answer/185833)
- [Verificación en dos pasos de Google](https://support.google.com/accounts/answer/185839)
- [Nodemailer Documentation](https://nodemailer.com/)

---

**Última actualización:** Enero 7, 2026
