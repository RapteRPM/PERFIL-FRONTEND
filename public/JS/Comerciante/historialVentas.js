// HISTORIAL DE VENTAS - USUARIO COMERCIANTE
document.addEventListener("DOMContentLoaded", async () => {
  const tablaBody = document.getElementById("tablaVentasBody");
  const btnExcel = document.getElementById("btnExcel");
  const filtrosForm = document.getElementById("filtrosForm");

  // Función principal para obtener y mostrar las ventas
  async function cargarVentas() {
    try {
      const fechaInicio = document.getElementById("fechaInicio").value;
      const fechaFin = document.getElementById("fechaFin").value;
      const tipoProducto = document.getElementById("tipoProducto").value;
      const ordenPrecio = document.getElementById("ordenPrecio").value;

      const params = new URLSearchParams({
        fechaInicio,
        fechaFin,
        tipoProducto,
        ordenPrecio
      });

      const response = await fetch(`/api/historial-ventas?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();

      tablaBody.innerHTML = "";

      if (!data || data.length === 0) {
        tablaBody.innerHTML = `
          <tr>
            <td colspan="12" class="text-center text-muted py-3">
              No se encontraron resultados para los filtros seleccionados.
            </td>
          </tr>
        `;
        return;
      }

      data.forEach((venta, index) => {
        // Formatear fecha de entrega
        let fechaEntregaDisplay = '-';
        if (venta.fechaEntrega) {
          fechaEntregaDisplay = `
            <span class="text-primary fw-bold">
              <i class="fas fa-calendar-check"></i> ${venta.fechaEntrega}
              ${venta.horaEntrega ? `<br><small class="text-muted"><i class="fas fa-clock"></i> ${venta.horaEntrega}</small>` : ''}
            </span>
          `;
        } else if (venta.modoEntrega === 'Domicilio' && !venta.fechaEntrega) {
          fechaEntregaDisplay = '<small class="text-warning"><i class="fas fa-clock"></i> Pendiente</small>';
        }

        // Determinar el badge de confirmación del cliente
        let confirmacionBadge = '';
        if (venta.confirmacionUsuario === 'Recibido') {
          confirmacionBadge = '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Recibido</span>';
        } else if (venta.confirmacionUsuario === 'Pendiente') {
          confirmacionBadge = '<span class="badge bg-warning text-dark"><i class="fas fa-clock"></i> Pendiente</span>';
        } else {
          confirmacionBadge = '<span class="badge bg-secondary">-</span>';
        }
        
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${index + 1}</td>
          <td>${venta.idVenta || "-"}</td>
          <td>${venta.producto || "-"}</td>
          <td>${venta.categoria || "-"}</td>
          <td>${venta.comprador || "-"}</td>
          <td>${venta.fecha || "-"}</td>
          <td>${fechaEntregaDisplay}</td>
          <td>${venta.cantidad || 0}</td>
          <td>$${Number(venta.total || 0).toLocaleString()}</td>
          <td>${venta.metodoPago || "-"}</td>
          <td>
            <span class="badge ${getEstadoColor(venta.estado)}">
              ${venta.estado || "Pendiente"}
            </span>
          </td>
          <td>${confirmacionBadge}</td>
        `;
        tablaBody.appendChild(fila);
      });
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      tablaBody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center text-danger py-3">
            Error al obtener los datos. Intenta nuevamente más tarde.
          </td>
        </tr>
      `;
    }
  }

  // Cargar ventas al inicio
  cargarVentas();

  // Aplicar filtros cuando el formulario cambia
  if (filtrosForm) {
    filtrosForm.addEventListener("submit", (e) => {
      e.preventDefault();
      cargarVentas();
    });
  }

  // Descargar Excel
btnExcel.addEventListener("click", async () => {
  const fechaInicio = document.getElementById("fechaInicio").value;
  const fechaFin = document.getElementById("fechaFin").value;
  const tipoProducto = document.getElementById("tipoProducto").value;
  const ordenPrecio = document.getElementById("ordenPrecio").value;

  const alertaDiv = document.getElementById("alertaExcel");
  alertaDiv.classList.add('d-none'); // Ocultar mensaje previo

  const params = new URLSearchParams({
    fechaInicio,
    fechaFin,
    tipoProducto,
    ordenPrecio
  });

  try {
    const response = await fetch(`/api/historial-ventas/excel?${params.toString()}`);
    
    // Verificar si es un error (JSON)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!data.success) {
        alertaDiv.textContent = data.mensaje;
        alertaDiv.className = 'alert alert-warning';
        alertaDiv.classList.remove('d-none');
        return;
      }
    }
    
    // Si no es JSON, es el archivo Excel
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_ventas.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    // Mostrar mensaje de éxito
    alertaDiv.textContent = '✓ Excel descargado exitosamente';
    alertaDiv.className = 'alert alert-success';
    alertaDiv.classList.remove('d-none');
    setTimeout(() => {
      alertaDiv.classList.add('d-none');
    }, 3000);

  } catch (err) {
    console.error('Error al descargar Excel:', err);
    alertaDiv.textContent = 'Error al generar el Excel. Intenta nuevamente.';
    alertaDiv.className = 'alert alert-danger';
    alertaDiv.classList.remove('d-none');
  }
});

  // Colores de estado
  function getEstadoColor(estado) {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "bg-warning text-dark";
      case "en revisión":
        return "bg-info text-dark";
      case "entregado":
        return "bg-success";
      case "cancelado":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  }
});
