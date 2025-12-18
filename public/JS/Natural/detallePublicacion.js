document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const idPublicacion = params.get('id');

  if (!idPublicacion) return console.error('No se proporcionó id de publicación');

  // ===============================
  // 🔄 Ajustar navegación según tipo de usuario
  // ===============================
  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (usuarioActivo && usuarioActivo.tipo === 'Comerciante') {
    // Ocultar carrito
    const linkCarrito = document.getElementById('link-carrito-detalle');
    if (linkCarrito) linkCarrito.style.display = 'none';
    
    // Cambiar enlace de inicio a perfil comerciante
    const linkInicio = document.getElementById('link-inicio-detalle');
    if (linkInicio) linkInicio.href = '../Comerciante/perfil_comerciante.html';
    
    // Ocultar botones de compra (Añadir al carrito y Comprar ahora)
    const btnCarrito = document.getElementById('btn-agregar-carrito');
    const btnComprar = document.getElementById('btn-comprar-ahora');
    if (btnCarrito) btnCarrito.style.display = 'none';
    if (btnComprar) btnComprar.style.display = 'none';
    
    // Ocultar formulario de comentarios (solo visualización)
    const formComentario = document.getElementById('form-comentario');
    if (formComentario) formComentario.style.display = 'none';
  }

  fetch(`/api/detallePublicacion/${idPublicacion}`)
    .then(res => res.json())
    .then(data => {
      const p = data.publicacion;
      const opiniones = data.opiniones;

      // ===============================
      // 🧾 Datos generales del producto
      // ===============================
      document.querySelector('.titulo-producto').textContent = p.NombreProducto;
      document.querySelector('.precio-producto').textContent = `$${Number(p.Precio).toLocaleString()}`;
      document.querySelector('.descripcion-producto').textContent = p.Descripcion;
      document.querySelector('.info-extra small').innerHTML = `Taller: <strong>${p.NombreComercio}</strong>`;

      // ===============================
      // 🖼️ Carrusel de imágenes
      // ===============================
      const imgContainer = document.querySelector('.product-img');
      let imagenes = [];

      if (Array.isArray(p.ImagenProducto)) {
        imagenes = p.ImagenProducto.map(img => img.replace(/\\/g, '/').trim());
      } else if (typeof p.ImagenProducto === 'string') {
        try {
          // Intentar parsear como JSON primero (formato Railway: ["imagen/..."])
          imagenes = JSON.parse(p.ImagenProducto);
        } catch {
          // Si falla, intentar como string separado por comas
          imagenes = p.ImagenProducto.split(',').map(img => img.replace(/\\/g, '/').trim());
        }
      }

      // Si no hay imágenes válidas, usar una por defecto
      if (!imagenes || imagenes.length === 0) {
        imagenes = ['imagen/placeholder.png'];
      }

          // Normalizar rutas y asegurar que sean absolutas
          imagenes = imagenes.map(img => {
            if (!img) return '/imagen/placeholder.png';
            let ruta = img.replace(/\\/g, '/').trim();
            
            // Si ya tiene la ruta completa, retornarla
            if (ruta.startsWith('/imagen/')) return ruta;
            if (ruta.startsWith('imagen/')) return '/' + ruta;
            
            // Si no, construirla
            return '/imagen/' + ruta;
          });

          // Verificar si hay contenedor de imagen
          if (imgContainer) {
            if (imagenes.length > 1) {
              const carouselHTML = `
                <div id="carouselProducto" class="carousel slide" data-bs-ride="carousel">
                  <div class="carousel-inner">
                    ${imagenes.map((src, i) => `
                      <div class="carousel-item ${i === 0 ? 'active' : ''}">
                        <img src="${src}" class="d-block w-100 producto-imagen" alt="Imagen ${i + 1}" onerror="this.src='/imagen/placeholder.png'">
                      </div>
                    `).join('')}
                  </div>
                  <button class="carousel-control-prev" type="button" data-bs-target="#carouselProducto" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon"></span>
                  </button>
                  <button class="carousel-control-next" type="button" data-bs-target="#carouselProducto" data-bs-slide="next">
                    <span class="carousel-control-next-icon"></span>
                  </button>
                </div>
              `;
              imgContainer.parentNode.innerHTML = carouselHTML;
            } else {
              imgContainer.src = imagenes[0];
              imgContainer.classList.add('producto-imagen');
              imgContainer.onerror = () => {
                imgContainer.src = '/imagen/placeholder.png';
              };
            }
          }

      // ===============================
      // ⭐ Calificación promedio
      // ===============================
      const starContainer = document.querySelector('.star-rating');
      const calificacion = Math.round(p.CalificacionPromedio || 0);
      starContainer.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        starContainer.innerHTML += `<i class="bi bi-star${i <= calificacion ? '-fill' : ''} text-warning"></i>`;
      }

      // ===============================
      // �️ Disparar evento para el mapa
      // ===============================
      window.publicacionDetalle = p;
      const evento = new CustomEvent('publicacionCargada', { detail: p });
      window.dispatchEvent(evento);

      // ===============================
      // �💬 Opiniones existentes
      // ===============================
      const opinionesContainer = document.getElementById('opiniones-container');

      const esComerciante = usuarioActivo && usuarioActivo.tipo === 'Comerciante';
      const esDuenoPublicacion = usuarioActivo && p.IdComerciante && usuarioActivo.id == p.IdComerciante;
      
      const comentariosHTML = opiniones.map(op => `
        <div class="comment-box border p-3 mb-3 rounded bg-light" data-opinion-id="${op.IdOpinion}">
          <strong>${op.Nombre} ${op.Apellido}</strong>
          <div class="star-rating mb-1">
            ${[...Array(5)].map((_, i) => `<i class="bi bi-star${i < op.Calificacion ? '-fill' : ''} text-warning"></i>`).join('')}
          </div>
          <p>${op.Comentario}</p>
          <small class="text-muted">${new Date(op.FechaOpinion).toLocaleString()}</small>
          
          ${(esComerciante && esDuenoPublicacion) ? `
            <div class="mt-2">
              <button class="btn btn-sm btn-outline-primary btn-responder" data-opinion-id="${op.IdOpinion}">
                <i class="fas fa-reply"></i> Responder
              </button>
              <div class="respuesta-form mt-2" id="respuesta-form-${op.IdOpinion}" style="display: none;">
                <textarea class="form-control mb-2" placeholder="Escribe tu respuesta..." rows="2"></textarea>
                <button class="btn btn-sm btn-success btn-enviar-respuesta" data-opinion-id="${op.IdOpinion}">Enviar</button>
                <button class="btn btn-sm btn-secondary btn-cancelar-respuesta" data-opinion-id="${op.IdOpinion}">Cancelar</button>
              </div>
            </div>
          ` : ''}
          
          ${op.Respuestas && op.Respuestas.length > 0 ? `
            <div class="respuestas-container mt-3 ps-4 border-start border-primary">
              ${op.Respuestas.map(resp => `
                <div class="respuesta-item mb-2 p-2 bg-white rounded">
                  <strong class="text-primary">${resp.NombreComercio || 'Comerciante'}</strong>
                  <p class="mb-1">${resp.Respuesta}</p>
                  <small class="text-muted">${new Date(resp.FechaRespuesta).toLocaleString()}</small>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
      opinionesContainer.innerHTML = comentariosHTML || '<p class="text-gray-500">No hay comentarios aún.</p>';

      // ===============================
      // 💬 Eventos para responder comentarios (solo comerciantes)
      // ===============================
      if (esComerciante) {
        // Mostrar formulario de respuesta
        document.querySelectorAll('.btn-responder').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const opinionId = e.target.closest('.btn-responder').dataset.opinionId;
            const form = document.getElementById(`respuesta-form-${opinionId}`);
            if (form) {
              form.style.display = form.style.display === 'none' ? 'block' : 'none';
            }
          });
        });

        // Cancelar respuesta
        document.querySelectorAll('.btn-cancelar-respuesta').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const opinionId = e.target.dataset.opinionId;
            const form = document.getElementById(`respuesta-form-${opinionId}`);
            if (form) {
              form.style.display = 'none';
              form.querySelector('textarea').value = '';
            }
          });
        });

        // Enviar respuesta
        document.querySelectorAll('.btn-enviar-respuesta').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const opinionId = e.target.dataset.opinionId;
            const form = document.getElementById(`respuesta-form-${opinionId}`);
            const textarea = form.querySelector('textarea');
            const respuesta = textarea.value.trim();

            if (!respuesta) {
              alert('⚠️ Por favor escribe una respuesta.');
              return;
            }

            try {
              const res = await fetch('/api/opiniones/responder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  idOpinion: opinionId,
                  idComerciante: usuarioActivo.id,
                  respuesta: respuesta
                })
              });

              const data = await res.json();
              if (res.ok) {
                alert('✅ Respuesta enviada correctamente.');
                location.reload();
              } else {
                alert('❌ Error: ' + (data.error || 'No se pudo enviar la respuesta'));
              }
            } catch (err) {
              console.error('Error al enviar respuesta:', err);
              alert('❌ Error de conexión con el servidor.');
            }
          });
        });
      }

      // ===============================
      // 🛒 Botones de acción
      // ===============================
      const btnAgregar = document.querySelector('.btn-primary');
      if (btnAgregar) {
        btnAgregar.addEventListener('click', async () => {
          try {
            if (!usuarioActivo) {
              alert('⚠️ Debes iniciar sesión para agregar productos al carrito.');
              return;
            }

            const response = await fetch('/api/carrito', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idUsuario: usuarioActivo.id,
                idPublicacion: p.IdPublicacion,
                cantidad: 1
              })
            });

            const result = await response.json();
            if (response.ok) {
              alert('🛒 ' + result.msg);
            } else {
              alert(`❌ Error: ${result.msg}`);
            }
          } catch (err) {
            console.error('Error agregando al carrito:', err);
            alert('❌ Ocurrió un error al agregar el producto al carrito.');
          }
        });
      }

const btnComprar = document.querySelector('#btn-comprar-ahora');
if (btnComprar) {
  btnComprar.addEventListener('click', () => {
    // Verificar si hay sesión activa
    const usuarioActivoStr = localStorage.getItem('usuarioActivo');
    
    if (!usuarioActivoStr) {
      alert('Necesita iniciar sesión para hacer esta transacción');
      window.location.href = '/General/Ingreso.html';
      return;
    }

    const producto = {
      id: p.IdPublicacion,
      nombre: p.NombreProducto,
      precio: p.Precio,
      imagen: imagenes[0] || '/imagen/placeholder.png',
      nombreComercio: p.NombreComercio || 'No especificado',
      direccionComercio: p.DireccionComercio || p.Direccion || 'No especificada'
    };

    localStorage.setItem('productoCompra', JSON.stringify(producto));
    window.location.href = '/Natural/Proceso_compra.html';
  });
}
      // ===============================
      // ✍️ Enviar nueva opinión
      // ===============================
      const formComentario = document.getElementById('form-comentario');
      
      // Verificar tipo de usuario y ocultar formulario si es comerciante
      if (usuarioActivo && usuarioActivo.tipo === 'Comerciante') {
        // Ocultar el formulario de nuevos comentarios para comerciantes
        const seccionNuevoComentario = formComentario?.parentElement;
        if (seccionNuevoComentario) {
          seccionNuevoComentario.style.display = 'none';
        }
      }
      
      if (formComentario) {
        formComentario.addEventListener('submit', async (e) => {
          e.preventDefault();

          const comentario = document.getElementById('comentario').value.trim();
          const calificacion = document.getElementById('calificacion').value;

          if (!usuarioActivo) {
            alert('⚠️ Debes iniciar sesión para poder comentar.');
            return;
          }
          
          // Prevenir que comerciantes comenten (doble validación)
          if (usuarioActivo.tipo === 'Comerciante') {
            alert('⚠️ Los comerciantes no pueden dejar comentarios en productos.');
            return;
          }

          if (!comentario || !calificacion) {
            alert('Por favor, escribe un comentario y selecciona una calificación.');
            return;
          }

          try {
            const res = await fetch('/api/opiniones', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                usuarioId: usuarioActivo.id,
                idPublicacion,
                nombreUsuario: usuarioActivo.nombre,
                comentario,
                calificacion
              })
            });

            const data = await res.json();
            if (res.ok) {
              alert('✅ Comentario guardado correctamente.');
              location.reload();
            } else {
              console.error(data.error);
              alert('❌ No se pudo guardar tu comentario.');
            }
          } catch (err) {
            console.error('Error al enviar comentario:', err);
            alert('❌ Error de conexión con el servidor.');
          }
        });
      }
    })
    .catch(err => console.error('Error cargando detalle de publicación:', err));
});