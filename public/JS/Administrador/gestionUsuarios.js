// Gestión de Usuarios - Administrador
let usuariosData = [];
let usuariosFiltrados = [];
let paginaActual = 1;
const usuariosPorPagina = 10;
let accionPendiente = null;

// Cargar usuarios al inicio
document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
  
  // Event listeners para filtros
  document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
  document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
  
  // Búsqueda en tiempo real
  document.getElementById('buscar-usuario').addEventListener('input', aplicarFiltros);
  
  // Confirmar acción en modal
  document.getElementById('btnConfirmarAccion').addEventListener('click', ejecutarAccionPendiente);
});

// Cargar todos los usuarios desde el backend
async function cargarUsuarios() {
  try {
    const response = await fetch('/api/admin/usuarios');
    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }
    
    const data = await response.json();
    usuariosData = data.usuarios || [];
    usuariosFiltrados = [...usuariosData];
    
    actualizarTabla();
    actualizarContador();
  } catch (error) {
    console.error('Error:', error);
    mostrarError('No se pudieron cargar los usuarios');
  }
}

// Aplicar filtros
function aplicarFiltros() {
  const tipoFiltro = document.getElementById('filtro-tipo').value;
  const estadoFiltro = document.getElementById('filtro-estado').value;
  const busqueda = document.getElementById('buscar-usuario').value.toLowerCase();
  
  usuariosFiltrados = usuariosData.filter(usuario => {
    // Filtro por tipo
    if (tipoFiltro && usuario.TipoUsuario !== tipoFiltro) {
      return false;
    }
    
    // Filtro por estado
    if (estadoFiltro && usuario.Estado !== estadoFiltro) {
      return false;
    }
    
    // Búsqueda por nombre, apellido o documento
    if (busqueda) {
      const nombreCompleto = `${usuario.Nombre} ${usuario.Apellido}`.toLowerCase();
      const documento = usuario.Documento.toLowerCase();
      const correo = usuario.Correo.toLowerCase();
      
      if (!nombreCompleto.includes(busqueda) && 
          !documento.includes(busqueda) && 
          !correo.includes(busqueda)) {
        return false;
      }
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
  document.getElementById('filtro-estado').value = '';
  document.getElementById('buscar-usuario').value = '';
  
  usuariosFiltrados = [...usuariosData];
  paginaActual = 1;
  actualizarTabla();
  actualizarContador();
}

// Actualizar tabla con usuarios filtrados
function actualizarTabla() {
  const tbody = document.getElementById('tabla-usuarios');
  const inicio = (paginaActual - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(inicio, fin);
  
  if (usuariosPagina.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-gray-500">
          <i class="fas fa-users-slash text-4xl mb-2"></i>
          <p>No se encontraron usuarios</p>
        </td>
      </tr>
    `;
    actualizarPaginacion();
    return;
  }
  
  tbody.innerHTML = usuariosPagina.map(usuario => {
    const badgeEstado = usuario.Estado === 'Activo' 
      ? '<span class="badge bg-success">Activo</span>'
      : '<span class="badge bg-danger">Inactivo</span>';
    
    const badgeTipo = getBadgeTipo(usuario.TipoUsuario);
    
    return `
      <tr data-usuario-id="${usuario.IdUsuario}">
        <td>${usuario.IdUsuario}</td>
        <td>${badgeTipo}</td>
        <td>${usuario.Nombre} ${usuario.Apellido}</td>
        <td>${usuario.Documento}</td>
        <td>${usuario.Correo}</td>
        <td>${usuario.Telefono}</td>
        <td>${badgeEstado}</td>
        <td>
          <div class="btn-group" role="group">
            ${usuario.Estado === 'Activo' 
              ? `<button class="btn btn-sm btn-warning" onclick="toggleEstado(${usuario.IdUsuario}, 'Inactivo')" title="Desactivar">
                   <i class="fas fa-ban"></i>
                 </button>`
              : `<button class="btn btn-sm btn-success" onclick="toggleEstado(${usuario.IdUsuario}, 'Activo')" title="Activar">
                   <i class="fas fa-check"></i>
                 </button>`
            }
            <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.IdUsuario})" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  actualizarPaginacion();
}

// Obtener badge según tipo de usuario
function getBadgeTipo(tipo) {
  const badges = {
    'Natural': '<span class="badge bg-primary">Natural</span>',
    'Comerciante': '<span class="badge bg-info">Comerciante</span>',
    'PrestadorServicio': '<span class="badge bg-warning">Prestador</span>',
    'Administrador': '<span class="badge bg-dark">Admin</span>'
  };
  return badges[tipo] || '<span class="badge bg-secondary">Otro</span>';
}

// Actualizar paginación
function actualizarPaginacion() {
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
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
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
    paginaActual = nuevaPagina;
    actualizarTabla();
    window.scrollTo(0, 0);
  }
}

// Actualizar contador
function actualizarContador() {
  document.getElementById('total-usuarios').textContent = usuariosFiltrados.length;
}

// Toggle estado del usuario (Activar/Desactivar)
function toggleEstado(idUsuario, nuevoEstado) {
  const usuario = usuariosData.find(u => u.IdUsuario === idUsuario);
  if (!usuario) return;
  
  const accion = nuevoEstado === 'Activo' ? 'activar' : 'desactivar';
  const titulo = `${accion === 'activar' ? 'Activar' : 'Desactivar'} Usuario`;
  const mensaje = `¿Está seguro de ${accion} al usuario <strong>${usuario.Nombre} ${usuario.Apellido}</strong>?`;
  
  mostrarModalConfirmacion(titulo, mensaje, async () => {
    try {
      const response = await fetch(`/api/admin/usuario/${idUsuario}/toggle-estado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }
      
      // Actualizar en el array local
      usuario.Estado = nuevoEstado;
      actualizarTabla();
      
      mostrarExito(`Usuario ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error:', error);
      mostrarError('No se pudo cambiar el estado del usuario');
    }
  });
}

// Eliminar usuario
function eliminarUsuario(idUsuario) {
  const usuario = usuariosData.find(u => u.IdUsuario === idUsuario);
  if (!usuario) return;
  
  const titulo = 'Eliminar Usuario';
  const mensaje = `
    <div class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      Esta acción es <strong>irreversible</strong>
    </div>
    <p>¿Está seguro de eliminar permanentemente al usuario <strong>${usuario.Nombre} ${usuario.Apellido}</strong>?</p>
    <p class="text-muted">Se eliminarán todos sus datos asociados.</p>
  `;
  
  mostrarModalConfirmacion(titulo, mensaje, async () => {
    try {
      const response = await fetch(`/api/admin/usuario/${idUsuario}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }
      
      // Eliminar del array local
      usuariosData = usuariosData.filter(u => u.IdUsuario !== idUsuario);
      usuariosFiltrados = usuariosFiltrados.filter(u => u.IdUsuario !== idUsuario);
      
      actualizarTabla();
      actualizarContador();
      
      mostrarExito('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      mostrarError('No se pudo eliminar el usuario');
    }
  });
}

// Mostrar modal de confirmación
function mostrarModalConfirmacion(titulo, mensaje, callback) {
  document.getElementById('modalTitulo').textContent = titulo;
  document.getElementById('modalMensaje').innerHTML = mensaje;
  
  accionPendiente = callback;
  
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmar'));
  modal.show();
}

// Ejecutar acción pendiente
function ejecutarAccionPendiente() {
  if (accionPendiente) {
    accionPendiente();
    accionPendiente = null;
  }
  
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmar'));
  modal.hide();
}

// Mostrar mensaje de éxito
function mostrarExito(mensaje) {
  // Implementar toast o alert de Bootstrap
  alert(mensaje); // Temporal
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
  // Implementar toast o alert de Bootstrap
  alert(mensaje); // Temporal
}
