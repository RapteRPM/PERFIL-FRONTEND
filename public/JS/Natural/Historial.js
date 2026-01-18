document.addEventListener('DOMContentLoaded', () => {
  console.log("🔵 Historial.js cargado - DOMContentLoaded ejecutado");
  
  const btnExcel = document.getElementById('btnExcel');
  const tabla = document.getElementById('tablaHistorial');
  const filtros = ['fechaInicio', 'fechaFin', 'tipoProducto', 'ordenPrecio'];

  console.log("🔵 Elementos encontrados:", {
    btnExcel: !!btnExcel,
    tabla: !!tabla,
    filtros: filtros.map(id => ({ id, existe: !!document.getElementById(id) }))
  });

  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
  const usuarioId = usuarioActivo?.id;

  console.log("🔵 Usuario activo:", usuarioActivo);
  console.log("🔵 Usuario ID:", usuarioId);

  if (!usuarioId) {
    console.error("❌ No se encontró usuario logueado.");
    tabla.innerHTML = `<tr><td colspan="9" class="text-center text-danger">No se encontró información del usuario</td></tr>`;
    return;
  }

  // 🔹 Cargar historial
  async function cargarHistorial() {
    console.log("🔵 Iniciando carga de historial para usuario:", usuarioId);
    
    const query = [
      `usuarioId=${encodeURIComponent(usuarioId)}`,
      ...filtros.map(id => {
        const value = document.getElementById(id)?.value;
        return value ? `${id}=${encodeURIComponent(value)}` : '';
      }).filter(Boolean)
    ].join('&');

    try {
      const res = await fetch(`/api/historial?${query}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!res.ok) throw new Error('Error en la petición');
      const data = await res.json();

      console.log("📊 Datos recibidos del servidor:", data);
      console.log("📊 Cantidad de registros:", data.length);

      if (data.length > 0) {
        console.log("📊 Primer registro de ejemplo:", data[0]);
      }

      tabla.innerHTML = data.length
        ? data.map((item, i) => {
            try {
            const estado = (item.estado || '').toLowerCase();
            const esGrua = item.tipo === 'grua';
            let estadoHtml = '';
            let mensajeFechaEntrega = ''; // Declarar al inicio

            if (esGrua) {
              // Estados para grúas
              if (estado === 'terminado' || estado === 'completado') {
                estadoHtml = `<span class="badge bg-success">Completado</span>`;
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

              // Verificar si hay cambio de fecha no visto para productos de comerciantes
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
                        <strong>⚠️ El comerciante asignó fecha de entrega</strong>
                        <br>
                        <small class="text-muted">Actualizado el ${fechaModStr}</small>
                        <br>
                        <span class="fw-bold text-primary">📅 Fecha: ${item.fechaEntrega || 'No definida'} ${item.horaEntrega ? `a las ${item.horaEntrega}` : ''}</span>
                        ${item.telefonoComercio ? `<br><small class="text-success"><i class="fas fa-phone"></i> Contacto comercio: <a href="tel:${item.telefonoComercio}" class="text-success fw-bold">${item.telefonoComercio}</a></small>` : ''}
                        ${item.nombreComercio ? `<br><small><i class="fas fa-store"></i> ${item.nombreComercio}</small>` : ''}
                        <br>
                        <button class="btn btn-sm btn-success mt-2 btn-marcar-visto-comercio" 
                                data-id="${item.idSolicitudComercio}"
                                style="font-size: 0.75rem;">
                          <i class="fas fa-check"></i> Entendido
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }
            }

            const fecha = item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : '';

            // Fecha de entrega formateada
            let fechaEntregaDisplay = '-';
            if (!esGrua && item.fechaEntrega) {
              fechaEntregaDisplay = `
                <div class="text-primary fw-bold">
                  <i class="fas fa-calendar-check"></i> ${item.fechaEntrega}
                  ${item.horaEntrega ? `<br><small class="text-muted"><i class="fas fa-clock"></i> ${item.horaEntrega}</small>` : ''}
                  ${item.telefonoComercio ? `<br><small class="text-success"><i class="fas fa-phone"></i> <a href="tel:${item.telefonoComercio}" class="text-success">${item.telefonoComercio}</a></small>` : ''}
                  ${item.nombreComercio ? `<br><small class="text-muted"><i class="fas fa-store"></i> ${item.nombreComercio}</small>` : ''}
                </div>
              `;
            } else if (!esGrua && item.modoEntrega === 'Domicilio' && !item.fechaEntrega) {
              fechaEntregaDisplay = `
                <small class="text-warning">
                  <i class="fas fa-clock"></i> Pendiente de asignar por el comerciante
                  ${item.telefonoComercio ? `<br><a href="tel:${item.telefonoComercio}" class="text-success"><i class="fas fa-phone"></i> ${item.telefonoComercio}</a>` : ''}
                </small>
              `;
            } else if (esGrua && item.fechaEntrega) {
              fechaEntregaDisplay = `
                <div class="text-info fw-bold">
                  <i class="fas fa-truck"></i> ${item.fechaEntrega}
                  ${item.horaEntrega ? `<br><small class="text-muted"><i class="fas fa-clock"></i> ${item.horaEntrega}</small>` : ''}
                </div>
              `;
            }

            // Mensaje de fecha de entrega para grúas (si hay cambio de fecha no visto)
            // Para productos ya se asignó arriba en la sección de estados, NO resetear
            if (esGrua) {
              // Verificar si hay cambio de fecha no visto para grúas
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
            }

            // Botones de acción según el tipo
            let botonesAccion = '';
            
            if (esGrua) {
              // Botones para grúas
              if (estado === 'cancelado') {
                botonesAccion = `
                  <button class="btn btn-danger btn-sm btn-eliminar-grua" data-id="${item.idDetalleFactura}">
                    <i class="fas fa-trash"></i> Eliminar
                  </button>
                `;
              } else if (estado === 'rechazado') {
                botonesAccion = `
                  <span class="text-danger">
                    <i class="fas fa-times-circle"></i> Rechazado por el prestador
                  </span>
                  <button class="btn btn-danger btn-sm btn-eliminar-grua mt-2" data-id="${item.idDetalleFactura}">
                    <i class="fas fa-trash"></i> Eliminar
                  </button>
                `;
              } else if (estado === 'pendiente') {
                botonesAccion = `
                  <span class="text-info">
                    <i class="fas fa-clock"></i> Esperando respuesta del prestador
                  </span>
                  <button class="btn btn-danger btn-sm btn-estado-grua mt-2" data-id="${item.idDetalleFactura}" data-estado="Cancelado">
                    <i class="fas fa-ban"></i> Cancelar
                  </button>
                `;
              } else if (estado === 'aceptado') {
                botonesAccion = `
                  <button class="btn btn-success btn-sm btn-estado-grua" data-id="${item.idDetalleFactura}" data-estado="Completado">
                    <i class="fas fa-check-circle"></i> Marcar como Completado
                  </button>
                  <button class="btn btn-warning btn-sm btn-estado-grua" data-id="${item.idDetalleFactura}" data-estado="Cancelado">
                    <i class="fas fa-ban"></i> Cancelar
                  </button>
                `;
              } else if (estado === 'terminado' || estado === 'completado') {
                botonesAccion = `
                  <span class="text-success">
                    <i class="fas fa-check-circle"></i> Servicio completado
                  </span>
                  <button class="btn btn-danger btn-sm btn-eliminar-grua mt-2" data-id="${item.idDetalleFactura}">
                    <i class="fas fa-trash"></i> Eliminar
                  </button>
                `;
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
                <td>
                  ${item.producto || ''}
                  ${mensajeFechaEntrega}
                </td>
                <td>${item.categoria || ''}</td>
                <td>${fecha}</td>
                <td>${fechaEntregaDisplay}</td>
                <td>$${Number(item.precio || 0).toLocaleString('es-CO')}</td>
                <td>${item.metodoPago || ''}</td>
                <td>${estadoHtml}</td>
                <td>${botonesAccion}</td>
              </tr>
            `;
            } catch (error) {
              console.error('❌ Error procesando item del historial:', item, error);
              return `<tr><td colspan="9" class="text-center text-danger">Error procesando registro ${i + 1}</td></tr>`;
            }
          }).join('')
        : `<tr><td colspan="9" class="text-center text-muted py-4">No hay resultados</td></tr>`;

    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      tabla.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Error cargando historial</td></tr>`;
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

  // 🔹 Delegar evento para actualizar estado de grúa (Completado / Cancelar)
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-estado-grua')) {
      const id = e.target.dataset.id;
      const nuevoEstado = e.target.dataset.estado;

      const mensaje = nuevoEstado === 'Completado' 
        ? '¿Confirmas que el servicio ha sido completado?' 
        : '¿Deseas cancelar este servicio de grúa? Esta acción no se puede deshacer.';

      if (!confirm(mensaje)) return;

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

  // 🔹 Delegar evento para eliminar solicitud de grúa
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-eliminar-grua')) {
      const solicitudId = e.target.dataset.id;
      if (!confirm("¿Deseas eliminar este registro de servicio de grúa?")) return;

      try {
        const res = await fetch(`/api/historial/grua/eliminar/${solicitudId}`, { method: "DELETE" });
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

  // 🔹 Delegar evento para marcar notificación de cambio de fecha como vista
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
          cargarHistorial();
        } else {
          alert("❌ No se pudo marcar la notificación como vista.");
        }
      } catch (err) {
        console.error("❌ Error al marcar notificación:", err);
        alert("Error al conectar con el servidor.");
      }
    }
  });

  // 🔹 Delegar evento para marcar notificación de cambio de fecha de COMERCIO como vista
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-marcar-visto-comercio') || 
        e.target.closest('.btn-marcar-visto-comercio')) {
      
      const btn = e.target.classList.contains('btn-marcar-visto-comercio') 
        ? e.target 
        : e.target.closest('.btn-marcar-visto-comercio');
      
      const solicitudId = btn.dataset.id;

      try {
        const res = await fetch(`/api/comercio/notificacion-vista/${solicitudId}`, { 
          method: "PUT" 
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          console.log("✅ Notificación de comercio marcada como vista");
          cargarHistorial();
        } else {
          alert("❌ No se pudo marcar la notificación como vista.");
        }
      } catch (err) {
        console.error("❌ Error al marcar notificación de comercio:", err);
        alert("Error al conectar con el servidor.");
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