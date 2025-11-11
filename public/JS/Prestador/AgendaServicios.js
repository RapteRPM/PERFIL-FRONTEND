document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  const usuarioId = usuario?.id;

  if (!usuarioId) return;

  try {
    const res = await fetch(`/api/solicitudes-grua/${usuarioId}`);
    const data = await res.json();

    if (!Array.isArray(data)) return;

    const contenedor = document.getElementById("contenedorSolicitudes");
    contenedor.innerHTML = "";

    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "col-md-6";

      const destino = item.Destino ? ` → ${item.Destino}` : "";
      const estadoColor = {
        Pendiente: "bg-warning text-dark",
        Cancelado: "bg-danger text-light",
        Finalizado: "bg-success text-light",
        "En revision": "bg-info text-dark",
        Aceptado: "bg-success text-light"
      };

      const botones = {
        Pendiente: `
          <button class="btn btn-success btn-sm"><i class="fas fa-check-circle"></i> Aceptar</button>
          <button class="btn btn-danger btn-sm"><i class="fas fa-times-circle"></i> Rechazar</button>
          <button class="btn btn-secondary btn-sm"><i class="fas fa-clipboard-check"></i> Marcar atendido</button>
        `,
        "En revision": `
          <button class="btn btn-success btn-sm"><i class="fas fa-check-circle"></i> Aceptar</button>
          <button class="btn btn-danger btn-sm"><i class="fas fa-times-circle"></i> Rechazar</button>
          <button class="btn btn-secondary btn-sm"><i class="fas fa-clipboard-check"></i> Marcar atendido</button>
        `,
        Aceptado: `
          <button class="btn btn-secondary btn-sm"><i class="fas fa-clipboard-check"></i> Marcar atendido</button>
        `
      };

      card.innerHTML = `
        <div class="card card-solicitud p-4">
          <h5 class="fw-bold text-lg mb-2">
            <i class="fas fa-car-side text-blue-400 me-2"></i> Cliente: ${item.Cliente}
          </h5>
          <p><strong>Tipo de servicio:</strong> ${item.Servicio}</p>
          <p><strong>Ubicación:</strong> ${item.DireccionRecogida}${destino}</p>
          <p><strong>Fecha solicitada:</strong> ${item.FechaServicio}</p>
          <span class="badge ${estadoColor[item.Estado] || "bg-light text-dark"}">${item.Estado}</span>
          <div class="mt-4 d-flex gap-2">
            ${botones[item.Estado] || ""}
          </div>
        </div>
      `;

      contenedor.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error al cargar solicitudes:", err);
  }
});