let calendar;
let eventos = [];
let eventoActual;

document.addEventListener('DOMContentLoaded', async function () {
  calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    events: [],
    eventClick: function (info) {
      resaltarEvento(info.event);
      mostrarModal(info.event);
    },
  });

  calendar.render();
  await cargarEventosDesdeServidor();
});

async function cargarEventosDesdeServidor() {
  try {
    const res = await fetch('/api/privado/citas', {
      credentials: 'include'
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('Respuesta inesperada del servidor');
    }

    eventos = data;
    calendar.removeAllEvents();
    calendar.addEventSource(eventos.map(evento => ({
      ...evento,
      backgroundColor: getColorByEstado(evento.extendedProps?.estado),
      borderColor: getColorByEstado(evento.extendedProps?.estado),
      textColor: '#fff',
    })));

    cargarListaCitas();
  } catch (error) {
    console.error('Error al cargar eventos:', error);
  }
}

// Función para asignar color según el estado
function getColorByEstado(estado) {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return '#ffc107'; // Amarillo
    case 'finalizado':
      return '#28a745'; // Verde
    case 'cancelado':
      return '#dc3545'; // Rojo
    default:
      return '#6c757d'; // Gris
  }
}

function cargarListaCitas() {
  const lista = document.getElementById('lista-citas');
  lista.innerHTML = '';
  
  if (eventos.length === 0) {
    lista.innerHTML = '<p class="text-center text-muted">No hay citas registradas</p>';
    return;
  }

  eventos.forEach(evento => {
    const item = document.createElement('div');
    item.className = 'cita-item p-2 mb-2 rounded';
    const backgroundColor = getColorByEstado(evento.extendedProps?.estado);
    item.style.backgroundColor = backgroundColor;
    item.style.color = '#fff';
    item.style.cursor = 'pointer';
    item.style.transition = '0.3s';
    
    item.innerHTML = `
      <strong>${evento.title}</strong><br>
      <small>📅 ${evento.start}</small><br>
      <small>💰 $${Number(evento.extendedProps?.total || 0).toLocaleString()}</small><br>
      <small>📊 ${evento.extendedProps?.estado || 'Pendiente'}</small>
    `;
    
    item.onmouseenter = () => {
      item.style.opacity = '0.8';
      item.style.transform = 'scale(1.02)';
    };
    item.onmouseleave = () => {
      item.style.opacity = '1';
      item.style.transform = 'scale(1)';
    };
    item.onclick = () => {
      const eventoCalendario = calendar.getEventById(evento.id);
      if (eventoCalendario) {
        resaltarEvento(eventoCalendario);
        mostrarModal(eventoCalendario);
      }
    };
    lista.appendChild(item);
  });
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
  document.getElementById('modal-title').innerText = evento.title;
  document.getElementById('modal-desc').innerText = evento.extendedProps.descripcion;
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
  mostrarAlerta("✅ Fecha aceptada para: " + eventoActual.title, "success");
  cerrarModal();
}

function proponerFecha() {
  const nueva = document.getElementById('nuevaFecha').value;
  if (nueva) {
    eventoActual.setStart(nueva);
    mostrarAlerta("📆 Nueva fecha propuesta: " + nueva, "info");
    cerrarModal();
  } else {
    mostrarAlerta("⚠️ Por favor selecciona una nueva fecha", "warning");
  }
}

function mostrarAlerta(mensaje, tipo) {
  const alertBox = document.createElement('div');
  alertBox.className = `alert alert-${tipo} position-fixed bottom-0 end-0 m-4 shadow`;
  alertBox.style.zIndex = 2000;
  alertBox.textContent = mensaje;
  document.body.appendChild(alertBox);
  setTimeout(() => alertBox.remove(), 3000);
}