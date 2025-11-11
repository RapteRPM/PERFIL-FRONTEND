// =========================
// --- VISTA PREVIA DE IMÁGENES ---
// =========================
const inputImagenes = document.getElementById('imagenesProducto');
const preview = document.getElementById('previewImagenes');
let archivosSeleccionados = [];

inputImagenes.addEventListener('change', function (event) {
  archivosSeleccionados = Array.from(event.target.files);
  actualizarInput();
  mostrarVistaPrevia();
});

function mostrarVistaPrevia() {
  preview.innerHTML = '';

  archivosSeleccionados.forEach((archivo, index) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const contenedor = document.createElement('div');
      contenedor.classList.add('position-relative', 'shadow-lg', 'rounded');
      contenedor.style.width = '130px';
      contenedor.style.height = '130px';
      contenedor.style.overflow = 'hidden';
      contenedor.style.border = '1px solid rgba(255,255,255,0.15)';
      contenedor.style.backgroundColor = 'rgba(255,255,255,0.05)';
      contenedor.style.transition = 'transform 0.3s ease';
      contenedor.onmouseover = () => (contenedor.style.transform = 'scale(1.05)');
      contenedor.onmouseout = () => (contenedor.style.transform = 'scale(1)');

      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('rounded');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';

      const botonEliminar = document.createElement('button');
      botonEliminar.innerHTML = '<i class="fas fa-times"></i>';
      botonEliminar.classList.add('btn', 'btn-sm', 'position-absolute');
      botonEliminar.style.top = '6px';
      botonEliminar.style.right = '6px';
      botonEliminar.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
      botonEliminar.style.color = 'white';
      botonEliminar.style.border = 'none';
      botonEliminar.style.borderRadius = '50%';
      botonEliminar.style.width = '26px';
      botonEliminar.style.height = '26px';
      botonEliminar.style.display = 'flex';
      botonEliminar.style.alignItems = 'center';
      botonEliminar.style.justifyContent = 'center';
      botonEliminar.style.cursor = 'pointer';
      botonEliminar.title = 'Eliminar imagen';

      botonEliminar.onclick = function () {
        archivosSeleccionados.splice(index, 1);
        actualizarInput();
        mostrarVistaPrevia();
      };

      contenedor.appendChild(img);
      contenedor.appendChild(botonEliminar);
      preview.appendChild(contenedor);
    };
    reader.readAsDataURL(archivo);
  });
}

function actualizarInput() {
  const dataTransfer = new DataTransfer();
  archivosSeleccionados.forEach(file => dataTransfer.items.add(file));
  inputImagenes.files = dataTransfer.files;
}

// =========================
// --- ENVÍO DEL FORMULARIO ---
// =========================
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombreProducto').value.trim();
  const categoria = document.getElementById('categoriaProducto').value;
  const precio = document.getElementById('precioProducto').value;
  const cantidad = document.getElementById('cantidadProducto').value;
  const descripcion = document.getElementById('descripcionProducto').value.trim();
  const imagenes = document.getElementById('imagenesProducto').files;

  if (!nombre || !categoria || !precio || !cantidad || !descripcion || imagenes.length === 0) {
    alert('Por favor completa todos los campos y selecciona al menos una imagen.');
    return;
  }

  const formData = new FormData();
  formData.append('nombreProducto', nombre);
  formData.append('categoriaProducto', categoria);
  formData.append('precioProducto', precio);
  formData.append('cantidadProducto', cantidad);
  formData.append('descripcionProducto', descripcion);

  // ✅ Aquí está el cambio importante
  for (let i = 0; i < imagenes.length; i++) {
    formData.append('imagenesProducto', imagenes[i]);
  }

  try {
    const response = await fetch('/api/publicar', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ Publicación creada exitosamente.');
      form.reset();
      preview.innerHTML = '';
      archivosSeleccionados = [];
    } else {
      alert('❌ Error al publicar: ' + (data.error || 'Error desconocido.'));
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    alert('❌ Ocurrió un error al enviar los datos.');
  }
});
