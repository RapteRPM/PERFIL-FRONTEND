const form = document.getElementById("formPerfil");
const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
const usuarioId = usuario?.id;

// Preview de imagen
const inputImagen = document.getElementById("imagenPerfil");
const previewArea = document.getElementById("previewArea");

if (inputImagen) {
  inputImagen.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewArea.innerHTML = `
          <div class="mt-3">
            <img src="${event.target.result}" style="max-width: 200px; border-radius: 8px; border: 2px solid #ccc;">
          </div>
        `;
      };
      reader.readAsDataURL(file);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!usuarioId) return;

  try {
    const res = await fetch(`/api/perfilPrestador/${usuarioId}`);
    const data = await res.json();

    // Mostrar nombre completo en el campo de nombre
    document.getElementById("nombre").value = data.Nombre || "";
    document.getElementById("correo").value = data.Correo || "";
    document.getElementById("telefono").value = data.Telefono || "";

    if (data.FotoPerfil) {
      previewArea.innerHTML = `
        <div class="mt-3">
          <img src="/${data.FotoPerfil}" style="max-width: 200px; border-radius: 8px; border: 2px solid #ccc;">
        </div>
      `;
    }
  } catch (err) {
    console.error("❌ Error al cargar perfil prestador:", err);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!usuarioId) return alert("No hay usuario logueado");

  const formData = new FormData();
  formData.append("Nombre", document.getElementById("nombre").value.trim());
  formData.append("Correo", document.getElementById("correo").value.trim());
  formData.append("Telefono", document.getElementById("telefono").value.trim());

    const imagenPerfil = document.getElementById("imagenPerfil").files[0];
    if (imagenPerfil) formData.append("FotoPerfil", imagenPerfil);

    const certificado = document.getElementById("imagenCertificado").files[0];
    if (certificado) formData.append("Certificado", certificado);



  try {
    const res = await fetch(`/api/actualizarPerfilPrestador/${usuarioId}`, {
      method: "PUT",
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) return alert("❌ " + (result.error || "Error al actualizar"));

    alert(result.mensaje || "Perfil actualizado correctamente ✅");
    window.location.href = "perfil_servicios.html";
  } catch (err) {
    console.error("❌ Error al actualizar perfil prestador:", err);
    alert("Error de conexión");
  }
});