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

  if (!idPublicacion) {
    alert("No se especificó una publicación para editar.");
    return;
  }

  // 🔹 Cargar datos de la publicación
  try {
    const res = await fetch(`/api/publicaciones-grua/${idPublicacion}`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const data = await res.json();

    titleInput.value = data.TituloPublicacion || "";
    priceInput.value = data.TarifaBase || "";
    areaInput.value = data.ZonaCobertura || "";
    descInput.value = data.DescripcionServicio || "";

    // Mostrar imágenes actuales
    previewArea.innerHTML = "";
    const imagenes = Array.isArray(data.FotoPublicacion)
      ? data.FotoPublicacion
      : JSON.parse(data.FotoPublicacion || "[]");

    imagenes.forEach((ruta) => {
      const div = document.createElement("div");
      div.classList.add("preview-container");

      const img = document.createElement("img");
      img.src = `/${ruta}`;
      img.classList.add("rounded");
      img.style.width = "130px";
      img.style.height = "130px";
      img.style.objectFit = "cover";

      div.appendChild(img);
      previewArea.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Error al cargar publicación:", err);
    alert("No se pudo cargar la publicación.");
  }

  // 🔹 Vista previa de nuevas imágenes
  fileInput.addEventListener("change", function () {
    previewArea.innerHTML = "";
    Array.from(this.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const div = document.createElement("div");
        div.classList.add("preview-container");

        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add("rounded");
        img.style.width = "130px";
        img.style.height = "130px";
        img.style.objectFit = "cover";

        div.appendChild(img);
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
