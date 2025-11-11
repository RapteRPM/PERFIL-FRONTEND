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
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay servicios registrados</td></tr>';
    return;
  }

  servicios.forEach((item, index) => {
    const tr = document.createElement("tr");

    const estadoColor = {
      Terminado: "bg-success text-light",
      Aceptado: "bg-info text-dark",
      Cancelado: "bg-danger text-light",
      Rechazado: "bg-danger text-light",
      Pendiente: "bg-warning text-dark"
    };

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.Cliente || 'N/A'}</td>
      <td>${item.Servicio || 'N/A'}</td>
      <td>${item.Origen || 'N/A'}</td>
      <td>${item.Destino || 'N/A'}</td>
      <td>${item.Fecha ? new Date(item.Fecha).toLocaleDateString('es-CO') : 'N/A'}</td>
      <td>${item.Hora || 'N/A'}</td>
      <td><span class="badge ${estadoColor[item.Estado] || "bg-secondary text-light"}">${item.Estado || 'N/A'}</span></td>
    `;

    tbody.appendChild(tr);
  });
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
        if (idx === 7) { // Columna de estado (badge)
          fila_datos.push(celda.textContent.trim());
        } else {
          fila_datos.push(celda.textContent.trim());
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