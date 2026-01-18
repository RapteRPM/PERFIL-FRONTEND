document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const idPublicacion = params.get("id");
  const esPrestador = params.get("prestador") === "true";
  
  // Obtener usuarioActivo de localStorage (puede ser null)
  let usuarioActivo = null;
  try {
    const usuarioStr = localStorage.getItem("usuarioActivo");
    if (usuarioStr) {
      usuarioActivo = JSON.parse(usuarioStr);
    }
  } catch (e) {
    console.warn("Error al parsear usuarioActivo:", e);
  }

  if (!idPublicacion) return;

  // 🔹 Ocultar botón de agendar si NO hay usuario logueado o si es el prestador
  const btnAgendar = document.querySelector('[data-bs-target="#modalAgendar"]');
  if (btnAgendar) {
    if (!usuarioActivo || esPrestador) {
      btnAgendar.style.display = "none";
    }
  }
  
  // 🔹 Mostrar menú según tipo de usuario
  if (esPrestador && usuarioActivo) {
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
    
    console.log("📊 Datos recibidos de la grúa:", data);

    // Llenar la información del servicio
    const tituloEl = document.getElementById("tituloPublicacion");
    const descripcionEl = document.getElementById("descripcionServicio");
    const nombreEl = document.getElementById("nombrePrestador");
    const telefonoEl = document.getElementById("telefonoPrestador");
    const correoEl = document.getElementById("correoPrestador");
    const detalleEl = document.getElementById("detalleServicio");
    const zonaEl = document.getElementById("zonaCobertura");
    const tarifaEl = document.getElementById("tarifaBase");
    
    if (tituloEl) tituloEl.textContent = data.TituloPublicacion || "Sin título";
    if (descripcionEl) descripcionEl.textContent = data.DescripcionServicio || "Sin descripción";
    if (nombreEl) nombreEl.textContent = data.NombrePrestador || "No disponible";
    if (telefonoEl) telefonoEl.textContent = data.Telefono || "No disponible";
    if (correoEl) correoEl.textContent = data.Correo || "No disponible";
    if (detalleEl) detalleEl.textContent = data.DescripcionServicio || "Sin detalles";
    if (zonaEl) zonaEl.textContent = data.ZonaCobertura || "No especificada";
    if (tarifaEl) tarifaEl.textContent = `$${parseInt(data.TarifaBase || 0).toLocaleString("es-CO")}`;

    console.log("✅ Información llenada en la página");

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

    // Cargar todas las imágenes en el carrusel
    const carouselImages = document.getElementById("carousel-images");
    const carouselIndicators = document.getElementById("carousel-indicators");
    const carouselPrev = document.getElementById("carousel-prev");
    const carouselNext = document.getElementById("carousel-next");
    
    if (imagenes.length > 0) {
      carouselImages.innerHTML = ''; // Limpiar spinner
      carouselIndicators.innerHTML = '';
      
      imagenes.forEach((imagen, index) => {
        // Limpiar la ruta
        let rutaImagen = '';
        if (typeof imagen === 'string') {
          rutaImagen = imagen.replace(/\\/g, '/').trim();
          
          // Si la ruta empieza con "imagen/", agregar barra al inicio
          if (rutaImagen.toLowerCase().startsWith('imagen/')) {
            rutaImagen = '/' + rutaImagen;
          } else {
            rutaImagen = rutaImagen.startsWith('/') ? rutaImagen : '/' + rutaImagen;
          }
        }
        
        // Crear item del carrusel
        const carouselItem = document.createElement('div');
        carouselItem.className = index === 0 ? 'carousel-item active' : 'carousel-item';
        carouselItem.innerHTML = `
          <img src="${rutaImagen}" class="d-block w-100" style="height: 400px; object-fit: contain;" alt="Imagen ${index + 1}" 
               onerror="this.src='../General/IMAGENINGRESO/Grua.png'; this.style.objectFit='cover';">
        `;
        carouselImages.appendChild(carouselItem);
        
        // Crear indicador
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', '#carouselGrua');
        indicator.setAttribute('data-bs-slide-to', index);
        if (index === 0) indicator.className = 'active';
        indicator.setAttribute('aria-current', index === 0 ? 'true' : 'false');
        indicator.setAttribute('aria-label', `Imagen ${index + 1}`);
        carouselIndicators.appendChild(indicator);
      });
      
      // Mostrar controles solo si hay más de una imagen
      if (imagenes.length > 1) {
        carouselPrev.style.display = 'flex';
        carouselNext.style.display = 'flex';
      }
      
      console.log(`✅ Carrusel cargado con ${imagenes.length} imagen(es)`);
    } else {
      console.log("⚠️ No hay imágenes disponibles");
      carouselImages.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100 text-muted"><div><i class="fas fa-truck-monster fa-3x mb-3"></i><p>Sin imágenes</p></div></div>';
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

  // 🔹 Ocultar formulario de comentarios si NO hay usuario logueado o es el prestador
  const formComentarioContainer = document.getElementById("form-comentario")?.parentElement;
  if (formComentarioContainer) {
    if (!usuarioActivo || esPrestador) {
      formComentarioContainer.style.display = "none";
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
      const confirmar = confirm("⚠️ Debes iniciar sesión para comentar.\n\n¿Deseas ir a la página de inicio de sesión?");
      if (confirmar) {
        window.location.href = "../General/Ingreso.html";
      }
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
  const formAgendar = document.getElementById("formAgendar");
  if (formAgendar) {
    formAgendar.addEventListener("submit", async function (e) {
      e.preventDefault();
      
      const fecha = document.getElementById("fecha").value;
      const hora = document.getElementById("hora").value;
      const direccion = document.getElementById("direccion").value;
      const destino = document.getElementById("destino").value;
      const detalle = document.getElementById("detalle").value;

      if (!usuarioActivo) {
        const confirmar = confirm("⚠️ Debes iniciar sesión para agendar un servicio.\n\n¿Deseas ir a la página de inicio de sesión?");
        if (confirmar) {
          // Guardar la URL actual para regresar después del login
          sessionStorage.setItem('returnUrl', window.location.href);
          window.location.href = "../General/Ingreso.html";
        }
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
  }
});