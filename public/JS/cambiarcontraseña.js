document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nueva = document.getElementById("nuevaContrasena").value.trim();
    const confirmar = document.getElementById("confirmarContrasena").value.trim();

    if (nueva !== confirmar) {
      alert("❌ Las contraseñas no coinciden.");
      return;
    }

    // Detectar si viene de recuperación o sesión activa
    const usuarioRecuperacion = JSON.parse(localStorage.getItem("usuarioRecuperacion"));
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    const idUsuario = usuarioRecuperacion?.id || usuarioActivo?.id;

    if (!idUsuario) {
      alert("⚠️ No se encontró un usuario válido. Intenta iniciar sesión o recuperar nuevamente.");
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${idUsuario}/contrasena`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevaContrasena: nueva })
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Contraseña actualizada con éxito.");
        form.reset();
        localStorage.removeItem("usuarioRecuperacion"); // Limpieza de recuperación
        window.location.href = "ingreso.html";
      } else {
        alert(`❌ Error: ${result.msg || "No se pudo actualizar la contraseña."}`);
      }
    } catch (err) {
      console.error("Error actualizando contraseña:", err);
      alert("❌ Error de conexión con el servidor.");
    }
  });
});