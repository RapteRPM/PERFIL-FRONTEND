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
        credentials: 'include'
      });
      const data = await response.json();

      tablaBody.innerHTML = "";

      if (!data || data.length === 0) {
        tablaBody.innerHTML = `
          <tr>
            <td colspan="10" class="text-center text-muted py-3">
              No se encontraron resultados para los filtros seleccionados.
            </td>
          </tr>
        `;
        return;
      }

      data.forEach((venta, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${index + 1}</td>
          <td>${venta.idVenta || "-"}</td>
          <td>${venta.producto || "-"}</td>
          <td>${venta.categoria || "-"}</td>
          <td>${venta.comprador || "-"}</td>
          <td>${venta.fecha || "-"}</td>
          <td>${venta.cantidad || 0}</td>
          <td>$${Number(venta.total || 0).toLocaleString()}</td>
          <td>${venta.metodoPago || "-"}</td>
          <td>
            <span class="badge ${getEstadoColor(venta.estado)}">
              ${venta.estado || "Pendiente"}
            </span>
          </td>
        `;
        tablaBody.appendChild(fila);
      });
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      tablaBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center text-danger py-3">
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
    const data = await response.json();

    if (!data.success) {
      alertaDiv.textContent = data.mensaje;
      alertaDiv.className = 'alert alert-warning';
      alertaDiv.classList.remove('d-none');
      return;
    }

    // Si hay Excel, crear link de descarga
    const blob = new Blob([Uint8Array.from(atob(data.excelData), c => c.charCodeAt(0))], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_ventas.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
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
