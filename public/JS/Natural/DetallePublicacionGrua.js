document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const idPublicacion = params.get("id");
  const esPrestador = params.get("prestador") === "true";
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

  if (!idPublicacion) return;

  // 🔹 Ocultar botón de agendar si es el prestador
  if (esPrestador) {
    const btnAgendar = document.querySelector('[data-bs-target="#modalAgendar"]');
    if (btnAgendar) {
      btnAgendar.style.display = "none";
    }
    
    // Mostrar menú de prestador
    const menuNatural = document.getElementById("menuNatural");
    const menuPrestador = document.getElementById("menuPrestador");
    if (menuNatural) menuNatural.style.display = "none";
    if (menuPrestador) menuPrestador.style.display = "flex";
  }

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


    let imagenes = [];
    
    // Parsear las imágenes
    if (Array.isArray(data.FotoPublicacion)) {
      imagenes = data.FotoPublicacion;
    } else if (typeof data.FotoPublicacion === 'string' && data.FotoPublicacion.length > 0) {
      try {
        imagenes = JSON.parse(data.FotoPublicacion);
      } catch (e) {
        imagenes = [data.FotoPublicacion];
      }
    }

    // Establecer la imagen
    const imgElement = document.getElementById("imagen-grua");
    if (imgElement && imagenes.length > 0) {
      let ruta = imagenes[0].replace(/\\/g, '/').trim();
      
      // Eliminar "public/" si está al inicio
      if (ruta.startsWith('public/')) {
        ruta = ruta.substring(7); // Quitar "public/"
      }
      
      // Si no empieza con /, agregarlo
      if (!ruta.startsWith('/')) {
        ruta = '/' + ruta;
      }
      
      console.log("🖼️ Cargando imagen:", ruta);
      console.log("🖼️ Data completa:", data);
      imgElement.src = ruta;
    } else {
      console.log("⚠️ No hay imágenes disponibles, usando imagen por defecto");
      console.log("⚠️ Data.FotoPublicacion:", data.FotoPublicacion);
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

  // 🔹 Ocultar formulario de comentarios si es el prestador
  if (esPrestador) {
    const formComentario = document.getElementById("form-comentario");
    if (formComentario) {
      formComentario.parentElement.style.display = "none";
    }
  }

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
  document.getElementById("formAgendar").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const direccion = document.getElementById("direccion").value;
    const destino = document.getElementById("destino").value;
    const detalle = document.getElementById("detalle").value;

    if (!usuarioActivo) {
      alert("⚠️ Debes iniciar sesión para agendar un servicio.");
      return;
    }

    try {
      const res = await fetch("/api/agendar-grua", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuarioActivo.id,
          idPublicacionGrua: idPublicacion,
          fecha,
          hora,
          direccion,
          destino,
          detalle
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert(`✅ Servicio agendado con éxito!\n📅 ${fecha} ${hora}\n📍 ${direccion}\n🏁 ${destino}`);
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalAgendar"));
        modal.hide();
        this.reset();
      } else {
        alert("❌ " + (result.error || "No se pudo agendar el servicio."));
      }
    } catch (err) {
      console.error("❌ Error al agendar servicio:", err);
      alert("Error de conexión con el servidor.");
    }
  });
});