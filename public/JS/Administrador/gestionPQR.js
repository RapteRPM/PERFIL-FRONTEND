// Gestión de PQR - Administrador
let pqrData = [];
let pqrFiltradas = [];
let paginaActual = 1;
const pqrPorPagina = 10;

// Cargar PQR al inicio
document.addEventListener('DOMContentLoaded', () => {
  cargarPQR();
  
  // Event listeners
  document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
  document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
  document.getElementById('buscar-asunto').addEventListener('input', aplicarFiltros);
  document.getElementById('filtro-perfil').addEventListener('input', aplicarFiltros);
  
  // Listener para el checkbox de respondidas
  const filtroRespondidas = document.getElementById('filtro-respondidas');
  if (filtroRespondidas) {
    filtroRespondidas.addEventListener('change', aplicarFiltros);
  }
});

// Cargar todas las PQR desde el backend
async function cargarPQR() {
  try {
    const response = await fetch('/api/admin/pqr');
    if (!response.ok) {
      throw new Error('Error al cargar PQR');
    }
    
    const data = await response.json();
    pqrData = data.pqrs || [];
    pqrFiltradas = [...pqrData];
    
    actualizarTabla();
    actualizarContador();
  } catch (error) {
    console.error('Error:', error);
    mostrarError('No se pudieron cargar las PQR');
  }
}

// Aplicar filtros
function aplicarFiltros() {
  const tipoFiltro = document.getElementById('filtro-tipo').value;
  const rolFiltro = document.getElementById('filtro-rol').value;
  const perfilFiltro = document.getElementById('filtro-perfil').value.toLowerCase();
  const asuntoBusqueda = document.getElementById('buscar-asunto').value.toLowerCase();
  const soloRespondidas = document.getElementById('filtro-respondidas') && document.getElementById('filtro-respondidas').checked;
  
  pqrFiltradas = pqrData.filter(pqr => {
    // Filtro por tipo de solicitud
    if (tipoFiltro && pqr.TipoSolicitud !== tipoFiltro) {
      return false;
    }
    
    // Filtro por rol
    if (rolFiltro && pqr.Rol !== rolFiltro) {
      return false;
    }
    
    // Filtro por perfil (email)
    if (perfilFiltro && !(pqr.Perfil || '').toLowerCase().includes(perfilFiltro)) {
      return false;
    }
    
    // Búsqueda por asunto
    if (asuntoBusqueda && !(pqr.Asunto || '').toLowerCase().includes(asuntoBusqueda)) {
      return false;
    }
    
    // Filtro por respondidas
    if (soloRespondidas) {
      const val = pqr.Respondida;
      const isRespondida = val === true || val === 1 || val === '1' || String(val).toLowerCase() === 'true';
      if (!isRespondida) return false;
    }
    
    return true;
  });
  
  paginaActual = 1;
  actualizarTabla();
  actualizarContador();
}

// Limpiar filtros
function limpiarFiltros() {
  document.getElementById('filtro-tipo').value = '';
  document.getElementById('filtro-rol').value = '';
  document.getElementById('filtro-perfil').value = '';
  document.getElementById('buscar-asunto').value = '';
  if (document.getElementById('filtro-respondidas')) {
    document.getElementById('filtro-respondidas').checked = false;
  }
  
  pqrFiltradas = [...pqrData];
  paginaActual = 1;
  actualizarTabla();
  actualizarContador();
}

// Actualizar tabla con PQR filtradas
function actualizarTabla() {
  const tbody = document.getElementById('tabla-pqr');
  const inicio = (paginaActual - 1) * pqrPorPagina;
  const fin = inicio + pqrPorPagina;
  const pqrPagina = pqrFiltradas.slice(inicio, fin);
  
  if (pqrPagina.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p>No se encontraron PQR</p>
        </td>
      </tr>
    `;
    actualizarPaginacion();
    return;
  }
  
  tbody.innerHTML = pqrPagina.map(pqr => {
    const badgeTipo = getBadgeTipo(pqr.TipoSolicitud);
    const badgeRol = getBadgeRol(pqr.Rol);
    const fecha = pqr.FechaCreacion && pqr.FechaCreacion !== 'N/A' ? formatearFecha(pqr.FechaCreacion) : 'No disponible';
    
    // Verificar si está respondida
    const val = pqr.Respondida;
    const isRespondida = val === true || val === 1 || val === '1' || String(val).toLowerCase() === 'true';
    const checkedAttr = isRespondida ? 'checked' : '';
    
    return `
      <tr>
        <td>${pqr.IdCentroAyuda}</td>
        <td>${badgeTipo}</td>
        <td>${badgeRol}</td>
        <td>${pqr.Perfil || ''}</td>
        <td class="text-truncate" style="max-width: 250px;" title="${pqr.Asunto || ''}">
          ${pqr.Asunto || ''}
        </td>
        <td>${fecha}</td>
        <td class="text-center">
          <input type="checkbox" disabled ${checkedAttr}>
        </td>
        <td>
          <button class="btn btn-sm btn-info" onclick="verDetallesPQR(${pqr.IdCentroAyuda})" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  actualizarPaginacion();
}

// Obtener badge según tipo de solicitud
function getBadgeTipo(tipo) {
  const badges = {
    'Queja': '<span class="badge bg-danger">Queja</span>',
    'Reclamo': '<span class="badge bg-warning">Reclamo</span>',
    'Sugerencia': '<span class="badge bg-info">Sugerencia</span>'
  };
  return badges[tipo] || '<span class="badge bg-secondary">' + tipo + '</span>';
}

// Obtener badge según rol
function getBadgeRol(rol) {
  const badges = {
    'Usuario Natural': '<span class="badge bg-primary">Natural</span>',
    'natural': '<span class="badge bg-primary">Natural</span>',
    'Comerciante': '<span class="badge bg-info">Comerciante</span>',
    'comerciante': '<span class="badge bg-info">Comerciante</span>',
    'Prestador de Servicios': '<span class="badge bg-warning">Prestador</span>',
    'prestador': '<span class="badge bg-warning">Prestador</span>'
  };
  return badges[rol] || '<span class="badge bg-secondary">' + rol + '</span>';
}

// Formatear fecha
function formatearFecha(fecha) {
  if (!fecha || fecha === 'N/A') return 'No disponible';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return 'No disponible';
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Ver detalles de una PQR
let pqrActual = null;

function verDetallesPQR(idPQR) {
  const pqr = pqrData.find(p => p.IdCentroAyuda === idPQR);
  if (!pqr) return;
  
  pqrActual = pqr; // Guardar la PQR actual para responder
  
  const badgeTipo = getBadgeTipo(pqr.TipoSolicitud);
  const badgeRol = getBadgeRol(pqr.Rol);
  const fecha = pqr.FechaCreacion && pqr.FechaCreacion !== 'N/A' ? formatearFecha(pqr.FechaCreacion) : 'No disponible';
  
  // Verificar si está respondida
  const val = pqr.Respondida;
  const isRespondida = val === true || val === 1 || val === '1' || String(val).toLowerCase() === 'true';
  
  let respuestaHTML = '';
  if (isRespondida && pqr.Respuesta) {
    const fechaRespuesta = pqr.FechaRespuesta ? formatearFecha(pqr.FechaRespuesta) : 'No disponible';
    respuestaHTML = `
      <div class="mb-3">
        <h6 class="text-muted">Respuesta del Administrador</h6>
        <hr>
        <p><strong>Fecha de respuesta:</strong> ${fechaRespuesta}</p>
        <div class="alert alert-success" style="white-space: pre-wrap;">
          <i class="fas fa-check-circle"></i> <strong>Respuesta:</strong><br>
          ${pqr.Respuesta}
        </div>
      </div>
    `;
  }
  
  const detallesHTML = `
    <div class="mb-3">
      <h6 class="text-muted">Información General</h6>
      <hr>
      <p><strong>ID:</strong> ${pqr.IdCentroAyuda}</p>
      <p><strong>Tipo:</strong> ${badgeTipo}</p>
      <p><strong>Rol:</strong> ${badgeRol}</p>
      <p><strong>Usuario:</strong> ${pqr.NombreUsuario || 'No disponible'}</p>
      <p><strong>Perfil (Email):</strong> ${pqr.Perfil || 'No disponible'}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Estado:</strong> ${isRespondida ? '<span class="badge bg-success">Respondida</span>' : '<span class="badge bg-warning">Pendiente</span>'}</p>
    </div>
    
    <div class="mb-3">
      <h6 class="text-muted">Detalles de la Solicitud</h6>
      <hr>
      <p><strong>Asunto:</strong></p>
      <p class="bg-light p-3 rounded">${pqr.Asunto}</p>
      
      <p class="mt-3"><strong>Descripción:</strong></p>
      <div class="bg-light p-3 rounded" style="white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
        ${pqr.Descripcion}
      </div>
    </div>
    
    ${respuestaHTML}
  `;
  
  document.getElementById('detalles-pqr-contenido').innerHTML = detallesHTML;
  
  // Mostrar/ocultar botón de responder
  const btnResponder = document.getElementById('btn-responder-pqr');
  if (isRespondida) {
    btnResponder.style.display = 'none';
  } else {
    btnResponder.style.display = 'inline-block';
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalDetallesPQR'));
  modal.show();
}

// Mostrar formulario de respuesta
function mostrarFormularioRespuesta() {
  if (!pqrActual) return;
  
  const badgeTipo = getBadgeTipo(pqrActual.TipoSolicitud);
  
  const infoHTML = `
    <p><strong>ID:</strong> ${pqrActual.IdCentroAyuda}</p>
    <p><strong>Tipo:</strong> ${badgeTipo}</p>
    <p><strong>Usuario:</strong> ${pqrActual.NombreUsuario || 'No disponible'}</p>
    <p><strong>Email:</strong> ${pqrActual.Perfil || 'No disponible'}</p>
    <p><strong>Asunto:</strong> ${pqrActual.Asunto}</p>
  `;
  
  document.getElementById('info-pqr-respuesta').innerHTML = infoHTML;
  document.getElementById('id-pqr-respuesta').value = pqrActual.IdCentroAyuda;
  document.getElementById('respuesta-texto').value = '';
  
  // Cerrar modal de detalles y abrir modal de respuesta
  const modalDetalles = bootstrap.Modal.getInstance(document.getElementById('modalDetallesPQR'));
  if (modalDetalles) modalDetalles.hide();
  
  const modalResponder = new bootstrap.Modal(document.getElementById('modalResponderPQR'));
  modalResponder.show();
}

// Enviar respuesta
async function enviarRespuesta() {
  const idPQR = document.getElementById('id-pqr-respuesta').value;
  const respuesta = document.getElementById('respuesta-texto').value.trim();
  
  if (!respuesta) {
    alert('Por favor escribe una respuesta');
    return;
  }
  
  try {
    const response = await fetch('/api/admin/pqr/responder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idPQR, respuesta })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalResponderPQR'));
      if (modal) modal.hide();
      
      // Mostrar mensaje de éxito
      const mensaje = data.emailSent 
        ? 'Respuesta enviada correctamente y notificación enviada por correo' 
        : 'Respuesta guardada correctamente (no se pudo enviar correo)';
      
      alert('✅ ' + mensaje);
      
      // Recargar PQR
      await cargarPQR();
    } else {
      throw new Error(data.error || 'Error al enviar respuesta');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al enviar respuesta: ' + error.message);
  }
}

// Actualizar paginación
function actualizarPaginacion() {
  const totalPaginas = Math.ceil(pqrFiltradas.length / pqrPorPagina);
  const paginacion = document.getElementById('paginacion');
  
  if (totalPaginas <= 1) {
    paginacion.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Botón anterior
  html += `
    <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">
        <i class="fas fa-chevron-left"></i>
      </a>
    </li>
  `;
  
  // Números de página
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
      html += `
        <li class="page-item ${i === paginaActual ? 'active' : ''}">
          <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
        </li>
      `;
    } else if (i === paginaActual - 2 || i === paginaActual + 2) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }
  
  // Botón siguiente
  html += `
    <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">
        <i class="fas fa-chevron-right"></i>
      </a>
    </li>
  `;
  
  paginacion.innerHTML = html;
}

// Cambiar página
function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(pqrFiltradas.length / pqrPorPagina);
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
    paginaActual = nuevaPagina;
    actualizarTabla();
    window.scrollTo(0, 0);
  }
}

// Actualizar contador
function actualizarContador() {
  document.getElementById('total-pqr').textContent = pqrFiltradas.length;
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
  alert(mensaje); // Temporal
}
