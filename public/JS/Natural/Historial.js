document.addEventListener('DOMContentLoaded', () => {
  const btnExcel = document.getElementById('btnExcel');
  const tabla = document.getElementById('tablaHistorial');
  const filtros = ['fechaInicio', 'fechaFin', 'tipoProducto', 'ordenPrecio'];

  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
  const usuarioId = usuarioActivo?.id;

  if (!usuarioId) {
    console.error("❌ No se encontró usuario logueado.");
    tabla.innerHTML = `<tr><td colspan="8" class="text-center text-danger">No se encontró información del usuario</td></tr>`;
    return;
  }

  // 🔹 Cargar historial
  async function cargarHistorial() {
    const query = [
      `usuarioId=${encodeURIComponent(usuarioId)}`,
      ...filtros.map(id => {
        const value = document.getElementById(id)?.value;
        return value ? `${id}=${encodeURIComponent(value)}` : '';
      }).filter(Boolean)
    ].join('&');

    try {
      const res = await fetch(`/api/historial?${query}`);
      if (!res.ok) throw new Error('Error en la petición');
      const data = await res.json();

      tabla.innerHTML = data.length
        ? data.map((item, i) => {
            const estado = (item.estado || '').toLowerCase();
            const esGrua = item.tipo === 'grua';
            let estadoHtml = '';

            if (esGrua) {
              // Estados para grúas
              if (estado === 'terminado') {
                estadoHtml = `<span class="badge bg-success">Terminado</span>`;
              } else if (estado === 'aceptado') {
                estadoHtml = `<span class="badge bg-info text-dark">Aceptado</span>`;
              } else if (estado === 'pendiente') {
                estadoHtml = `<span class="badge bg-warning text-dark">Pendiente</span>`;
              } else if (estado === 'rechazado') {
                estadoHtml = `<span class="badge bg-danger">Rechazado</span>`;
              } else if (estado === 'cancelado') {
                estadoHtml = `<span class="badge bg-secondary">Cancelado</span>`;
              } else {
                estadoHtml = `<span class="badge bg-secondary">${item.estado || 'Desconocido'}</span>`;
              }
            } else {
              // Estados para productos
              if (['pago exitoso', 'finalizado', 'compra finalizada'].includes(estado)) {
                estadoHtml = `<span class="badge bg-success">Finalizado</span>`;
              } else if (['pendiente', 'en proceso', 'proceso pendiente'].includes(estado)) {
                estadoHtml = `<span class="badge bg-warning text-dark">En Proceso</span>`;
              } else if (['cancelado', 'pago rechazado'].includes(estado)) {
                estadoHtml = `<span class="badge bg-danger">Cancelado</span>`;
              } else {
                estadoHtml = `<span class="badge bg-secondary">${item.estado || 'Desconocido'}</span>`;
              }
            }

            const fecha = item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : '';

            // Botones de acción según el tipo
            let botonesAccion = '';
            
            if (esGrua) {
              // Botones para grúas
              if (estado === 'cancelado') {
                botonesAccion = `<span class="text-muted">Cancelado</span>`;
              } else if (estado === 'rechazado') {
                botonesAccion = `<span class="text-danger">Rechazado por el prestador</span>`;
              } else if (estado === 'pendiente') {
                botonesAccion = `
                  <span class="text-info">
                    <i class="fas fa-clock"></i> Esperando respuesta del prestador
                  </span>
                  <button class="btn btn-danger btn-sm btn-estado-grua" data-id="${item.idDetalleFactura}" data-estado="Cancelado">Cancelar</button>
                `;
              } else if (estado === 'aceptado') {
                botonesAccion = `
                  <button class="btn btn-success btn-sm btn-estado-grua" data-id="${item.idDetalleFactura}" data-estado="Terminado">
                    <i class="fas fa-check-circle"></i> Marcar como Terminado
                  </button>
                `;
              } else if (estado === 'terminado') {
                botonesAccion = `<span class="text-success"><i class="fas fa-check-circle"></i> Servicio completado</span>`;
              } else {
                botonesAccion = `<span class="text-muted">—</span>`;
              }
            } else {
              // Botones para productos
              if (estado === 'cancelado') {
                botonesAccion = `<button class="btn btn-danger btn-sm btn-eliminar" data-id="${item.idFactura}">Eliminar</button>`;
              } else if (['proceso pendiente', 'pendiente', 'en proceso'].includes(estado)) {
                botonesAccion = `
                  <button class="btn btn-success btn-sm btn-estado" data-id="${item.idDetalleFactura}" data-estado="Finalizado">Recibido</button>
                  <button class="btn btn-danger btn-sm btn-estado" data-id="${item.idDetalleFactura}" data-estado="Cancelado">Cancelar</button>
                `;
              } else {
                botonesAccion = `
                  <a href="/Natural/Factura_compra.html?factura=${item.idFactura}" class="btn btn-primary btn-sm me-2">Ver factura</a>
                  <button class="btn btn-danger btn-sm btn-eliminar" data-id="${item.idFactura}">Eliminar</button>
                `;
              }
            }

            return `
              <tr>
                <td>${i + 1}</td>
                <td>${item.producto || ''}</td>
                <td>${item.categoria || ''}</td>
                <td>${fecha}</td>
                <td>$${Number(item.precio || 0).toLocaleString('es-CO')}</td>
                <td>${item.metodoPago || ''}</td>
                <td>${estadoHtml}</td>
                <td>${botonesAccion}</td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="8" class="text-center text-muted py-4">No hay resultados</td></tr>`;

    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      tabla.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error cargando historial</td></tr>`;
    }
  }

  // 🔹 Delegar evento para actualizar estado (Recibido / Cancelar)
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-estado')) {
      const id = e.target.dataset.id;
      const nuevoEstado = e.target.dataset.estado;

      if (!confirm(`¿Deseas marcar este pedido como ${nuevoEstado}?`)) return;

      try {
        const res = await fetch(`/api/historial/estado/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert(`✅ ${data.message}`);
          cargarHistorial();
        } else {
          alert(`❌ ${data.message || 'Error al actualizar estado'}`);
        }
      } catch (err) {
        console.error('❌ Error al actualizar estado:', err);
        alert('❌ Error al actualizar estado.');
      }
    }
  });

  // 🔹 Delegar evento para actualizar estado de grúa (Terminado / Cancelar)
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-estado-grua')) {
      const id = e.target.dataset.id;
      const nuevoEstado = e.target.dataset.estado;

      if (!confirm(`¿Deseas marcar este servicio de grúa como ${nuevoEstado}?`)) return;

      try {
        const res = await fetch(`/api/historial/grua/estado/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert(`✅ ${data.message}`);
          cargarHistorial();
        } else {
          alert(`❌ ${data.message || 'Error al actualizar estado'}`);
        }
      } catch (err) {
        console.error('❌ Error al actualizar estado de grúa:', err);
        alert('❌ Error al actualizar estado.');
      }
    }
  });

  // 🔹 Delegar evento para eliminar factura
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
      const facturaId = e.target.dataset.id;
      if (!confirm("¿Deseas eliminar este registro de compra?")) return;

      try {
        const res = await fetch(`/api/historial/eliminar/${facturaId}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          alert("✅ Registro eliminado correctamente.");
          cargarHistorial();
        } else {
          alert("❌ No se pudo eliminar el registro.");
        }
      } catch (err) {
        console.error("❌ Error al eliminar registro:", err);
        alert("Error al conectar con el servidor.");
      }
    }
  });

  // 🔹 Filtros
  filtros.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', cargarHistorial);
  });

  // 🔹 Exportar a Excel
  btnExcel.addEventListener('click', (e) => {
    e.preventDefault();
    const query = [
      `usuarioId=${encodeURIComponent(usuarioId)}`,
      ...filtros.map(id => {
        const value = document.getElementById(id)?.value;
        return value ? `${id}=${encodeURIComponent(value)}` : '';
      }).filter(Boolean)
    ].join('&');
    window.open(`/api/historial/excel?${query}`, '_blank');
  });

  cargarHistorial();
});