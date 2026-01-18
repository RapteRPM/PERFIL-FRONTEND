async function cargarPublicacionesGrua() {
  try {
    const res = await fetch('/api/publicaciones-grua');
    const publicaciones = await res.json();

    const contenedor = document.querySelector('.grid');
    contenedor.innerHTML = '';
    
    // Obtener el ID del usuario desde localStorage
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    const idUsuario = usuarioActivo ? usuarioActivo.id : null;
    
    if (!idUsuario) {
      console.error('No se encontró el ID del usuario en localStorage');
      return;
    }

    publicaciones.forEach(pub => {
      // Parsear y normalizar imágenes
      let imagenes = [];
      try {
        if (Array.isArray(pub.FotoPublicacion)) {
          imagenes = pub.FotoPublicacion;
        } else if (typeof pub.FotoPublicacion === 'string' && pub.FotoPublicacion.length > 0) {
          imagenes = JSON.parse(pub.FotoPublicacion);
        }
      } catch (e) {
        console.error('Error al parsear FotoPublicacion:', e);
        imagenes = [];
      }
      
      const id = pub.IdPublicacionGrua;
      const titulo = pub.TituloPublicacion || 'Servicio registrado';

      const tarjeta = document.createElement('div');
      tarjeta.classList.add('card', 'overflow-hidden', 'shadow-lg');

      // 🖼️ Carrusel de imágenes
      const carruselId = `carrusel-${id}`;
      
      // Normalizar rutas de imágenes siguiendo la estructura real:
      // /imagen/PrestadorServicios/idUsuario/publicaciones/idPublicacion/nombreArchivo.ext
      const imagenesNormalizadas = imagenes.map(img => {
        let ruta = img.replace(/\\/g, '/').trim();
        
        // Si la imagen ya tiene la ruta completa con "imagen/PrestadorServicios", usarla directamente
        if (ruta.includes('imagen/PrestadorServicios') || ruta.includes('Imagen/PrestadorServicios')) {
          return ruta.startsWith('public/')
            ? '/' + ruta.substring(7)
            : (ruta.startsWith('/') ? ruta : '/' + ruta);
        }
        
        // Extraer nombre de archivo y construir ruta correcta
        const nombreArchivo = ruta.split('/').pop();
        return `/imagen/PrestadorServicios/${idUsuario}/publicaciones/${id}/${nombreArchivo}`;
      });
      
      console.log('🖼️ Imágenes normalizadas para publicación', id, ':', imagenesNormalizadas);
      
      const carrusel = imagenes.length > 0 ? `
        <div id="${carruselId}" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            ${imagenesNormalizadas.map((ruta, index) => `
              <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${ruta}" class="d-block w-full h-56 object-cover rounded-t-lg" alt="Imagen ${index + 1}" onerror="this.src='../General/IMAGENINGRESO/Grua.png'">
              </div>
            `).join('')}
          </div>
          ${imagenes.length > 1 ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#${carruselId}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carruselId}" data-bs-slide="next">
              <span class="carousel-control-next-icon"></span>
            </button>
          ` : ''}
        </div>
      ` : `
        <div class="d-flex justify-center items-center h-56 bg-gray-700">
          <img src="../General/IMAGENINGRESO/Grua.png" class="h-full object-cover" alt="Sin imagen">
        </div>
      `;

      tarjeta.innerHTML = `
        ${carrusel}
        <div class="p-5 flex flex-col justify-between h-auto">
          <div>
            <h5 class="text-xl font-bold mb-1">${titulo}</h5>
            <p class="text-green-400 font-semibold">$${Number(pub.TarifaBase).toLocaleString()}</p>
            <p class="text-gray-300 text-sm mt-1">Cobertura: ${pub.ZonaCobertura}</p>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <a href="../Natural/detalle_publicaciongrua.html?id=${id}&prestador=true" class="btn btn-outline-info btn-sm flex-1">
              <i class="fas fa-eye"></i> Ver Detalles
            </a>
            <a href="Editar_publicacionServicio.html?id=${id}" class="btn btn-outline-primary btn-sm flex-1">
              <i class="fas fa-edit"></i> Editar
            </a>
            <button class="btn btn-outline-danger btn-sm flex-1" onclick="eliminarPublicacionGrua(${id})">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `;

      contenedor.appendChild(tarjeta);
    });
  } catch (error) {
    console.error('Error al cargar publicaciones de grúa:', error);
  }
}


async function eliminarPublicacionGrua(id) {
  if (!confirm('¿Deseas eliminar esta publicación?')) return;

  try {
    const res = await fetch(`/api/publicaciones-grua/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      alert(data.mensaje);
      cargarPublicacionesGrua();
    } else {
      alert('Error al eliminar publicación: ' + data.error);
    }
  } catch (error) {
    console.error(error);
    alert('Ocurrió un error al eliminar la publicación.');
  }
}

// 🚀 Cargar publicaciones al iniciar
cargarPublicacionesGrua();