document.addEventListener("DOMContentLoaded", async () => {
  const fileInput = document.getElementById("serviceImage");
  const previewArea = document.getElementById("previewArea");
  const titleInput = document.getElementById("serviceTitle");
  const priceInput = document.getElementById("basePrice");
  const areaInput = document.getElementById("coverageArea");
  const descInput = document.getElementById("serviceDesc");
  const form = document.getElementById("editar-servicio-form");

  const params = new URLSearchParams(window.location.search);
  const idPublicacion = params.get("id");
  
  // Array para mantener las imágenes actuales que NO se eliminarán
  let imagenesActuales = [];
  let imagenesAEliminar = [];

  if (!idPublicacion) {
    alert("No se especificó una publicación para editar.");
    return;
  }

  // 🔹 Cargar datos de la publicación
  try {
    const res = await fetch(`/api/publicaciones-grua/editar/${idPublicacion}`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const data = await res.json();

    titleInput.value = data.TituloPublicacion || "";
    priceInput.value = data.TarifaBase || "";
    areaInput.value = data.ZonaCobertura || "";
    descInput.value = data.DescripcionServicio || "";

    // Mostrar imágenes actuales con botón para eliminar
    previewArea.innerHTML = "";
    const imagenes = Array.isArray(data.FotoPublicacion)
      ? data.FotoPublicacion
      : JSON.parse(data.FotoPublicacion || "[]");
    
    imagenesActuales = [...imagenes];

    imagenes.forEach((ruta, index) => {
      const div = document.createElement("div");
      div.classList.add("preview-container");
      div.style.position = "relative";
      div.style.display = "inline-block";
      div.style.margin = "10px";

      const img = document.createElement("img");
      img.src = `/${ruta}`;
      img.classList.add("rounded");
      img.style.width = "130px";
      img.style.height = "130px";
      img.style.objectFit = "cover";
      img.style.border = "2px solid #ccc";

      // Botón X para eliminar
      const btnEliminar = document.createElement("button");
      btnEliminar.innerHTML = "&times;";
      btnEliminar.type = "button";
      btnEliminar.style.position = "absolute";
      btnEliminar.style.top = "5px";
      btnEliminar.style.right = "5px";
      btnEliminar.style.width = "25px";
      btnEliminar.style.height = "25px";
      btnEliminar.style.borderRadius = "50%";
      btnEliminar.style.border = "none";
      btnEliminar.style.backgroundColor = "#ef4444";
      btnEliminar.style.color = "white";
      btnEliminar.style.fontSize = "18px";
      btnEliminar.style.fontWeight = "bold";
      btnEliminar.style.cursor = "pointer";
      btnEliminar.style.display = "flex";
      btnEliminar.style.alignItems = "center";
      btnEliminar.style.justifyContent = "center";
      btnEliminar.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      
      btnEliminar.addEventListener("click", () => {
        // Remover del array de imágenes actuales
        const indexEnActuales = imagenesActuales.indexOf(ruta);
        if (indexEnActuales > -1) {
          imagenesActuales.splice(indexEnActuales, 1);
          imagenesAEliminar.push(ruta);
        }
        // Remover visualmente
        div.remove();
      });

      div.appendChild(img);
      div.appendChild(btnEliminar);
      previewArea.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Error al cargar publicación:", err);
    alert("No se pudo cargar la publicación.");
  }

  // 🔹 Vista previa de nuevas imágenes
  fileInput.addEventListener("change", function () {
    // No limpiar todo el previewArea, solo agregar las nuevas
    Array.from(this.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const div = document.createElement("div");
        div.classList.add("preview-container");
        div.style.position = "relative";
        div.style.display = "inline-block";
        div.style.margin = "10px";

        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add("rounded");
        img.style.width = "130px";
        img.style.height = "130px";
        img.style.objectFit = "cover";
        img.style.border = "2px solid #10b981";
        
        // Indicador de imagen nueva
        const badge = document.createElement("span");
        badge.textContent = "Nueva";
        badge.style.position = "absolute";
        badge.style.top = "5px";
        badge.style.left = "5px";
        badge.style.backgroundColor = "#10b981";
        badge.style.color = "white";
        badge.style.fontSize = "10px";
        badge.style.padding = "2px 6px";
        badge.style.borderRadius = "4px";
        badge.style.fontWeight = "bold";

        div.appendChild(img);
        div.appendChild(badge);
        previewArea.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  });

  // 🔹 Enviar cambios
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("titulo", titleInput.value.trim());
    formData.append("tarifa", priceInput.value.trim());
    formData.append("zona", areaInput.value.trim());
    formData.append("descripcion", descInput.value.trim());
    
    // Enviar las imágenes actuales que NO se eliminaron
    formData.append("imagenesActuales", JSON.stringify(imagenesActuales));

    Array.from(fileInput.files).forEach((file) => {
      formData.append("imagenesNuevas", file);
    });

    try {
      const res = await fetch(`/api/publicaciones-grua/${idPublicacion}`, {
        method: "PUT",
        body: formData,
        credentials: 'include'
      });

      const result = await res.json();

      if (result.error) throw new Error(result.error);

      alert("✅ Publicación actualizada correctamente.");
      window.location.href = "Registro_servicios.html";
    } catch (err) {
      console.error("❌ Error al actualizar publicación:", err);
      alert("❌ Error al actualizar la publicación.");
    }
  });
});
