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
    const res = await fetch('/api/privado/citas');
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('Respuesta inesperada del servidor');
    }

    eventos = data;
    calendar.removeAllEvents();
    calendar.addEventSource(eventos.map(evento => ({
      ...evento,
      backgroundColor: 'rgb(236, 11, 11)',
      borderColor: 'rgb(236, 11, 11)',
      textColor: '#fff',
    })));

    cargarListaCitas();
  } catch (error) {
    console.error('Error al cargar eventos:', error);
  }
}

function cargarListaCitas() {
  const lista = document.getElementById('lista-citas');
  lista.innerHTML = '';
  eventos.forEach(evento => {
    const item = document.createElement('div');
    item.className = 'cita-item';
    item.style.backgroundColor = '#2c2c2c';
    item.style.color = '#fff';
    item.style.border = '1px solid rgb(236, 11, 11)';
    item.style.transition = '0.3s';
    item.innerText = `${evento.title} - ${evento.start}`;
    item.onmouseenter = () => (item.style.backgroundColor = 'rgb(236, 11, 11)');
    item.onmouseleave = () => (item.style.backgroundColor = '#2c2c2c');
    item.onclick = () => {
      const eventoCalendario = calendar.getEventById(evento.id);
      resaltarEvento(eventoCalendario);
      mostrarModal(eventoCalendario);
    };
    lista.appendChild(item);
  });
}

function resaltarEvento(evento) {
  calendar.getEvents().forEach(e => {
    e.setProp('backgroundColor', 'rgb(236, 11, 11)');
    e.setProp('borderColor', 'rgb(236, 11, 11)');
  });
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