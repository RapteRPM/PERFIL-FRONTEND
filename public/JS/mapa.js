document.addEventListener("DOMContentLoaded", () => {
  // Crear mapa centrado en Bogotá
  const map = L.map('map').setView([4.60971, -74.08175], 12);

  // Capa base de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  let talleres = [];
  let talleresFiltrados = [];
  let paginaActual = 1;
  const porPagina = 10;

  function renderLista() {
    const lista = document.getElementById("lista-talleres");
    const paginacion = document.getElementById("paginacion");
    if (!lista || !paginacion) return;

    lista.innerHTML = "";
    paginacion.innerHTML = "";

    const inicio = (paginaActual - 1) * porPagina;
    const fin = inicio + porPagina;
    const paginaData = talleresFiltrados.slice(inicio, fin);

    paginaData.forEach(item => {
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action";
      li.innerHTML = `<b>${item.NombreComercio}</b> - ${item.Barrio || ""}`;
      li.addEventListener("click", () => {
        const modalBody = document.getElementById("detalleContenido");
        const modalElement = document.getElementById("detalleTaller");
        if (modalBody && modalElement) {
          modalBody.innerHTML = `
            <b>${item.NombreComercio}</b><br>
            <b>Vendedor:</b> ${item.NombreVendedor || "No especificado"}<br>
            <b>Barrio:</b> ${item.Barrio || "No especificado"}<br>
            <b>Días:</b> ${item.DiasAtencion || "No especificado"}<br>
            <b>Horario:</b> ${item.HoraInicio || ""} - ${item.HoraFin || ""}
          `;
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      });
      lista.appendChild(li);
    });

    const totalPaginas = Math.ceil(talleresFiltrados.length / porPagina);
    if (totalPaginas <= 1) return;

    const ul = document.createElement("ul");
    ul.className = "pagination justify-content-center";

    const prev = document.createElement("li");
    prev.className = `page-item ${paginaActual === 1 ? "disabled" : ""}`;
    prev.innerHTML = `<a class="page-link" href="#">«</a>`;
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      if (paginaActual > 1) {
        paginaActual--;
        renderLista();
      }
    });
    ul.appendChild(prev);

    for (let i = 1; i <= totalPaginas; i++) {
      const liBtn = document.createElement("li");
      liBtn.className = `page-item ${i === paginaActual ? "active" : ""}`;
      liBtn.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      liBtn.addEventListener("click", (e) => {
        e.preventDefault();
        paginaActual = i;
        renderLista();
      });
      ul.appendChild(liBtn);
    }

    const next = document.createElement("li");
    next.className = `page-item ${paginaActual === totalPaginas ? "disabled" : ""}`;
    next.innerHTML = `<a class="page-link" href="#">»</a>`;
    next.addEventListener("click", (e) => {
      e.preventDefault();
      if (paginaActual < totalPaginas) {
        paginaActual++;
        renderLista();
      }
    });
    ul.appendChild(next);

    paginacion.appendChild(ul);
  }

  function buscarTaller() {
    const input = document.getElementById("busquedaTaller");
    if (!input) return;

    const texto = input.value.toLowerCase();
    talleresFiltrados = talleres.filter(t =>
      (t.NombreComercio && t.NombreComercio.toLowerCase().includes(texto)) ||
      (t.NombreVendedor && t.NombreVendedor.toLowerCase().includes(texto)) ||
      (t.Barrio && t.Barrio.toLowerCase().includes(texto)) ||
      (t.DiasAtencion && t.DiasAtencion.toLowerCase().includes(texto))
    );
    paginaActual = 1;
    renderLista();
  }

  const inputBusqueda = document.getElementById("busquedaTaller");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", buscarTaller);
  }

  // Función para localizar al usuario
  window.localizarUsuario = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          map.setView([lat, lng], 15);
          L.marker([lat, lng])
            .addTo(map)
            .bindPopup("<b>📍 Tu ubicación</b>")
            .openPopup();
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener tu ubicación. Verifica los permisos del navegador.");
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  // Exponer funciones globalmente
  window.buscarTaller = buscarTaller;

  fetch('/api/talleres')
    .then(res => res.json())
    .then(data => {
      talleres = data;
      talleresFiltrados = [...talleres];
      renderLista();

      data.forEach(item => {
        if (item.Latitud && item.Longitud) {
          L.marker([item.Latitud, item.Longitud])
            .addTo(map)
            .bindPopup(`
              <b>${item.NombreComercio || "Sin nombre"}</b><br>
              <b>Vendedor:</b> ${item.NombreVendedor || "No especificado"}<br>
              <b>Barrio:</b> ${item.Barrio || "No especificado"}<br>
              <b>Días:</b> ${item.DiasAtencion || "No especificado"}<br>
              <b>Horario:</b> ${item.HoraInicio || ""} - ${item.HoraFin || ""}
            `);
        }
      });
    })
    .catch(err => console.error("❌ Error cargando ubicaciones:", err));
});