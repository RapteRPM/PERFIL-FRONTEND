const form = document.getElementById("perfilForm");
const imagenPerfil = document.getElementById("imagenPerfil");
const previewContainer = document.getElementById("previewContainer");
const previewImg = document.getElementById("previewImg");
const removeBtn = document.getElementById("removeImg");

document.addEventListener("DOMContentLoaded", async () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo || usuarioActivo.tipo !== "Comerciante") {
    console.warn("⚠️ Usuario no válido o no es Comerciante");
    return;
  }
  const usuarioId = usuarioActivo.id;

  // ✅ Cargar datos del perfil
  try {
    const res = await fetch(`/api/perfilComerciante/${usuarioId}`);
    if (!res.ok) {
      console.error("Fetch perfil falló:", res.status, res.statusText);
      return;
    }

    const data = await res.json();
    if (data.error) {
      console.error("Error:", data.error);
      return;
    }

    console.log("✅ Perfil del comerciante:", data);

    // Actualizar formulario
    document.getElementById("Nombre").value = data.Nombre || "";
    document.getElementById("Apellido").value = data.Apellido || "";
    document.getElementById("NombreComercio").value = data.NombreComercio || "";
    document.getElementById("NitComercio").value = data.NitComercio || "";
    document.getElementById("Correo").value = data.Correo || "";
    document.getElementById("Telefono").value = data.Telefono || "";
    document.getElementById("Direccion").value = data.Direccion || "";
    document.getElementById("Barrio").value = data.Barrio || "";
    document.getElementById("DiasAtencion").value = data.DiasAtencion || "";
    document.getElementById("HoraInicio").value = data.HoraInicio || "";
    document.getElementById("HoraFin").value = data.HoraFin || "";
    document.getElementById("RedesSociales").value = data.RedesSociales || "";

    // Actualizar sidebar (foto y nombre)
    const fotoUsuario = document.getElementById("foto-usuario");
    const nombreUsuario = document.getElementById("nombre-usuario");
    
    if (fotoUsuario && data.FotoPerfil) {
      fotoUsuario.src = `/${data.FotoPerfil}`;
    }
    
    if (nombreUsuario) {
      const nombreCompleto = `${data.Nombre || ""} ${data.Apellido || ""}`.trim();
      // Mostrar solo el primer nombre
      const primerNombre = nombreCompleto.split(' ')[0] || data.NombreComercio || "Usuario";
      nombreUsuario.textContent = primerNombre;
    }

    // Preview de imagen
    if (data.FotoPerfil && previewImg) {
      previewImg.src = `/${data.FotoPerfil}`;
      previewContainer.classList.remove("hidden");
    }
  } catch (err) {
    console.error("❌ Error cargando el perfil:", err);
  }

  // ✅ Enviar formulario para actualizar perfil
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form); // ✅ incluye automáticamente FotoPerfil si el input tiene name="FotoPerfil"

    try {
      const res = await fetch(`/api/actualizarPerfilComerciante/${usuarioId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert("❌ " + (data.error || "Error al actualizar"));
        return;
      }

      alert(data.mensaje || "Perfil actualizado correctamente ✅");

      if (data.fotoPerfil) {
        // Actualizar preview
        previewImg.src = `/${data.fotoPerfil}`;
        imagenPerfil.value = "";
        previewContainer.classList.add("hidden");
        
        // Actualizar foto del sidebar
        const fotoUsuario = document.getElementById("foto-usuario");
        if (fotoUsuario) {
          fotoUsuario.src = `/${data.fotoPerfil}`;
        }
      }
    } catch (err) {
      console.error("❌ Error al enviar formulario:", err);
      alert("Error de conexión");
    }
  });

  // ✅ Vista previa de imagen
  imagenPerfil.addEventListener("change", () => {
    const file = imagenPerfil.files[0];
    if (file) {
      previewImg.src = URL.createObjectURL(file);
      previewContainer.classList.remove("hidden");
    }
  });

  removeBtn.addEventListener("click", () => {
    imagenPerfil.value = "";
    previewImg.src = "";
    previewContainer.classList.add("hidden");
  });
});