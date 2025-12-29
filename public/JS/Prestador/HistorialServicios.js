let todosLosServicios = []; // Guardar todos los servicios para filtrar

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  const usuarioId = usuario?.id;

  if (!usuarioId) {
    alert("⚠️ Debes iniciar sesión como prestador de servicios.");
    window.location.href = "../General/Ingreso.html";
    return;
  }

  // Cargar servicios inicialmente
  await cargarServicios(usuarioId);

  // Evento de filtrar
  document.getElementById("btnFiltrar").addEventListener("click", () => {
    filtrarServicios();
  });

  // Evento de exportar a Excel
  document.getElementById("btnExportarExcel").addEventListener("click", () => {
    exportarAExcel();
  });
});

async function cargarServicios(usuarioId) {
  try {
    const res = await fetch(`/api/historial-servicios-prestador/${usuarioId}`);
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    todosLosServicios = Array.isArray(data) ? data : [];
    
    console.log("📊 Servicios cargados:", todosLosServicios);
    mostrarServicios(todosLosServicios);

  } catch (err) {
    console.error("❌ Error al cargar historial de servicios:", err);
    document.getElementById("historialBody").innerHTML = `
      <tr><td colspan="8" class="text-center text-danger">Error al cargar servicios: ${err.message}</td></tr>
    `;
  }
}

function mostrarServicios(servicios) {
  const tbody = document.getElementById("historialBody");
  tbody.innerHTML = "";

  if (servicios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay servicios registrados</td></tr>';
    return;
  }

  servicios.forEach((item, index) => {
    const tr = document.createElement("tr");

    const estadoColor = {
      Completado: "bg-success text-light",
      Terminado: "bg-success text-light",
      Aceptado: "bg-info text-dark",
      Cancelado: "bg-danger text-light",
      Rechazado: "bg-danger text-light",
      Pendiente: "bg-warning text-dark"
    };

    // Mensaje de notificación de fecha modificada
    let mensajeNotificacion = '';
    if (item.FechaModificadaPor && !item.NotificacionVista) {
      const fechaMod = new Date(item.FechaModificadaPor);
      const fechaModStr = fechaMod.toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      mensajeNotificacion = `
        <div class="mt-2">
          <small class="text-warning d-block">
            <i class="fas fa-clock"></i>
            Fecha modificada el ${fechaModStr}
          </small>
          <small class="text-info d-block" style="font-size: 0.7rem;">
            Pendiente confirmación del cliente
          </small>
        </div>
      `;
    }

    // Botones de acción según el estado
    let botonesAccion = '';
    
    if (item.Estado === 'Aceptado') {
      botonesAccion = `
        <button class="btn btn-success btn-accion btn-completar" 
                data-id="${item.IdSolicitudServicio}" 
                title="✓ Completar servicio">
          <i class="fas fa-check-double"></i>
        </button>
        <button class="btn btn-warning btn-accion btn-cancelar-servicio" 
                data-id="${item.IdSolicitudServicio}" 
                title="✗ Cancelar servicio">
          <i class="fas fa-times-circle"></i>
        </button>
        <button class="btn btn-primary btn-accion btn-editar-fecha" 
                data-id="${item.IdSolicitudServicio}" 
                data-cliente="${item.Cliente || 'N/A'}"
                data-fecha="${item.Fecha || ''}"
                data-hora="${item.Hora || ''}"
                title="📅 Cambiar fecha y hora">
          <i class="fas fa-calendar-alt"></i>
        </button>
        ${mensajeNotificacion}
      `;
    } else if (item.Estado === 'Pendiente') {
      botonesAccion = `
        <button class="btn btn-primary btn-accion btn-editar-fecha" 
                data-id="${item.IdSolicitudServicio}" 
                data-cliente="${item.Cliente || 'N/A'}"
                data-fecha="${item.Fecha || ''}"
                data-hora="${item.Hora || ''}"
                title="📅 Cambiar fecha y hora">
          <i class="fas fa-calendar-alt"></i>
        </button>
        ${mensajeNotificacion}
      `;
    } else if (item.Estado === 'Completado' || item.Estado === 'Terminado') {
      botonesAccion = '<span class="text-success fs-4" title="Servicio completado"><i class="fas fa-check-circle"></i></span>';
    } else if (item.Estado === 'Cancelado') {
      botonesAccion = '<span class="text-danger fs-4" title="Servicio cancelado"><i class="fas fa-ban"></i></span>';
    } else if (item.Estado === 'Rechazado') {
      botonesAccion = '<span class="text-danger fs-4" title="Servicio rechazado"><i class="fas fa-times-circle"></i></span>';
    }

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.Cliente || 'N/A'}</td>
      <td>${item.Servicio || 'N/A'}</td>
      <td>${item.Origen || 'N/A'}</td>
      <td>${item.Destino || 'N/A'}</td>
      <td>${item.Fecha ? new Date(item.Fecha).toLocaleDateString('es-CO') : 'N/A'}</td>
      <td>${item.Hora || 'N/A'}</td>
      <td><span class="badge ${estadoColor[item.Estado] || "bg-secondary text-light"}">${item.Estado || 'N/A'}</span></td>
      <td class="col-acciones text-center">${botonesAccion}</td>
    `;

    tbody.appendChild(tr);
  });

  // Agregar event listeners a los botones
  agregarEventListeners();
}

function filtrarServicios() {
  const fechaInicio = document.getElementById("filtroFechaInicio").value;
  const fechaFin = document.getElementById("filtroFechaFin").value;
  const estado = document.getElementById("filtroEstado").value;

  let serviciosFiltrados = [...todosLosServicios];

  // Filtrar por fecha de inicio
  if (fechaInicio) {
    serviciosFiltrados = serviciosFiltrados.filter(s => {
      const fechaServicio = new Date(s.Fecha);
      return fechaServicio >= new Date(fechaInicio);
    });
  }

  // Filtrar por fecha fin
  if (fechaFin) {
    serviciosFiltrados = serviciosFiltrados.filter(s => {
      const fechaServicio = new Date(s.Fecha);
      return fechaServicio <= new Date(fechaFin);
    });
  }

  // Filtrar por estado
  if (estado) {
    serviciosFiltrados = serviciosFiltrados.filter(s => s.Estado === estado);
  }

  mostrarServicios(serviciosFiltrados);
}

function exportarAExcel() {
  if (todosLosServicios.length === 0) {
    alert("⚠️ No hay datos para exportar");
    return;
  }

  // Obtener servicios visibles (filtrados)
  const tbody = document.getElementById("historialBody");
  const filas = tbody.querySelectorAll("tr");
  
  const datos = [];
  
  // Agregar encabezados
  datos.push(["#", "Cliente", "Servicio", "Origen", "Destino", "Fecha", "Hora", "Estado"]);
  
  // Agregar filas visibles
  filas.forEach(fila => {
    const celdas = fila.querySelectorAll("td");
    if (celdas.length > 0) {
      const fila_datos = [];
      celdas.forEach((celda, idx) => {
        // Omitir la columna de Acciones (última columna, índice 8)
        if (idx < 8) {
          if (idx === 7) { // Columna de estado (badge)
            fila_datos.push(celda.textContent.trim());
          } else {
            fila_datos.push(celda.textContent.trim());
          }
        }
      });
      datos.push(fila_datos);
    }
  });

  // Crear libro de Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(datos);
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 5 },  // #
    { wch: 20 }, // Cliente
    { wch: 30 }, // Servicio
    { wch: 30 }, // Origen
    { wch: 30 }, // Destino
    { wch: 12 }, // Fecha
    { wch: 10 }, // Hora
    { wch: 12 }  // Estado
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Historial");
  
  // Descargar archivo
  const fechaHoy = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `historial_servicios_${fechaHoy}.xlsx`);
  
  console.log("✅ Excel exportado correctamente");
}

// ===============================
// Agregar event listeners a los botones de acción
// ===============================
function agregarEventListeners() {
  // Botón Completar
  document.querySelectorAll('.btn-completar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await cambiarEstado(id, 'Completado');
    });
  });

  // Botón Cancelar
  document.querySelectorAll('.btn-cancelar-servicio').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await cambiarEstado(id, 'Cancelado');
    });
  });

  // Botón Editar Fecha
  document.querySelectorAll('.btn-editar-fecha').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const cliente = e.currentTarget.dataset.cliente;
      const fecha = e.currentTarget.dataset.fecha;
      const hora = e.currentTarget.dataset.hora;
      
      abrirModalEditarFecha(id, cliente, fecha, hora);
    });
  });
}

// ===============================
// Cambiar estado del servicio
// ===============================
async function cambiarEstado(id, nuevoEstado) {
  const mensajes = {
    'Completado': '¿Confirmas que el servicio ha sido completado?',
    'Cancelado': '¿Estás seguro de cancelar este servicio? Esta acción no se puede deshacer.'
  };

  if (!confirm(mensajes[nuevoEstado])) {
    return;
  }

  try {
    const res = await fetch(`/api/solicitudes-grua/estado/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert(`✅ ${data.message}`);
      const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
      await cargarServicios(usuario.id);
    } else {
      alert(`❌ ${data.message || 'Error al actualizar el estado'}`);
    }
  } catch (err) {
    console.error('❌ Error al actualizar estado:', err);
    alert('❌ Error al conectar con el servidor');
  }
}

// ===============================
// Abrir modal para editar fecha/hora
// ===============================
function abrirModalEditarFecha(id, cliente, fecha, hora) {
  document.getElementById('idSolicitudEditar').value = id;
  document.getElementById('nombreClienteEditar').value = cliente;
  
  // Formatear fecha para input date (YYYY-MM-DD)
  if (fecha) {
    const fechaObj = new Date(fecha);
    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    document.getElementById('fechaEditar').value = `${año}-${mes}-${dia}`;
  }
  
  // Hora ya viene en formato correcto (HH:mm)
  document.getElementById('horaEditar').value = hora || '';

  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('modalEditarFecha'));
  modal.show();
}

// ===============================
// Manejar formulario de editar fecha
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const formEditar = document.getElementById('formEditarFecha');
  
  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('idSolicitudEditar').value;
      const nuevaFecha = document.getElementById('fechaEditar').value;
      const nuevaHora = document.getElementById('horaEditar').value;

      try {
        const res = await fetch(`/api/solicitudes-grua/fecha/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fecha: nuevaFecha, 
            hora: nuevaHora 
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          alert('✅ Fecha y hora actualizadas correctamente');
          
          // Cerrar modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarFecha'));
          modal.hide();
          
          // Recargar servicios
          const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
          await cargarServicios(usuario.id);
        } else {
          alert(`❌ ${data.message || 'Error al actualizar fecha/hora'}`);
        }
      } catch (err) {
        console.error('❌ Error al actualizar fecha/hora:', err);
        alert('❌ Error al conectar con el servidor');
      }
    });
  }
});