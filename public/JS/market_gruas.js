document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("listadoGruas");

  try {
    const res = await fetch("/api/marketplace-gruas");
    const data = await res.json();

    if (!Array.isArray(data)) return;

    contenedor.innerHTML = "";

    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "col-md-4";

      let imagenes = [];
      
      // Parsear las imágenes
      if (Array.isArray(item.FotoPublicacion)) {
        imagenes = item.FotoPublicacion;
      } else if (typeof item.FotoPublicacion === 'string' && item.FotoPublicacion.length > 0) {
        try {
          imagenes = JSON.parse(item.FotoPublicacion);
        } catch (e) {
          imagenes = [item.FotoPublicacion];
        }
      }
      
      // Normalizar rutas de imágenes
      let imagenSrc = "../General/IMAGENINGRESO/Grua.png";
      if (imagenes.length > 0) {
        let ruta = imagenes[0].replace(/\\/g, '/').trim();
        
        // Eliminar "public/" si está al inicio
        if (ruta.startsWith('public/')) {
          ruta = ruta.substring(7); // Quitar "public/"
        }
        
        // Si no empieza con /, agregarlo
        if (!ruta.startsWith('/')) {
          ruta = '/' + ruta;
        }
        
        console.log("🖼️ Ruta de imagen procesada:", ruta);
        imagenSrc = ruta;
      }

      card.innerHTML = `
        <div class="card card-grua h-100">
          <img src="${imagenSrc}" class="card-img-top" alt="Servicio de grúa" onerror="this.src='../General/IMAGENINGRESO/Grua.png'">
          <div class="card-body">
            <h5 class="card-title fw-bold">${item.TituloPublicacion}</h5>
            <p class="card-text">${item.DescripcionServicio}</p>
            <p class="card-text"><strong>Zona:</strong> ${item.ZonaCobertura}</p>
            <a href="../Natural/detalle_publicaciongrua.html?id=${item.IdPublicacionGrua}" class="btn btn-primary w-100">
              <i class="fas fa-info-circle me-2"></i>Ver Detalles
            </a>
          </div>
        </div>
      `;

      contenedor.appendChild(card);
    });

    // Activar filtro de búsqueda
    const input = document.getElementById("buscar");
    input.addEventListener("keyup", () => {
      const term = input.value.toLowerCase();
      const cards = document.querySelectorAll("#listadoGruas .card");
      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.parentElement.style.display = text.includes(term) ? "block" : "none";
      });
    });

  } catch (err) {
    console.error("❌ Error al cargar marketplace:", err);
  }
});