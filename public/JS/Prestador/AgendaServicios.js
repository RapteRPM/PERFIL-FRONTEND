document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  const usuarioId = usuario?.id;

  if (!usuarioId) {
    console.error("❌ No hay usuario logueado");
    return;
  }

  cargarSolicitudes();

  // Función para cargar las solicitudes
  async function cargarSolicitudes() {
    try {
      const res = await fetch(`/api/solicitudes-grua/${usuarioId}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("❌ Formato de datos incorrecto");
        return;
      }

      const contenedor = document.getElementById("contenedorSolicitudes");
      contenedor.innerHTML = "";

      if (data.length === 0) {
        contenedor.innerHTML = `
          <div class="col-12 text-center text-muted py-5">
            <i class="fas fa-inbox fa-3x mb-3"></i>
            <p class="fs-5">No hay solicitudes de servicio</p>
          </div>
        `;
        return;
      }

      data.forEach((item) => {
        const card = document.createElement("div");
        card.className = "col-md-6";

        const destino = item.Destino ? ` → ${item.Destino}` : "";
        
        // Colores según el estado
        const estadoColor = {
          Pendiente: "bg-warning text-dark",
          Cancelado: "bg-danger text-light",
          Rechazado: "bg-danger text-light",
          Completado: "bg-success text-light",
          Terminado: "bg-success text-light",
          Aceptado: "bg-info text-dark"
        };

        // Botones según el estado
        let botones = '';
        
        if (item.Estado === 'Pendiente') {
          botones = `
            <button class="btn btn-success btn-sm btn-aceptar" data-id="${item.IdSolicitudServicio}">
              <i class="fas fa-check-circle"></i> Aceptar
            </button>
            <button class="btn btn-danger btn-sm btn-rechazar" data-id="${item.IdSolicitudServicio}">
              <i class="fas fa-times-circle"></i> Rechazar
            </button>
          `;
        } else if (item.Estado === 'Aceptado') {
          botones = `
            <button class="btn btn-primary btn-sm btn-completar" data-id="${item.IdSolicitudServicio}">
              <i class="fas fa-flag-checkered"></i> Marcar como Completado
            </button>
            <button class="btn btn-warning btn-sm btn-cancelar-prestador" data-id="${item.IdSolicitudServicio}">
              <i class="fas fa-ban"></i> Cancelar Servicio
            </button>
          `;
        } else if (item.Estado === 'Completado' || item.Estado === 'Terminado') {
          botones = `
            <span class="text-success">
              <i class="fas fa-check-circle"></i> Servicio completado
            </span>
          `;
        } else if (item.Estado === 'Rechazado') {
          botones = `
            <span class="text-danger">
              <i class="fas fa-times-circle"></i> Servicio rechazado
            </span>
          `;
        } else if (item.Estado === 'Cancelado') {
          botones = `
            <span class="text-danger">
              <i class="fas fa-ban"></i> Servicio cancelado
            </span>
          `;
        }

        // Observaciones del cliente (si existen)
        const observaciones = item.ComentariosAdicionales 
          ? `<div class="alert alert-info py-2 px-3 mb-2" style="font-size: 0.9rem;">
               <i class="fas fa-comment-dots me-2"></i>
               <strong>Observación del cliente:</strong> ${item.ComentariosAdicionales}
             </div>` 
          : '';

        card.innerHTML = `
          <div class="card card-solicitud p-4 shadow-sm">
            <h5 class="fw-bold text-lg mb-2">
              <i class="fas fa-user text-primary me-2"></i> Cliente: ${item.Cliente}
            </h5>
            <p class="mb-1"><strong>Tipo de servicio:</strong> ${item.Servicio}</p>
            <p class="mb-1"><strong>Ubicación:</strong> ${item.DireccionRecogida}${destino}</p>
            <p class="mb-2"><strong>Fecha solicitada:</strong> ${item.FechaServicio}</p>
            ${observaciones}
            <div class="mb-3">
              <span class="badge ${estadoColor[item.Estado] || "bg-secondary text-light"}">${item.Estado}</span>
            </div>
            <div class="mt-2 d-flex gap-2 flex-wrap">
              ${botones}
            </div>
          </div>
        `;

        contenedor.appendChild(card);
      });

      // Agregar event listeners a los botones
      document.querySelectorAll('.btn-aceptar').forEach(btn => {
        btn.addEventListener('click', () => actualizarEstado(btn.dataset.id, 'Aceptado'));
      });

      document.querySelectorAll('.btn-rechazar').forEach(btn => {
        btn.addEventListener('click', () => actualizarEstado(btn.dataset.id, 'Rechazado'));
      });

      document.querySelectorAll('.btn-completar').forEach(btn => {
        btn.addEventListener('click', () => actualizarEstado(btn.dataset.id, 'Completado'));
      });

      document.querySelectorAll('.btn-cancelar-prestador').forEach(btn => {
        btn.addEventListener('click', () => actualizarEstado(btn.dataset.id, 'Cancelado'));
      });

    } catch (err) {
      console.error("❌ Error al cargar solicitudes:", err);
      const contenedor = document.getElementById("contenedorSolicitudes");
      contenedor.innerHTML = `
        <div class="col-12 text-center text-danger py-5">
          <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <p class="fs-5">Error al cargar las solicitudes</p>
        </div>
      `;
    }
  }

  // Función para actualizar el estado de una solicitud
  async function actualizarEstado(id, nuevoEstado) {
    let accion = '';
    let mensaje = '';
    
    if (nuevoEstado === 'Aceptado') {
      accion = 'aceptar';
      mensaje = '¿Estás seguro de aceptar esta solicitud?';
    } else if (nuevoEstado === 'Rechazado') {
      accion = 'rechazar';
      mensaje = '¿Estás seguro de rechazar esta solicitud?';
    } else if (nuevoEstado === 'Completado') {
      accion = 'completar';
      mensaje = '¿Confirmas que el servicio ha sido completado?';
    } else if (nuevoEstado === 'Cancelado') {
      accion = 'cancelar';
      mensaje = '¿Estás seguro de cancelar este servicio? Esta acción no se puede deshacer.';
    }
    
    if (!confirm(mensaje)) {
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
        cargarSolicitudes(); // Recargar la lista
      } else {
        alert(`❌ ${data.message || 'Error al actualizar el estado'}`);
      }
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err);
      alert('❌ Error al conectar con el servidor');
    }
  }
});