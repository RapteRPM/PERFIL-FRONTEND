document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  const usuarioId = usuario?.id;

  if (!usuarioId) return;

  try {
    const res = await fetch(`/api/historial-servicios/${usuarioId}`);
    const data = await res.json();

    if (!Array.isArray(data)) return;

    const tbody = document.getElementById("historialBody");
    tbody.innerHTML = "";

    data.forEach((item, index) => {
      const tr = document.createElement("tr");

      const estadoColor = {
        Finalizado: "bg-success text-light",
        Cancelado: "bg-danger text-light",
        Pendiente: "bg-warning text-dark",
        "En revision": "bg-secondary text-light"
      };

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.Cliente}</td>
        <td>${item.Servicio}</td>
        <td>${item.Ubicacion}</td>
        <td>${item.Fecha}</td>
        <td><span class="badge ${estadoColor[item.Estado] || "bg-light text-dark"}">${item.Estado}</span></td>
        <td>$${parseInt(item.Total).toLocaleString("es-CO")}</td>
      `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("❌ Error al cargar historial de servicios:", err);
  }
});