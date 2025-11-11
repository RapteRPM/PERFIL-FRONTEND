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
    console.warn("⚠️ Usuario no válido o no es de tipo Natural");
    return;
  }
  const usuarioId = usuarioActivo.id;

  // ✅ Cargar datos del perfil
  try {
    const res = await fetch(`/api/perfilNatural/${usuarioId}`);
    const data = await res.json();

    document.querySelector("input[type='text']").value = `${data.Nombre || ""} ${data.Apellido || ""}`;
    document.querySelector("input[type='dir']").value = data.Direccion || "";
    document.querySelector("input[type='bar']").value = data.Barrio || "";
    document.querySelector("input[type='email']").value = data.Correo || "";
    document.querySelector("input[type='tel']").value = data.Telefono || "";

    const foto = document.getElementById("foto-usuario");
    if (data.FotoPerfil) {
      foto.src = `/${data.FotoPerfil}`;
    }

    document.getElementById("nombre-usuario").textContent = `${data.Nombre || ""} ${data.Apellido || ""}`;
  } catch (err) {
    console.error("❌ Error al cargar perfil natural:", err);
  }

  // ✅ Enviar formulario para actualizar perfil
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreCompleto = document.querySelector("input[type='text']").value.trim().split(" ");
    const formData = new FormData();
    formData.append("Nombre", nombreCompleto[0] || "");
    formData.append("Apellido", nombreCompleto.slice(1).join(" ") || "");
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

      if (result.fotoPerfil) {
        document.getElementById("foto-usuario").src = `/${result.fotoPerfil}`;
        imagenPerfil.value = "";
        previewImg.src = "";
        previewContainer.classList.add("d-none");
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