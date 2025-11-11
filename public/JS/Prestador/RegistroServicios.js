async function cargarPublicacionesGrua() {
  try {
    const res = await fetch('/api/publicaciones-grua');
    const publicaciones = await res.json();

    const contenedor = document.querySelector('.grid');
    contenedor.innerHTML = '';

    publicaciones.forEach(pub => {
      const imagenes = JSON.parse(pub.FotoPublicacion || '[]');
      const id = pub.IdPublicacionGrua;
      const titulo = pub.TituloPublicacion || 'Servicio registrado';

      const tarjeta = document.createElement('div');
      tarjeta.classList.add('card', 'overflow-hidden', 'shadow-lg');

      // 🖼️ Carrusel de imágenes
      const carruselId = `carrusel-${id}`;
      const carrusel = `
        <div id="${carruselId}" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            ${imagenes.map((ruta, index) => `
              <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="/${ruta}" class="d-block w-full h-56 object-cover rounded-t-lg" alt="Imagen ${index + 1}">
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
      `;

      tarjeta.innerHTML = `
        ${carrusel}
        <div class="p-5 flex flex-col justify-between h-48">
          <div>
            <h5 class="text-xl font-bold mb-1">${titulo}</h5>
            <p class="text-green-400 font-semibold">$${Number(pub.TarifaBase).toLocaleString()}</p>
            <p class="text-gray-300 text-sm mt-1">Cobertura: ${pub.ZonaCobertura}</p>
          </div>
          <div class="flex justify-between mt-4">
            <a href="editar_publicacionServicio.html?id=${id}" class="btn btn-outline-primary btn-sm">Editar</a>
            <button class="btn btn-outline-danger btn-sm" onclick="eliminarPublicacionGrua(${id})">Eliminar</button>
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