const form = document.getElementById("formPerfil");
const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
const usuarioId = usuario?.id;

document.addEventListener("DOMContentLoaded", async () => {
  if (!usuarioId) return;

  try {
    const res = await fetch(`/api/perfilPrestador/${usuarioId}`);
    const data = await res.json();

    document.getElementById("nombreCompleto").value = data.Nombre || "";
    document.getElementById("correo").value = data.Correo || "";
    document.getElementById("telefono").value = data.Telefono || "";

    if (data.FotoPerfil) {
      const preview = document.getElementById("previewArea");
      const img = document.createElement("img");
      img.src = `/${data.FotoPerfil}`;
      img.style.width = "100px";
      img.style.borderRadius = "8px";
      preview.appendChild(img);
    }
  } catch (err) {
    console.error("❌ Error al cargar perfil prestador:", err);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!usuarioId) return alert("No hay usuario logueado");

  const formData = new FormData();
  formData.append("Nombre", document.getElementById("nombreCompleto").value.trim());
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