// Gestión de Publicaciones - Administrador
let publicacionesData = [];
let publicacionesFiltradas = [];
let paginaActual = 1;
const publicacionesPorPagina = 12;

// Cargar publicaciones al inicio
document.addEventListener('DOMContentLoaded', () => {
  cargarPublicaciones();
  
  // Event listeners
  document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
  document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
  document.getElementById('buscar-producto').addEventListener('input', aplicarFiltros);
  document.getElementById('filtro-tipo-usuario').addEventListener('change', filtrarPorTipoUsuario);
});

// Cargar todas las publicaciones desde el backend
async function cargarPublicaciones() {
  try {
    const response = await fetch('/api/admin/publicaciones');
    if (!response.ok) {
      throw new Error('Error al cargar publicaciones');
    }
    
    const data = await response.json();
    publicacionesData = data.publicaciones || [];
    publicacionesFiltradas = [...publicacionesData];
    
    cargarComercios();
    
    // Aplicar filtro de comercio por defecto
    filtrarPorTipoUsuario();
  } catch (error) {
    console.error('Error:', error);
    mostrarError('No se pudieron cargar las publicaciones');
  }
}

// Cargar lista de comercios para el filtro
function cargarComercios() {
  const comercios = [...new Set(publicacionesData.map(p => p.NombreComercio))];
  const select = document.getElementById('filtro-comercio');
  
  // Limpiar opciones anteriores excepto la primera
  select.innerHTML = '<option value="">Todos</option>';
  
  comercios.forEach(comercio => {
    const option = document.createElement('option');
    option.value = comercio;
    option.textContent = comercio;
    select.appendChild(option);
  });
}

// Filtrar por tipo de usuario (Comercio o Grúa)
function filtrarPorTipoUsuario() {
  const tipoUsuario = document.getElementById('filtro-tipo-usuario').value;
  const select = document.getElementById('filtro-comercio');
  const label = document.getElementById('label-filtro-comercio');
  
  // Actualizar la etiqueta según el tipo
  if (tipoUsuario === 'Comercio') {
    label.textContent = 'Comercio';
  } else if (tipoUsuario === 'Grua') {
    label.textContent = 'Grúa';
  }
  
  // Filtrar publicaciones según el tipo
  let publicacionesPorTipo = publicacionesData.filter(p => {
    if (tipoUsuario === 'Comercio') {
      // Verificar si es un comercio
      return p.TipoUsuario === 'Comerciante' || p.TipoUsuario === 'Comercio' || !p.EsGrua;
    } else if (tipoUsuario === 'Grua') {
      // Verificar si es una grúa
      return p.TipoUsuario === 'PrestadorServicios' || p.TipoUsuario === 'Grua' || p.EsGrua;
    }
    return true;
  });
  
  // Actualizar el select de comercios/grúas con los datos filtrados
  const comercios = [...new Set(publicacionesPorTipo.map(p => p.NombreComercio))];
  select.innerHTML = '<option value="">Todos</option>';
  
  comercios.forEach(comercio => {
    const option = document.createElement('option');
    option.value = comercio;
    option.textContent = comercio;
    select.appendChild(option);
  });
  
  // Aplicar filtros
  aplicarFiltros();
}

// Aplicar filtros
function aplicarFiltros() {
  const tipoUsuarioFiltro = document.getElementById('filtro-tipo-usuario').value;
  const comercioFiltro = document.getElementById('filtro-comercio').value;
  const estadoFiltro = document.getElementById('filtro-estado').value;
  const busqueda = document.getElementById('buscar-producto').value.toLowerCase();
  
  publicacionesFiltradas = publicacionesData.filter(pub => {
    // Filtro por tipo de usuario
    if (tipoUsuarioFiltro) {
      if (tipoUsuarioFiltro === 'Comercio') {
        if (pub.TipoUsuario === 'PrestadorServicios' || pub.TipoUsuario === 'Grua' || pub.EsGrua) {
          return false;
        }
      } else if (tipoUsuarioFiltro === 'Grua') {
        if (!(pub.TipoUsuario === 'PrestadorServicios' || pub.TipoUsuario === 'Grua' || pub.EsGrua)) {
          return false;
        }
      }
    }
    
    // Filtro por comercio
    if (comercioFiltro && pub.NombreComercio !== comercioFiltro) {
      return false;
    }
    
    // Filtro por estado
    if (estadoFiltro && pub.Estado !== estadoFiltro) {
      return false;
    }
    
    // Búsqueda por nombre
    if (busqueda && !pub.NombreProducto.toLowerCase().includes(busqueda)) {
      return false;
    }
    
    return true;
  });
  
  paginaActual = 1;
  actualizarGrid();
  actualizarContador();
}

// Limpiar filtros
function limpiarFiltros() {
  document.getElementById('filtro-tipo-usuario').value = 'Comercio';
  document.getElementById('filtro-comercio').value = '';
  document.getElementById('filtro-estado').value = '';
  document.getElementById('buscar-producto').value = '';
  
  // Volver a filtrar por comercio (valor por defecto)
  filtrarPorTipoUsuario();
}

// Actualizar grid de publicaciones
function actualizarGrid() {
  const grid = document.getElementById('grid-publicaciones');
  const inicio = (paginaActual - 1) * publicacionesPorPagina;
  const fin = inicio + publicacionesPorPagina;
  const publicacionesPagina = publicacionesFiltradas.slice(inicio, fin);
  
  if (publicacionesPagina.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        <i class="fas fa-box-open text-6xl mb-4"></i>
        <p class="text-xl">No se encontraron publicaciones</p>
      </div>
    `;
    actualizarPaginacion();
    return;
  }
  
    grid.innerHTML = publicacionesPagina.map(pub => {
    // Parsear el array de imágenes
    let imagen = '/image/imagen_perfil.png';
    if (pub.ImagenPrincipal) {
      try {
        const imagenes = JSON.parse(pub.ImagenPrincipal);
        if (Array.isArray(imagenes) && imagenes.length > 0) {
          imagen = '/' + imagenes[0];
        }
      } catch (e) {
        // Si no es JSON, usar como está
        imagen = pub.ImagenPrincipal ? '/' + pub.ImagenPrincipal : '/image/imagen_perfil.png';
      }
    }
    
    const badgeEstado = pub.Estado > 0
      ? '<span class="badge bg-success">Disponible</span>'
      : '<span class="badge bg-danger">Agotado</span>';
    
    // Determinar el tipo de publicación para mostrar el badge
    const esGrua = pub.TipoUsuario === 'PrestadorServicios' || pub.TipoUsuario === 'Grua' || pub.EsGrua;
    const badgeTipo = esGrua 
      ? '<span class="badge bg-info text-white"><i class="fas fa-truck mr-1"></i>Grúa</span>'
      : '<span class="badge bg-warning text-dark"><i class="fas fa-store mr-1"></i>Comercio</span>';
    
    return `
      <div class="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden">
        <div class="relative">
          <img src="${imagen}" alt="${pub.NombreProducto}" class="w-full h-48 object-cover">
          <div class="absolute top-2 right-2">
            ${badgeEstado}
          </div>
          <div class="absolute top-2 left-2">
            ${badgeTipo}
          </div>
        </div>
        <div class="p-4">
          <h4 class="font-bold text-lg text-gray-800 mb-2 truncate">${pub.NombreProducto}</h4>
          <p class="text-gray-600 text-sm mb-2">
            <i class="fas ${esGrua ? 'fa-truck' : 'fa-store'} mr-1"></i>${pub.NombreComercio}
          </p>
          <p class="text-blue-600 font-bold text-xl mb-3">$${formatearPrecio(pub.Precio)}</p>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn btn-primary btn-sm" onclick="verDetalles(${pub.IdPublicacion}, ${esGrua})">
              <i class="fas fa-eye mr-1"></i>Ver
            </button>
            <button class="btn btn-danger btn-sm" onclick="abrirModalEliminar(${pub.IdPublicacion}, ${esGrua})">
              <i class="fas fa-trash mr-1"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  actualizarPaginacion();
}

// Ver detalles de una publicación (redirigir a la página de detalle)
function verDetalles(idPublicacion, esGrua) {
  if (esGrua) {
    // Redirigir a la página de detalle de grúa
    window.location.href = `/Natural/detalle_publicaciongrua.html?id=${idPublicacion}`;
  } else {
    // Redirigir a la página de detalle del producto
    window.location.href = `/Natural/Detalle_producto.html?id=${idPublicacion}`;
  }
}

// Abrir modal para eliminar publicación
function abrirModalEliminar(idPublicacion, esGrua) {
  const publicacion = publicacionesData.find(p => p.IdPublicacion === idPublicacion);
  if (!publicacion) return;
  
  // Parsear el array de imágenes
  let imagen = '/image/imagen_perfil.png';
  if (publicacion.ImagenPrincipal) {
    try {
      const imagenes = JSON.parse(publicacion.ImagenPrincipal);
      if (Array.isArray(imagenes) && imagenes.length > 0) {
        imagen = '/' + imagenes[0];
      }
    } catch (e) {
      imagen = publicacion.ImagenPrincipal ? '/' + publicacion.ImagenPrincipal : '/image/imagen_perfil.png';
    }
  }
  
  const tipoIcono = esGrua ? 'fa-truck' : 'fa-store';
  const tipoTexto = esGrua ? 'Grúa' : 'Comercio';
  
  const infoHTML = `
    <div class="d-flex align-items-center">
      <img src="${imagen}" alt="${publicacion.NombreProducto}" class="rounded" style="width: 80px; height: 80px; object-fit: cover;">
      <div class="ms-3">
        <h6 class="mb-1 fw-bold">${publicacion.NombreProducto}</h6>
        <p class="mb-0 text-muted small">
          <i class="fas ${tipoIcono} mr-1"></i>${publicacion.NombreComercio} <span class="badge bg-${esGrua ? 'info' : 'warning'}">${tipoTexto}</span><br>
          <i class="fas fa-dollar-sign mr-1"></i>$${formatearPrecio(publicacion.Precio)}
        </p>
      </div>
    </div>
  `;
  
  document.getElementById('info-publicacion-eliminar').innerHTML = infoHTML;
  document.getElementById('observacion-eliminacion').value = '';
  
  // Guardar el ID y el tipo en el botón
  const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
  btnConfirmar.onclick = () => eliminarPublicacion(idPublicacion, esGrua);
  
  const modal = new bootstrap.Modal(document.getElementById('modalEliminar'));
  modal.show();
}

// Eliminar publicación
async function eliminarPublicacion(idPublicacion, esGrua) {
  const observacion = document.getElementById('observacion-eliminacion').value.trim();
  
  if (!observacion) {
    alert('Por favor, ingresa el motivo de la eliminación');
    return;
  }
  
  const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
  const textoOriginal = btnConfirmar.innerHTML;
  btnConfirmar.disabled = true;
  btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Eliminando...';
  
  try {
    const response = await fetch(`/api/admin/publicacion/${idPublicacion}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ observacion, esGrua })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar publicación');
    }
    
    const data = await response.json();
    
    // Cerrar modal
    bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
    
    // Mostrar mensaje de éxito
    const tipoUsuario = esGrua ? 'prestador de servicio' : 'comerciante';
    alert(`Publicación eliminada correctamente. Se ha enviado un correo al ${tipoUsuario}.`);
    
    // Recargar publicaciones
    cargarPublicaciones();
    
  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = textoOriginal;
  }
}

// Formatear precio
function formatearPrecio(precio) {
  return Number(precio).toLocaleString('es-CO');
}

// Actualizar paginación
function actualizarPaginacion() {
  const totalPaginas = Math.ceil(publicacionesFiltradas.length / publicacionesPorPagina);
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
  const totalPaginas = Math.ceil(publicacionesFiltradas.length / publicacionesPorPagina);
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
    paginaActual = nuevaPagina;
    actualizarGrid();
    window.scrollTo(0, 0);
  }
}

// Actualizar contador
function actualizarContador() {
  document.getElementById('total-publicaciones').textContent = publicacionesFiltradas.length;
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
  alert(mensaje); // Temporal
}
