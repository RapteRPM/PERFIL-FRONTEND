document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const idPublicacion = params.get("id");
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

  if (!idPublicacion) return;

  // 🔹 Cargar detalle de la publicación    
  try {
    const res = await fetch(`/api/publicaciones-grua/${idPublicacion}`);
    const data = await res.json();

    document.getElementById("tituloPublicacion").textContent = data.TituloPublicacion;
    document.getElementById("descripcionServicio").textContent = data.DescripcionServicio;
    document.getElementById("nombrePrestador").textContent = data.NombrePrestador;
    document.getElementById("telefonoPrestador").textContent = data.Telefono;
    document.getElementById("correoPrestador").textContent = data.Correo;
    document.getElementById("detalleServicio").textContent = data.DescripcionServicio;
    document.getElementById("zonaCobertura").textContent = data.ZonaCobertura;
    document.getElementById("tarifaBase").textContent = `$${parseInt(data.TarifaBase).toLocaleString("es-CO")}`;


    const imagenes = Array.isArray(data.FotoPublicacion)
      ? data.FotoPublicacion
      : JSON.parse(data.FotoPublicacion || "[]");

    if (imagenes.length > 0) {
      const ruta = imagenes[0].startsWith("/") ? imagenes[0] : `/${imagenes[0]}`;
      document.querySelector("img.img-fluid").src = ruta;
    } else {
      document.querySelector("img.img-fluid").src = "/image/grua_default.jpg";
    }

  } catch (err) {
    console.error("❌ Error al cargar detalle:", err);
  }

  // 🔹 Cargar opiniones
async function cargarOpiniones() {
  try {
    const res = await fetch(`/api/opiniones-grua/${idPublicacion}`);
    const opiniones = await res.json();

    const contenedor = document.getElementById("opinionesContainer");
    contenedor.innerHTML = ""; // Limpia opiniones anteriores

    if (opiniones.length === 0) {
      contenedor.innerHTML = `<p class="text-muted">Aún no hay opiniones registradas para este servicio.</p>`;
      return;
    }

    let suma = 0;

    opiniones.forEach(op => {
      suma += parseInt(op.Calificacion);

      const card = document.createElement("div");
      card.className = "card p-3 mb-3 shadow-sm border-start border-4 border-success";
      card.innerHTML = `
        <strong>${op.NombreUsuario}</strong>
        <div class="star-rating text-warning mb-1">
          ${"★".repeat(op.Calificacion)}${"☆".repeat(5 - op.Calificacion)}
        </div>
        <p class="mb-1">${op.Comentario}</p>
        <small class="text-muted">Publicado el ${new Date(op.Fecha).toLocaleDateString("es-CO")}</small>
      `;
      contenedor.appendChild(card);
    });

    // Mostrar resumen de calificación
    const promedio = (suma / opiniones.length).toFixed(1);
    const estrellas = Math.floor(promedio);
    const mediaEstrella = promedio - estrellas >= 0.5 ? 1 : 0;

    const estrellasHTML = `${'<i class="bi bi-star-fill"></i>'.repeat(estrellas)}${mediaEstrella ? '<i class="bi bi-star-half"></i>' : ''}${'<i class="bi bi-star"></i>'.repeat(5 - estrellas - mediaEstrella)}`;

    document.getElementById("calificacionPromedio").innerHTML = estrellasHTML;
    document.getElementById("resumenOpiniones").textContent = `(${promedio} de 5 - basado en ${opiniones.length} opiniones)`;

  } catch (err) {
    console.error("❌ Error al cargar opiniones:", err);
  }
}

  await cargarOpiniones();

  // 🔹 Enviar nueva opinión
  const formComentario = document.querySelector("form");
  const select = formComentario.querySelector("select");
  select.id = "calificacion";
  formComentario.id = "form-comentario";

  formComentario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const comentario = document.getElementById("comentario").value.trim();
    const calificacion = document.getElementById("calificacion").value;

    if (!usuarioActivo) {
      alert("⚠️ Debes iniciar sesión para comentar.");
      return;
    }

    if (!comentario || !calificacion) {
      alert("Por favor, escribe un comentario y selecciona una calificación.");
      return;
    }

    try {
      const res = await fetch("/api/opiniones-grua", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuarioActivo.id,
          idPublicacionGrua: idPublicacion,
          nombreUsuario: usuarioActivo.nombre,
          comentario,
          calificacion
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ Comentario guardado correctamente.");
        formComentario.reset();
        await cargarOpiniones();
      } else {
        alert("❌ No se pudo guardar tu comentario.");
      }
    } catch (err) {
      console.error("❌ Error al enviar comentario:", err);
      alert("Error de conexión.");
    }
  });

  // 🔹 Manejo del formulario de agendamiento
  document.getElementById("formAgendar").addEventListener("submit", function (e) {
    e.preventDefault();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const direccion = document.getElementById("direccion").value;
    const detalle = document.getElementById("detalle").value;

    alert(`✅ Servicio agendado:\n📅 ${fecha} ${hora}\n📍 ${direccion}\n📝 ${detalle}`);
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalAgendar"));
    modal.hide();
    this.reset();
  });
});