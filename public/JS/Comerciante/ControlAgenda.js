let calendar;
let eventos = [];
let eventoActual;

document.addEventListener('DOMContentLoaded', async function () {
  calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',
    locale: 'es',
    height: 'auto',
    dayMaxEvents: 3, // Limita a 3 eventos visibles por día, el resto se muestra con "+X más"
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    events: [],
    eventClick: function (info) {
      const estado = info.event.extendedProps?.estado?.toLowerCase();
      
      // Solo permitir clic en eventos pendientes
      if (estado === 'finalizado' || estado === 'cancelado') {
        mostrarAlerta(`ℹ️ Esta cita está ${estado}. No se puede modificar.`, "info");
        return;
      }
      
      resaltarEvento(info.event);
      mostrarModal(info.event);
    },
    eventDidMount: function(info) {
      const estado = info.event.extendedProps?.estado?.toLowerCase();
      
      // Cambiar cursor para eventos no editables
      if (estado === 'finalizado' || estado === 'cancelado') {
        info.el.style.cursor = 'not-allowed';
        info.el.style.opacity = '0.7';
      }
    }
  });

  calendar.render();
  await cargarEventosDesdeServidor();
  
  // Configurar filtro de fecha automático
  const filtroFecha = document.getElementById('filtroFecha');
  if (filtroFecha) {
    filtroFecha.addEventListener('change', function() {
      aplicarFiltroFecha(this.value);
    });
  }
});

async function cargarEventosDesdeServidor() {
  try {
    const res = await fetch('/api/citas-comerciante', {
      credentials: 'include'
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('Respuesta inesperada del servidor');
    }

    eventos = data;
    calendar.removeAllEvents();
    
    if (eventos.length === 0) {
      console.log('No hay eventos para mostrar');
      cargarListaCitas();
      return;
    }
    
    // Solo agregar al calendario los eventos que tienen fecha confirmada
    const eventosConFecha = eventos.filter(e => e.start && e.start !== null);
    
    calendar.addEventSource(eventosConFecha.map(evento => ({
      ...evento,
      backgroundColor: getColorByEstado(evento.extendedProps?.estado),
      borderColor: getColorByEstado(evento.extendedProps?.estado),
      textColor: '#fff',
    })));

    cargarListaCitas(); // La lista muestra TODOS los pedidos
  } catch (error) {
    console.error('Error al cargar eventos:', error);
    const lista = document.getElementById('lista-citas');
    if (lista) {
      lista.innerHTML = '<p class="text-danger text-center">Error al cargar citas. Verifica tu sesión.</p>';
    }
  }
}

// Función para asignar color según el estado
function getColorByEstado(estado) {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return '#856404'; // Amarillo oscuro/dorado apagado
    case 'finalizado':
      return '#155724'; // Verde oscuro suave
    case 'cancelado':
      return '#721c24'; // Rojo oscuro suave
    default:
      return '#4a5568'; // Gris oscuro
  }
}

function cargarListaCitas() {
  const lista = document.getElementById('lista-citas');
  
  if (!lista) return;
  
  if (!eventos || eventos.length === 0) {
    lista.innerHTML = '<p class="text-muted text-center">No hay citas registradas</p>';
    return;
  }

  const totalCitas = eventos.length;
  const citasHTML = eventos.map(evento => {
    const props = evento.extendedProps || {};
    const estado = props.estado?.toLowerCase() || 'pendiente';
    
    // Determinar color de fondo según el estado
    let bgColor, textColor;
    switch(estado) {
      case 'finalizado':
        bgColor = '#155724'; // Verde oscuro
        textColor = '#ffffff';
        break;
      case 'cancelado':
        bgColor = '#721c24'; // Rojo oscuro
        textColor = '#ffffff';
        break;
      case 'pendiente':
      default:
        bgColor = '#856404'; // Amarillo/dorado oscuro
        textColor = '#ffffff';
        break;
    }
    
    const tieneFecha = props.tieneFecha;
    const iconoFecha = tieneFecha ? '📅' : '⏳';
    const textoFecha = tieneFecha 
      ? `${props.fechaServicio} a las ${props.hora}` 
      : `Sin fecha confirmada (${props.modoServicio})`;
    
    return `
      <div class="card mb-2" style="background-color: ${bgColor} !important; color: ${textColor}; border-left: 4px solid rgba(255,255,255,0.3) !important; cursor: pointer; transition: transform 0.2s;" 
           onmouseover="this.style.transform='translateX(3px)'" 
           onmouseout="this.style.transform='translateX(0)'"
           onclick="seleccionarPedidoLista(${evento.id})">
        <div class="card-body p-2" style="background-color: ${bgColor} !important;">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="mb-1" style="color: ${textColor} !important; font-weight: 600;">${iconoFecha} ${evento.title}</h6>
              <small class="d-block" style="color: rgba(255,255,255,0.9) !important; font-size: 0.8rem;">${textoFecha}</small>
              <small class="d-block" style="color: rgba(255,255,255,0.85) !important; font-size: 0.75rem;">Cliente: ${props.cliente || 'N/A'}</small>
              <small class="d-block" style="color: rgba(255,255,255,0.85) !important; font-size: 0.75rem;">Cantidad: ${props.cantidad} | Total: $${Number(props.total || 0).toLocaleString()}</small>
              ${tieneFecha && props.modoServicio === 'Domicilio' ? `<small class="d-block mt-1" style="color: #00ff88 !important; font-size: 0.75rem; font-weight: 600;">📦 Entrega programada: ${props.fechaServicio} ${props.hora}</small>` : ''}
              ${props.modoServicio === 'Contraentrega' && props.comentarios ? `<small class="d-block mt-1" style="color: #ffd700 !important; font-size: 0.75rem; font-weight: 500; font-style: italic;">💬 Observación: ${props.comentarios}</small>` : ''}
            </div>
            <div class="d-flex flex-column align-items-end gap-1">
              <span class="badge" style="background-color: rgba(255,255,255,0.2) !important; color: ${textColor}; font-size: 0.7rem;">${props.estado}</span>
              <button class="btn btn-sm" style="background-color: rgba(220,53,69,0.8); color: white; padding: 2px 6px; font-size: 0.7rem; border: none;" 
                      onclick="event.stopPropagation(); eliminarPedido(${evento.id})" 
                      title="Eliminar pedido">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lista.innerHTML = `
    <div class="mb-2">
      <small class="text-white">Total: ${totalCitas} pedido(s)</small>
    </div>
    ${citasHTML}
  `;
}

function resaltarEvento(evento) {
  // Restaurar colores originales de todos los eventos
  calendar.getEvents().forEach(e => {
    const colorOriginal = getColorByEstado(e.extendedProps?.estado);
    e.setProp('backgroundColor', colorOriginal);
    e.setProp('borderColor', colorOriginal);
  });
  
  // Resaltar el evento seleccionado
  evento.setProp('backgroundColor', '#00cc88');
  evento.setProp('borderColor', '#00aa77');
}

function mostrarModal(evento) {
  eventoActual = evento;
  const estado = evento.extendedProps?.estado?.toLowerCase();
  
  // No mostrar modal para eventos finalizados o cancelados
  if (estado === 'finalizado' || estado === 'cancelado') {
    mostrarAlerta(`ℹ️ Esta cita está ${estado}. No se puede modificar.`, "info");
    return;
  }
  
  document.getElementById('modal-title').innerText = evento.title;
  
  // Construir descripción con observaciones si existen
  let descripcion = evento.extendedProps.descripcion;
  if (evento.extendedProps.comentarios && evento.extendedProps.comentarios.trim() !== '') {
    descripcion += `\n\n💬 Observación del cliente: ${evento.extendedProps.comentarios}`;
  }
  
  document.getElementById('modal-desc').innerText = descripcion;
  document.getElementById('modal-date').innerText = evento.startStr;
  document.getElementById('modal-time').innerText = evento.extendedProps.hora || 'No definida';
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('modal').style.display = 'block';
}

function cerrarModal() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('modal').style.display = 'none';
  document.getElementById('nuevaFecha').value = '';
}

function aceptarFecha() {
  if (!eventoActual) {
    mostrarAlerta("❌ No hay evento seleccionado", "error");
    return;
  }
  
  const props = eventoActual.extendedProps || {};
  const fechaActual = props.fechaServicio || eventoActual.startStr;
  const horaActual = props.hora || 'Sin hora';
  
  // Confirmar la fecha actual sin cambios
  fetch('/api/confirmar-fecha-pedido', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ 
      id: eventoActual.id, 
      fecha: fechaActual, 
      hora: horaActual,
      confirmar: true 
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      mostrarAlerta(`✅ Fecha confirmada: ${fechaActual} a las ${horaActual}`, "success");
      cargarEventosDesdeServidor();
    } else {
      mostrarAlerta(`❌ ${data.error || 'Error al confirmar fecha'}`, "error");
    }
  })
  .catch(error => {
    console.error('Error:', error);
    mostrarAlerta("❌ Error al conectar con el servidor", "error");
  });
  
  cerrarModal();
}

async function proponerFecha() {
  const nueva = document.getElementById('nuevaFecha').value;
  
  if (!nueva) {
    mostrarAlerta("⚠️ Por favor selecciona una nueva fecha", "warning");
    return;
  }
  
  if (!eventoActual) {
    mostrarAlerta("❌ No hay evento seleccionado", "error");
    return;
  }
  
  const props = eventoActual.extendedProps || {};
  
  // Validar que la fecha esté dentro de los 3 días desde la fecha propuesta por el cliente
  // Si el cliente propuso fecha (Visita al taller), usar esa fecha como base
  // Si no hay fecha propuesta (Contraentrega), usar la fecha de compra
  const fechaBase = props.fechaServicio || props.fechaCompra;
  
  if (fechaBase) {
    const fechaReferencia = new Date(fechaBase);
    const fechaMaxima = new Date(fechaReferencia);
    fechaMaxima.setDate(fechaMaxima.getDate() + 3);
    
    const fechaNueva = new Date(nueva);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaNueva < hoy) {
      mostrarAlerta("❌ La fecha no puede ser anterior a hoy", "error");
      return;
    }
    
    if (fechaNueva > fechaMaxima) {
      const fechaMaximaStr = fechaMaxima.toISOString().split('T')[0];
      const tipoFecha = props.fechaServicio ? 'fecha propuesta por el cliente' : 'fecha de compra';
      mostrarAlerta(`❌ La fecha no puede ser mayor a 3 días desde la ${tipoFecha}.\nFecha máxima permitida: ${fechaMaximaStr}`, "error");
      return;
    }
  }
  
  // Pedir la hora
  const hora = prompt("Ingresa la hora de entrega (HH:MM):");
  
  if (!hora) {
    mostrarAlerta("⚠️ Debes ingresar una hora", "warning");
    return;
  }
  
  try {
    const res = await fetch('/api/actualizar-fecha-pedido', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: eventoActual.id, fecha: nueva, hora })
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      mostrarAlerta(`📆 Nueva fecha propuesta: ${nueva} a las ${hora}`, "success");
      await cargarEventosDesdeServidor();
    } else {
      mostrarAlerta(`❌ ${data.error || 'Error al actualizar fecha'}`, "error");
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarAlerta("❌ Error al conectar con el servidor", "error");
  }
  
  cerrarModal();
}

function mostrarAlerta(mensaje, tipo = "info") {
  const iconos = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  };
  alert(`${iconos[tipo] || "ℹ️"} ${mensaje}`);
}

// Función para filtrar lista por fecha
function aplicarFiltroFecha(fecha) {
  if (!fecha || fecha === '') {
    // Si no hay fecha, mostrar todos
    cargarListaCitas();
    return;
  }
  
  const lista = document.getElementById('lista-citas');
  if (!lista) return;
  
  // Filtrar eventos que tengan la fecha seleccionada
  const eventosFiltrados = eventos.filter(evento => {
    const props = evento.extendedProps || {};
    return props.fechaServicio === fecha;
  });
  
  if (eventosFiltrados.length === 0) {
    lista.innerHTML = '<p class="text-white text-center small">No hay pedidos para esta fecha</p>';
    return;
  }
  
  const citasHTML = eventosFiltrados.map(evento => {
    const props = evento.extendedProps || {};
    const estado = props.estado?.toLowerCase() || 'pendiente';
    
    // Determinar color de fondo según el estado
    let bgColor, textColor;
    switch(estado) {
      case 'finalizado':
        bgColor = '#155724'; // Verde oscuro
        textColor = '#ffffff';
        break;
      case 'cancelado':
        bgColor = '#721c24'; // Rojo oscuro
        textColor = '#ffffff';
        break;
      case 'pendiente':
      default:
        bgColor = '#856404'; // Amarillo/dorado oscuro
        textColor = '#ffffff';
        break;
    }
    
    const tieneFecha = props.tieneFecha;
    const iconoFecha = tieneFecha ? '📅' : '⏳';
    const textoFecha = tieneFecha 
      ? `${props.fechaServicio} a las ${props.hora}` 
      : `Sin fecha confirmada (${props.modoServicio})`;
    
    return `
      <div class="card mb-2" style="background-color: ${bgColor} !important; color: ${textColor}; border-left: 4px solid rgba(255,255,255,0.3) !important; cursor: pointer; transition: transform 0.2s;" 
           onmouseover="this.style.transform='translateX(3px)'" 
           onmouseout="this.style.transform='translateX(0)'"
           onclick="seleccionarPedidoLista(${evento.id})">
        <div class="card-body p-2" style="background-color: ${bgColor} !important;">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="mb-1" style="color: ${textColor} !important; font-weight: 600;">${iconoFecha} ${evento.title}</h6>
              <small class="d-block" style="color: rgba(255,255,255,0.9) !important; font-size: 0.8rem;">${textoFecha}</small>
              <small class="d-block" style="color: rgba(255,255,255,0.85) !important; font-size: 0.75rem;">Cliente: ${props.cliente || 'N/A'}</small>
              <small class="d-block" style="color: rgba(255,255,255,0.85) !important; font-size: 0.75rem;">Cantidad: ${props.cantidad} | Total: $${Number(props.total || 0).toLocaleString()}</small>
              ${tieneFecha && props.modoServicio === 'Domicilio' ? `<small class="d-block mt-1" style="color: #00ff88 !important; font-size: 0.75rem; font-weight: 600;">📦 Entrega programada: ${props.fechaServicio} ${props.hora}</small>` : ''}
              ${props.modoServicio === 'Contraentrega' && props.comentarios ? `<small class="d-block mt-1" style="color: #ffd700 !important; font-size: 0.75rem; font-weight: 500; font-style: italic;">💬 Observación: ${props.comentarios}</small>` : ''}
            </div>
            <div class="d-flex flex-column align-items-end gap-1">
              <span class="badge" style="background-color: rgba(255,255,255,0.2) !important; color: ${textColor}; font-size: 0.7rem;">${props.estado}</span>
              <button class="btn btn-sm" style="background-color: rgba(220,53,69,0.8); color: white; padding: 2px 6px; font-size: 0.7rem; border: none;" 
                      onclick="event.stopPropagation(); eliminarPedido(${evento.id})" 
                      title="Eliminar pedido">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lista.innerHTML = `
    <div class="mb-2">
      <small class="text-white">Mostrando: ${eventosFiltrados.length} pedido(s)</small>
    </div>
    ${citasHTML}
  `;
}

// Función para seleccionar un pedido desde la lista
function seleccionarPedidoLista(eventoId) {
  // Buscar el evento en el array
  const eventoData = eventos.find(e => e.id === eventoId);
  
  if (!eventoData) {
    mostrarAlerta("⚠️ No se encontró el pedido", "warning");
    return;
  }
  
  const estado = eventoData.extendedProps?.estado?.toLowerCase();
  
  // Si está finalizado o cancelado, solo mostrar info
  if (estado === 'finalizado' || estado === 'cancelado') {
    mostrarAlerta(`ℹ️ Este pedido está ${estado}. No se puede modificar.`, "info");
    return;
  }
  
  // Si está pendiente, mostrar modal para confirmar fecha
  // Buscar el evento en el calendario (solo si tiene fecha)
  const eventoCalendario = calendar.getEventById(eventoId);
  
  if (eventoCalendario) {
    // Si está en el calendario, resaltar y mostrar modal
    resaltarEvento(eventoCalendario);
    mostrarModal(eventoCalendario);
  } else {
    // Si no está en el calendario (sin fecha), mostrar modal especial
    mostrarModalSinFecha(eventoData);
  }
}

// Modal especial para pedidos sin fecha (contraentrega)
async function mostrarModalSinFecha(eventoData) {
  const props = eventoData.extendedProps;
  
  // Verificar si el usuario ya propuso una fecha
  const tieneFechaPropuesta = props.fechaServicio && props.fechaServicio !== 'null' && props.fechaServicio !== '';
  
  let mensaje;
  
  if (tieneFechaPropuesta) {
    mensaje = `
📦 ${eventoData.title}
━━━━━━━━━━━━━━━━━━━━━
👤 Cliente: ${props.cliente || 'N/A'}
📍 Modo: ${props.modoServicio}
📦 Cantidad: ${props.cantidad}
💰 Total: $${Number(props.total || 0).toLocaleString()}
${props.comentarios ? `💬 Observación: ${props.comentarios}` : ''}
━━━━━━━━━━━━━━━━━━━━━

📅 Fecha propuesta por el cliente: ${props.fechaServicio} a las ${props.hora}

¿Qué deseas hacer?
- ACEPTAR: Confirmar la fecha propuesta por el cliente
- CANCELAR: Proponer una nueva fecha
    `;
  } else {
    mensaje = `
📦 ${eventoData.title}
━━━━━━━━━━━━━━━━━━━━━
👤 Cliente: ${props.cliente || 'N/A'}
📍 Modo: ${props.modoServicio}
📦 Cantidad: ${props.cantidad}
💰 Total: $${Number(props.total || 0).toLocaleString()}
${props.comentarios ? `💬 Observación: ${props.comentarios}` : ''}
━━━━━━━━━━━━━━━━━━━━━

⏳ Este pedido NO tiene fecha confirmada.

¿Deseas asignar una fecha y hora de entrega?
    `;
  }
  
  if (confirm(mensaje)) {
    // Si tiene fecha propuesta, aceptarla directamente
    if (tieneFechaPropuesta) {
      try {
        const res = await fetch('/api/confirmar-fecha-pedido', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            id: eventoData.id, 
            fecha: props.fechaServicio, 
            hora: props.hora,
            confirmar: true 
          })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          mostrarAlerta(`✅ Fecha confirmada: ${props.fechaServicio} a las ${props.hora}`, "success");
          await cargarEventosDesdeServidor();
        } else {
          mostrarAlerta(`❌ ${data.error || 'Error al confirmar fecha'}`, "error");
        }
      } catch (error) {
        console.error('Error al confirmar fecha:', error);
        mostrarAlerta('❌ Error al conectar con el servidor', "error");
      }
      return;
    }
    
    // Si no tiene fecha, pedir una nueva
    await proponerNuevaFechaSinCalendario(eventoData);
  } else {
    // Si tiene fecha propuesta y cancela, preguntar si quiere proponer otra
    if (tieneFechaPropuesta) {
      if (confirm('¿Deseas proponer una fecha diferente?')) {
        await proponerNuevaFechaSinCalendario(eventoData);
      }
    }
  }
}

// Función auxiliar para proponer nueva fecha desde el modal sin calendario
async function proponerNuevaFechaSinCalendario(eventoData) {
  const props = eventoData.extendedProps;
  
  // Calcular la fecha máxima (3 días desde la fecha propuesta por el cliente o fecha de compra)
  // Si el cliente propuso fecha (Visita al taller), usar esa fecha como base
  // Si no hay fecha propuesta (Contraentrega), usar la fecha de compra
  const fechaBase = props.fechaServicio || props.fechaCompra;
  const tipoFecha = props.fechaServicio ? 'fecha propuesta por el cliente' : 'fecha de compra';
  
  const fechaReferencia = new Date(fechaBase);
  const fechaMaxima = new Date(fechaReferencia);
  fechaMaxima.setDate(fechaMaxima.getDate() + 3);
  
  const fechaMaximaStr = fechaMaxima.toISOString().split('T')[0];
  const hoy = new Date().toISOString().split('T')[0];
  
  const fecha = prompt(`Ingresa la fecha de entrega (YYYY-MM-DD):\n\n⚠️ Máximo: ${fechaMaximaStr} (3 días desde la ${tipoFecha})`);
  
  if (!fecha) return;
  
  // Validar que la fecha no sea mayor a 3 días
  const fechaIngresada = new Date(fecha);
  if (fechaIngresada > fechaMaxima) {
    mostrarAlerta(`❌ La fecha no puede ser mayor a 3 días desde la ${tipoFecha}.\nFecha máxima permitida: ${fechaMaximaStr}`, "error");
    return;
  }
  
  if (fechaIngresada < new Date(hoy)) {
    mostrarAlerta(`❌ La fecha no puede ser anterior a hoy.`, "error");
    return;
  }
  
  const hora = prompt("Ingresa la hora de entrega (HH:MM):");
  
  if (fecha && hora) {
    try {
      const res = await fetch('/api/actualizar-fecha-pedido', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: eventoData.id, fecha, hora })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        mostrarAlerta(`✅ Fecha programada: ${fecha} a las ${hora}`, "success");
        await cargarEventosDesdeServidor();
      } else {
        mostrarAlerta(`❌ ${data.error || 'Error al actualizar fecha'}`, "error");
      }
    } catch (error) {
      console.error('Error al actualizar fecha:', error);
      mostrarAlerta('❌ Error al conectar con el servidor', "error");
    }
  }
}

// Función para eliminar un pedido
async function eliminarPedido(pedidoId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const res = await fetch(`/api/eliminar-pedido/${pedidoId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    mostrarAlerta(data.message || '✅ Pedido eliminado correctamente', 'success');
    
    // Recargar eventos
    await cargarEventosDesdeServidor();
    
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    mostrarAlerta('❌ Error al eliminar el pedido', 'error');
  }
}