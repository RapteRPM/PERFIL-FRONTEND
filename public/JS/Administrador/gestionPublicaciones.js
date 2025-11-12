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
    actualizarGrid();
    actualizarContador();
  } catch (error) {
    console.error('Error:', error);
    mostrarError('No se pudieron cargar las publicaciones');
  }
}

// Cargar lista de comercios para el filtro
function cargarComercios() {
  const comercios = [...new Set(publicacionesData.map(p => p.NombreComercio))];
  const select = document.getElementById('filtro-comercio');
  
  comercios.forEach(comercio => {
    const option = document.createElement('option');
    option.value = comercio;
    option.textContent = comercio;
    select.appendChild(option);
  });
}

// Aplicar filtros
function aplicarFiltros() {
  const comercioFiltro = document.getElementById('filtro-comercio').value;
  const estadoFiltro = document.getElementById('filtro-estado').value;
  const busqueda = document.getElementById('buscar-producto').value.toLowerCase();
  
  publicacionesFiltradas = publicacionesData.filter(pub => {
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
  document.getElementById('filtro-comercio').value = '';
  document.getElementById('filtro-estado').value = '';
  document.getElementById('buscar-producto').value = '';
  
  publicacionesFiltradas = [...publicacionesData];
  paginaActual = 1;
  actualizarGrid();
  actualizarContador();
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
    
    return `
      <div class="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden">
        <div class="relative">
          <img src="${imagen}" alt="${pub.NombreProducto}" class="w-full h-48 object-cover">
          <div class="absolute top-2 right-2">
            ${badgeEstado}
          </div>
        </div>
        <div class="p-4">
          <h4 class="font-bold text-lg text-gray-800 mb-2 truncate">${pub.NombreProducto}</h4>
          <p class="text-gray-600 text-sm mb-2">
            <i class="fas fa-store mr-1"></i>${pub.NombreComercio}
          </p>
          <p class="text-blue-600 font-bold text-xl mb-3">$${formatearPrecio(pub.Precio)}</p>
          <button class="btn btn-primary btn-sm w-full" onclick="verDetalles(${pub.IdPublicacion})">
            <i class="fas fa-eye mr-2"></i>Ver Detalles
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  actualizarPaginacion();
}

// Ver detalles de una publicación
async function verDetalles(idPublicacion) {
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
  
  const badgeEstado = publicacion.Estado > 0
    ? '<span class="badge bg-success">Disponible</span>'
    : '<span class="badge bg-danger">Agotado</span>';
  
  const detallesHTML = `
    <div class="row">
      <div class="col-md-5">
        <img src="${imagen}" alt="${publicacion.NombreProducto}" class="img-fluid rounded">
      </div>
      <div class="col-md-7">
        <h3 class="mb-3">${publicacion.NombreProducto}</h3>
        <p><strong>ID:</strong> ${publicacion.IdPublicacion}</p>
        <p><strong>Comerciante:</strong> ${publicacion.NombreComercio}</p>
        <p><strong>Documento Comerciante:</strong> ${publicacion.Comerciante}</p>
        <p><strong>Precio:</strong> <span class="text-primary fs-4">$${formatearPrecio(publicacion.Precio)}</span></p>
        <p><strong>Stock:</strong> ${publicacion.Estado || 0} unidades</p>
        <p><strong>Estado:</strong> ${badgeEstado}</p>
      </div>
    </div>
  `;
  
  document.getElementById('detalles-producto').innerHTML = detallesHTML;
  const modal = new bootstrap.Modal(document.getElementById('modalDetalles'));
  modal.show();
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
