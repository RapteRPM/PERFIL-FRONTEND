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

      const imagenes = Array.isArray(item.FotoPublicacion)
        ? item.FotoPublicacion
        : JSON.parse(item.FotoPublicacion || "[]");

      const imagenSrc = imagenes.length > 0 ? `/${imagenes[0]}` : "image/grua_default.jpg";

      card.innerHTML = `
        <div class="card card-grua h-100">
          <img src="${imagenSrc}" class="card-img-top" alt="Servicio de grúa">
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