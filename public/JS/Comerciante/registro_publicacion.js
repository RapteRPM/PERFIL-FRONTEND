//REGISTRO DE LAS PUBLICACIONES COMERCIANTE 
  async function cargarPublicaciones() {
    try {
      const res = await fetch('/api/publicaciones');
      const publicaciones = await res.json();

      const contenedor = document.querySelector('.grid');
      contenedor.innerHTML = '';

      publicaciones.forEach(pub => {
        const imagen = JSON.parse(pub.ImagenProducto)[0] || 'default.png'; // Primera imagen o placeholder
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('card', 'overflow-hidden', 'shadow-lg');

        tarjeta.innerHTML = `
          <img src="/${imagen}" alt="${pub.NombreProducto}" class="w-full h-56 object-cover rounded-t-lg">
          <div class="p-5 flex flex-col justify-between h-48">
            <div>
              <h5 class="text-xl font-bold mb-1">${pub.NombreProducto}</h5>
              <p class="text-green-400 font-semibold">$${Number(pub.Precio).toLocaleString()}</p>
            </div>
            <div class="flex justify-between gap-2 mt-4">
              <a href="../Natural/Detalle_producto.html?id=${pub.IdPublicacion}" class="btn btn-outline-info btn-sm">Detalle</a>
              <a href="Editar_publicacion.html?id=${pub.IdPublicacion}" class="btn btn-outline-primary btn-sm">Editar</a>
              <button class="btn btn-outline-danger btn-sm" onclick="eliminarPublicacion(${pub.IdPublicacion})">Eliminar</button>
            </div>
          </div>
        `;

        contenedor.appendChild(tarjeta);
      });
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    }
  }

  async function eliminarPublicacion(id) {
    if (!confirm('¿Deseas eliminar esta publicación?')) return;

    try {
      const res = await fetch(`/api/publicaciones/${id}`, { method: 'DELETE' });
      const data = await res.json();
        if (res.ok) {
            alert(data.mensaje);
            cargarPublicaciones(); // recarga las publicaciones después de eliminar
        } else {
        alert('Error al eliminar publicación: ' + data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al eliminar la publicación.');
    }
}

  // Cargar publicaciones al inicio
  cargarPublicaciones();