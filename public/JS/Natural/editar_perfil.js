// ✅ Referencia al formulario
const form = document.querySelector("form");

// ✅ Vista previa de imagen
const imagenPerfil = document.getElementById("imagen");
const previewContainer = document.getElementById("previewContainer");
const previewImg = document.getElementById("previewImg");
const removeBtn = document.getElementById("removeImg");

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Obtener usuario activo
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo || usuarioActivo.tipo !== "Natural") {
    console.warn("⚠️ Usuario no válido o no es de tipo Natural. Redirigiendo...");
    alert("⚠️ Debes iniciar sesión para acceder a esta página");
    window.location.href = "/General/Ingreso.html";
    return;
  }
  const usuarioId = usuarioActivo.id;

  // ✅ Cargar datos del perfil
  try {
    const res = await fetch(`/api/perfilNatural/${usuarioId}`);
    const data = await res.json();

    document.getElementById("nombre").value = data.Nombre || "";
    document.getElementById("apellido").value = data.Apellido || "";
    document.querySelector("input[type='dir']").value = data.Direccion || "";
    document.querySelector("input[type='bar']").value = data.Barrio || "";
    document.querySelector("input[type='email']").value = data.Correo || "";
    document.querySelector("input[type='tel']").value = data.Telefono || "";

    const foto = document.getElementById("foto-usuario");
    if (data.FotoPerfil) {
      foto.src = `/${data.FotoPerfil}`;
    }

    // Mostrar solo el primer nombre en el header
    const nombreCompleto = `${data.Nombre || ""} ${data.Apellido || ""}`.trim();
    const primerNombre = nombreCompleto.split(' ')[0] || 'Usuario';
    document.getElementById("nombre-usuario").textContent = primerNombre;
  } catch (err) {
    console.error("❌ Error al cargar perfil natural:", err);
  }

  // ✅ Enviar formulario para actualizar perfil
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Nombre", document.getElementById("nombre").value.trim());
    formData.append("Apellido", document.getElementById("apellido").value.trim());
    formData.append("Direccion", document.querySelector("input[type='dir']").value.trim());
    formData.append("Barrio", document.querySelector("input[type='bar']").value.trim());
    formData.append("Correo", document.querySelector("input[type='email']").value.trim());
    formData.append("Telefono", document.querySelector("input[type='tel']").value.trim());

    const imagen = imagenPerfil.files[0];
    if (imagen) formData.append("FotoPerfil", imagen);

    try {
      const res = await fetch(`/api/actualizarPerfilNatural/${usuarioId}`, {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) return alert("❌ " + (result.error || "Error al actualizar"));

      alert(result.mensaje || "Perfil actualizado correctamente ✅");

      // Actualizar foto en el sidebar y recargar la sesión
      if (result.fotoPerfil) {
        document.getElementById("foto-usuario").src = `/${result.fotoPerfil}`;
        // Forzar recarga de la foto en todos los elementos
        const todasLasFotos = document.querySelectorAll('img[id="foto-usuario"]');
        todasLasFotos.forEach(img => img.src = `/${result.fotoPerfil}?t=${Date.now()}`);
        
        imagenPerfil.value = "";
        previewImg.src = "";
        previewContainer.classList.add("d-none");
      }
      
      // Recargar la información del header
      if (typeof cargarUsuarioHeader === 'function') {
        await cargarUsuarioHeader();
      }
    } catch (err) {
      console.error("❌ Error al actualizar perfil:", err);
      alert("Error de conexión");
    }
  });

  // ✅ Vista previa de imagen
  imagenPerfil.addEventListener("change", () => {
    const file = imagenPerfil.files[0];
    if (file) {
      previewImg.src = URL.createObjectURL(file);
      previewImg.style.width = "100px";
      previewImg.style.height = "100px";
      previewImg.style.objectFit = "cover";
      previewImg.style.borderRadius = "8px";
      previewImg.style.border = "2px solid #ccc";
      previewImg.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
      previewContainer.classList.remove("d-none");
    }
  });

  removeBtn.addEventListener("click", () => {
    imagenPerfil.value = "";
    previewImg.src = "";
    previewImg.removeAttribute("style");
    previewContainer.classList.add("d-none");
  });
});