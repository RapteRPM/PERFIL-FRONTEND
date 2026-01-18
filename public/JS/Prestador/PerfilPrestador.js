// 📁 public/JS/PerfilPrestador.js

document.addEventListener("DOMContentLoaded", async () => {
  const perfilEl = document.getElementById("perfilPrestador");
  const estadisticasEl = document.getElementById("estadisticasPrestador");
  const tablaEl = document.getElementById("tablaSolicitudes");

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  } catch {
    usuario = null;
  }

  // 🚫 Si no hay sesión o no es prestador, redirigir
  if (!usuario || !usuario.id || usuario.tipo !== "PrestadorServicio") {
    alert("⚠️ Debes iniciar sesión como prestador de servicios para ver este perfil.");
    window.location.href = "../General/Ingreso.html";
    return;
  }

  try {
    const res = await fetch("/api/perfil-prestador");
    if (!res.ok) throw new Error("No se pudo cargar el perfil");

    const data = await res.json();

    // Mostrar nombre completo
    const nombreCompleto = `${data.nombre || ''} ${data.apellido || ''}`.trim() || 'Prestador';

    // 👤 Perfil
    perfilEl.innerHTML = `
      <img src="${data.foto}" alt="Prestador" class="rounded-full border-4 border-white shadow-lg w-32 h-32 mx-auto mb-4">
      <h2 class="text-3xl font-bold mb-1">Hola, ${nombreCompleto}</h2>
      <p class="text-gray-300">${data.descripcion}</p>
    `;

    // 📊 Estadísticas
    estadisticasEl.innerHTML = `
      <div class="card text-center py-6">
        <h5 class="text-lg font-semibold text-purple-400"><i class="fas fa-tasks"></i> Total Servicios</h5>
        <p class="text-4xl font-bold text-purple-400 mt-2">${data.estadisticas.totalServicios || 0}</p>
      </div>
      <div class="card text-center py-6">
        <h5 class="text-lg font-semibold text-yellow-400"><i class="fas fa-clock"></i> Pendientes</h5>
        <p class="text-4xl font-bold text-yellow-400 mt-2">${data.estadisticas.pendientes || 0}</p>
      </div>
      <div class="card text-center py-6">
        <h5 class="text-lg font-semibold text-green-400"><i class="fas fa-check-circle"></i> Completados</h5>
        <p class="text-4xl font-bold text-green-400 mt-2">${data.estadisticas.completados || 0}</p>
      </div>
      <div class="card text-center py-6">
        <h5 class="text-lg font-semibold text-blue-400"><i class="fas fa-star"></i> Valoración</h5>
        <p class="text-4xl font-bold text-blue-400 mt-2">${data.estadisticas.valoracion || 'N/A'}</p>
      </div>
    `;

    // 📋 Tabla de solicitudes
    tablaEl.innerHTML = "";
    data.solicitudes.forEach((s, index) => {
      tablaEl.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${s.Cliente}</td>
          <td>${s.Origen}</td>
          <td>${s.Destino}</td>
          <td>${new Date(s.Fecha).toLocaleDateString()}</td>
          <td><span class="badge ${estadoColor(s.Estado)}">${s.Estado}</span></td>
        </tr>
      `;
    });

  } catch (error) {
    console.error("❌ Error al cargar perfil del prestador:", error);
    alert("No se pudo cargar la información del perfil.");
  }
});

// 🎨 Función para asignar color según estado
function estadoColor(estado) {
  switch (estado) {
    case "Pendiente": return "bg-warning text-dark";
    case "Terminado": 
    case "Completado": return "bg-success";
    case "Aceptado": return "bg-info text-dark";
    case "Rechazado": return "bg-danger";
    case "Cancelado": return "bg-secondary";
    default: return "bg-secondary";
  }
}