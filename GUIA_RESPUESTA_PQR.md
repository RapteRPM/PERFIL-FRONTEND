# 📋 Guía: Cómo Responder Quejas y Reclamos (PQR)

## 🎯 Funcionalidad Implementada

Se ha implementado un sistema completo para que los administradores puedan responder las PQR (Peticiones, Quejas y Reclamos) de los usuarios y enviarles notificaciones automáticas por correo electrónico.

## 📊 Características

### ✅ Para el Administrador:

1. **Ver todas las PQR** en una tabla con filtros avanzados
2. **Ver detalles completos** de cada solicitud
3. **Responder PQR** con un formulario dedicado
4. **Notificación automática** por correo al usuario
5. **Estado visual** (Pendiente/Respondida)
6. **Historial de respuestas** visible en los detalles

### ✅ Para el Usuario:

1. **Recibe notificación por email** cuando su PQR es respondida
2. **Email profesional** con formato HTML
3. **Incluye**: Su solicitud original + La respuesta del administrador
4. **Información de contacto** de RPM Market

## 📝 Cómo Usar el Sistema

### 1. Acceder al Panel de PQR

1. Inicia sesión como administrador:
   - **URL**: `http://localhost:3000/General/Ingreso.html`
   - **Usuario**: `admin@rpm.com`
   - **Contraseña**: `123456`

2. Ve al Panel de Administración:
   - **URL**: `http://localhost:3000/Administrador/panel_admin.html`

3. Haz clic en **"Gestión de PQR"** o ve directamente a:
   - **URL**: `http://localhost:3000/Administrador/gestion_pqr.html`

### 2. Filtrar y Buscar PQR

Puedes filtrar las PQR por:
- **Tipo de Solicitud**: Queja, Reclamo, Sugerencia
- **Rol del Usuario**: Natural, Comerciante, Prestador de Servicio
- **Perfil (Email)**: Buscar por correo electrónico
- **Asunto**: Buscar palabras clave
- **Estado**: Ver solo las respondidas (checkbox)

### 3. Ver Detalles de una PQR

1. Haz clic en el **botón ojo (👁️)** en la columna "Acciones"
2. Se abrirá un modal con:
   - Información del usuario
   - Tipo y fecha de solicitud
   - Asunto y descripción completa
   - Estado (Pendiente/Respondida)
   - Respuesta anterior (si existe)

### 4. Responder una PQR

#### Paso a Paso:

1. **Abre los detalles** de una PQR pendiente
2. Haz clic en el botón **"Responder"** (verde) en la parte inferior del modal
3. Se abrirá un nuevo modal con:
   - Información resumida de la PQR
   - Campo de texto para tu respuesta
4. **Escribe tu respuesta** al usuario
5. Haz clic en **"Enviar Respuesta"**

#### ¿Qué sucede al enviar?

El sistema automáticamente:
1. ✅ Guarda la respuesta en la base de datos
2. ✅ Marca la PQR como "Respondida"
3. ✅ Registra la fecha de respuesta
4. ✅ Envía un email al usuario con:
   - Su solicitud original
   - Tu respuesta
   - Información de contacto de RPM
5. ✅ Actualiza la tabla de PQR

### 5. Ver PQR Respondidas

- Las PQR respondidas tienen un **checkbox marcado** en la columna "Respondida"
- El botón "Responder" **no aparece** en PQR ya respondidas
- Puedes filtrar solo las respondidas con el checkbox "Respondidas" en los filtros

## 📧 Notificación por Correo

### Contenido del Email:

El usuario recibirá un correo con:

```
✅ Hemos Respondido tu Solicitud

Hola [Nombre del Usuario],

Hemos revisado y respondido tu solicitud en el Centro de Ayuda de RPM Market.

📋 Detalles de tu solicitud:
- Tipo: [Queja/Reclamo/Sugerencia]
- Asunto: [El asunto]
- Tu mensaje: [El mensaje original]

💬 Nuestra respuesta:
[Tu respuesta como administrador]

Si tienes más preguntas o inquietudes, no dudes en contactarnos nuevamente.

Gracias por confiar en RPM Market.

---
RPM Market
📧 Email: infoRPM@gmail.com | 📞 Teléfono: 301 403 8181
```

### Configuración del Correo:

El sistema usa **nodemailer** con Outlook/Office365. Para que funcione:

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega estas variables:

```env
EMAIL_USER=tu_correo@outlook.com
EMAIL_PASS=tu_contraseña
```

**Nota**: Si el correo no se puede enviar, la respuesta se guarda de todas formas y verás una advertencia en la consola.

## 🗄️ Base de Datos

### Tabla `centroayuda` - Campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| IdAyuda | INT | ID único de la PQR |
| Perfil | INT | ID del usuario que creó la PQR |
| TipoSolicitud | TEXT | Queja, Reclamo, Sugerencia |
| Rol | TEXT | Rol del usuario |
| Asunto | TEXT | Título de la solicitud |
| Descripcion | TEXT | Detalle de la solicitud |
| **Respuesta** | TEXT | ✨ Respuesta del administrador |
| **FechaRespuesta** | TEXT | ✨ Fecha/hora de la respuesta |
| **Respondida** | INTEGER | ✨ 0=Pendiente, 1=Respondida |

*Campos marcados con ✨ fueron agregados en esta implementación*

## 🔗 Endpoints API

### GET `/api/admin/pqr`
- **Auth**: Requiere sesión de administrador
- **Retorna**: Lista de todas las PQR con sus respuestas
- **Usado por**: Tabla principal de gestión

### POST `/api/admin/pqr/responder`
- **Auth**: Requiere sesión de administrador
- **Body**: 
  ```json
  {
    "idPQR": 1,
    "respuesta": "Texto de la respuesta"
  }
  ```
- **Retorna**: 
  ```json
  {
    "success": true,
    "message": "PQR respondida correctamente",
    "emailSent": true
  }
  ```
- **Acciones**:
  1. Actualiza la PQR en la BD
  2. Envía email al usuario
  3. Retorna confirmación

## 🎨 Interfaz de Usuario

### Colores de Estado:

- 🟢 **Verde (Success)**: PQR respondida
- 🟡 **Amarillo (Warning)**: PQR pendiente
- 🔴 **Rojo (Danger)**: Quejas
- 🟡 **Amarillo (Warning)**: Reclamos
- 🔵 **Azul (Info)**: Sugerencias

### Badges de Rol:

- 🔵 **Azul (Primary)**: Usuario Natural
- 🔵 **Azul (Info)**: Comerciante
- 🟡 **Amarillo (Warning)**: Prestador de Servicio

## 🧪 Datos de Prueba

El sistema ya tiene 2 PQR de prueba creadas:

```sql
ID: 1
Tipo: Consulta
Usuario: admin@rpm.com
Asunto: Prueba de PQR
Estado: Pendiente

ID: 2
Tipo: Queja
Usuario: admin@rpm.com
Asunto: Problema con publicación
Estado: Pendiente
```

Puedes responder estas PQR para probar el sistema.

## 🚀 Flujo Completo de Uso

```
1. Usuario envía una PQR desde el Centro de Ayuda
   ↓
2. La PQR aparece en "Gestión de PQR" con estado "Pendiente"
   ↓
3. Administrador filtra/busca la PQR
   ↓
4. Administrador abre los detalles
   ↓
5. Administrador hace clic en "Responder"
   ↓
6. Administrador escribe su respuesta
   ↓
7. Administrador hace clic en "Enviar Respuesta"
   ↓
8. Sistema guarda la respuesta en BD
   ↓
9. Sistema envía email al usuario
   ↓
10. Usuario recibe notificación por correo
   ↓
11. PQR queda marcada como "Respondida"
```

## ⚙️ Archivos Modificados

1. **`/server.js`**:
   - Actualizado endpoint `GET /api/admin/pqr`
   - Creado endpoint `POST /api/admin/pqr/responder`

2. **`/public/Administrador/gestion_pqr.html`**:
   - Agregado modal de respuesta
   - Actualizado modal de detalles

3. **`/public/JS/Administrador/gestionPQR.js`**:
   - Función `verDetallesPQR()` actualizada
   - Función `mostrarFormularioRespuesta()` creada
   - Función `enviarRespuesta()` creada

4. **Base de Datos `centroayuda`**:
   - Agregado campo `Respuesta`
   - Agregado campo `FechaRespuesta`
   - Agregado campo `Respondida`

## 📞 Soporte

Para más ayuda, contacta al equipo de desarrollo o revisa los logs del servidor cuando respondas una PQR.

---

**Fecha de implementación**: 7 de enero de 2026  
**Versión**: 1.0  
**Estado**: ✅ Funcional y probado
