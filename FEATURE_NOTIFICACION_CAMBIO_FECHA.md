# Notificación de Cambio de Fecha por Prestador de Servicios

## 📋 Descripción del Feature

Se ha implementado un sistema de notificaciones que alerta al usuario natural cuando un prestador de servicios modifica la fecha de agendamiento de un servicio de grúa. Esta funcionalidad mejora la comunicación entre prestadores y usuarios, asegurando que los usuarios estén siempre informados de cualquier cambio en sus citas programadas.

## 🎯 Objetivo

Informar de manera clara y visible al usuario natural cuando el prestador de servicios cambia la fecha de un servicio de grúa, permitiéndole estar al tanto de las modificaciones y confirmar que ha visto la notificación.

## 🛠️ Cambios Implementados

### 1. Base de Datos

**Archivo de migración:** `migrations/add-fecha-modificacion-fields.js`

Se agregaron dos nuevas columnas a la tabla `controlagendaservicios`:

- **`FechaModificadaPor`** (DATETIME): 
  - Registra la fecha y hora exacta en que el prestador modificó la fecha del servicio
  - Se actualiza automáticamente cada vez que hay un cambio
  - NULL si nunca se ha modificado la fecha

- **`NotificacionVista`** (BOOLEAN):
  - Indica si el usuario natural ha visto y confirmado la notificación
  - FALSE por defecto cuando se modifica la fecha
  - TRUE cuando el usuario hace clic en "Entendido"

### 2. Backend (server.js)

#### 2.1. Endpoint de Actualización de Fecha
**Ruta:** `PUT /api/solicitudes-grua/fecha/:id`

**Cambios realizados:**
- Al actualizar la fecha y hora, ahora también:
  - Registra la fecha de modificación (`FechaModificadaPor = NOW()`)
  - Resetea la notificación como no vista (`NotificacionVista = FALSE`)
  - Actualiza el mensaje de respuesta para informar que el usuario será notificado

```javascript
await queryPromise(
  'UPDATE controlagendaservicios SET FechaServicio = ?, HoraServicio = ?, FechaModificadaPor = NOW(), NotificacionVista = FALSE WHERE IdSolicitudServicio = ?',
  [fecha, hora, id]
);
```

#### 2.2. Endpoint de Historial
**Ruta:** `GET /api/historial`

**Cambios realizados:**
- La query de servicios de grúa ahora incluye:
  - `cas.FechaModificadaPor AS fechaModificada`
  - `cas.NotificacionVista AS notificacionVista`

Esto permite que el frontend reciba la información necesaria para mostrar las notificaciones.

#### 2.3. Nuevo Endpoint: Marcar Notificación como Vista
**Ruta:** `PUT /api/solicitudes-grua/notificacion-vista/:id`

**Funcionalidad:**
- Permite al usuario natural marcar la notificación como vista
- Actualiza `NotificacionVista = TRUE` para la solicitud especificada
- Responde con éxito cuando se marca correctamente

### 3. Frontend

#### 3.1. Visualización de Notificación (Historial.js)

**Archivo:** `public/JS/Natural/Historial.js`

**Cambios en la función `cargarHistorial()`:**

Se agregó lógica para detectar y mostrar notificaciones de cambio de fecha:

```javascript
// Verificar si hay cambio de fecha no visto
if (item.fechaModificada && !item.notificacionVista) {
  const fechaMod = new Date(item.fechaModificada);
  const fechaModStr = fechaMod.toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  mensajeFechaEntrega = `
    <div class="mt-2 p-2 bg-warning text-dark rounded" style="border-left: 4px solid #ff9800;">
      <div class="d-flex align-items-start">
        <i class="fas fa-exclamation-triangle me-2 mt-1"></i>
        <div class="flex-grow-1">
          <strong>⚠️ El prestador modificó la fecha del servicio</strong>
          <br>
          <small>Modificado el ${fechaModStr}</small>
          <br>
          <button class="btn btn-sm btn-primary mt-1 btn-marcar-visto" 
                  data-id="${item.idDetalleFactura}"
                  style="font-size: 0.75rem;">
            <i class="fas fa-check"></i> Entendido
          </button>
        </div>
      </div>
    </div>
  `;
}
```

**Características del aviso:**
- ⚠️ Icono de advertencia para llamar la atención
- Fondo amarillo (warning) con borde naranja destacado
- Muestra la fecha exacta de modificación
- Botón "Entendido" para confirmar que vio la notificación
- Se muestra en la columna del producto/servicio del historial

#### 3.2. Event Listener para Marcar como Vista

Se agregó un nuevo delegador de eventos que maneja el clic en el botón "Entendido":

```javascript
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('btn-marcar-visto') || 
      e.target.closest('.btn-marcar-visto')) {
    
    const btn = e.target.classList.contains('btn-marcar-visto') 
      ? e.target 
      : e.target.closest('.btn-marcar-visto');
    
    const solicitudId = btn.dataset.id;

    try {
      const res = await fetch(`/api/solicitudes-grua/notificacion-vista/${solicitudId}`, { 
        method: "PUT" 
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        console.log("✅ Notificación marcada como vista");
        cargarHistorial(); // Recargar para ocultar la notificación
      }
    } catch (err) {
      console.error("❌ Error al marcar notificación:", err);
      alert("Error al conectar con el servidor.");
    }
  }
});
```

## 🔄 Flujo de Funcionamiento

1. **Prestador modifica la fecha:**
   - Va a su historial de servicios
   - Hace clic en el botón de calendario para editar fecha/hora
   - Guarda los cambios
   - Backend registra `FechaModificadaPor` y establece `NotificacionVista = FALSE`

2. **Usuario natural ve la notificación:**
   - Accede a su historial de compras
   - Ve un aviso destacado en amarillo indicando que la fecha fue modificada
   - El aviso muestra cuándo se realizó la modificación
   - Ve la nueva fecha y hora del servicio

3. **Usuario confirma la notificación:**
   - Hace clic en el botón "Entendido"
   - Backend marca `NotificacionVista = TRUE`
   - El aviso desaparece del historial
   - Puede seguir viendo la fecha actualizada normalmente

## 📱 Aspecto Visual

El aviso se muestra con:
- 🟨 Fondo amarillo (bootstrap bg-warning)
- 🟧 Borde izquierdo naranja de 4px
- ⚠️ Icono de advertencia
- 📅 Fecha y hora de modificación formateada
- ✅ Botón azul "Entendido"

## 🧪 Pruebas Recomendadas

### Caso 1: Modificación de fecha en servicio pendiente
1. Como prestador, modificar la fecha de un servicio en estado "Pendiente"
2. Como usuario natural, verificar que aparece la notificación
3. Hacer clic en "Entendido"
4. Verificar que la notificación desaparece

### Caso 2: Modificación de fecha en servicio aceptado
1. Como prestador, modificar la fecha de un servicio en estado "Aceptado"
2. Como usuario natural, verificar que aparece la notificación
3. Recargar la página y verificar que la notificación persiste
4. Hacer clic en "Entendido"
5. Verificar que la notificación desaparece

### Caso 3: Múltiples modificaciones
1. Como prestador, modificar la fecha varias veces
2. Como usuario natural, verificar que cada modificación actualiza la fecha mostrada
3. Verificar que la fecha de modificación se actualiza correctamente

## 📝 Notas Técnicas

- La funcionalidad es compatible tanto con MySQL como con SQLite
- La migración se ejecuta automáticamente al iniciar el servidor
- Si las columnas ya existen, la migración se omite sin error
- Las notificaciones son específicas para cada solicitud de servicio
- El sistema es retrocompatible: servicios sin modificación no muestran notificación

## 🎉 Beneficios

✅ **Comunicación clara:** El usuario siempre sabe cuándo hubo cambios
✅ **Transparencia:** Se muestra la fecha exacta de modificación
✅ **Control del usuario:** Puede confirmar que vio la notificación
✅ **No intrusivo:** La notificación desaparece después de confirmar
✅ **Experiencia mejorada:** Reduce confusiones y malentendidos
