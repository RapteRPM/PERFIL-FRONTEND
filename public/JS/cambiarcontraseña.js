document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const tituloElement = document.querySelector(".contenedor-cambiar h2");
  const descripcionElement = document.querySelector(".contenedor-cambiar p");

  // Detectar si viene de registro nuevo
  const usuarioRecuperacion = JSON.parse(localStorage.getItem("usuarioRecuperacion"));
  const esNuevoRegistro = usuarioRecuperacion?.esNuevoRegistro;

  if (esNuevoRegistro) {
    tituloElement.innerHTML = '<i class="fa-solid fa-key"></i> Crear Contraseña';
    descripcionElement.textContent = 'Bienvenido. Crea tu contraseña para acceder a tu cuenta.';
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nueva = document.getElementById("nuevaContrasena").value.trim();
    const confirmar = document.getElementById("confirmarContrasena").value.trim();

    if (nueva !== confirmar) {
      alert("❌ Las contraseñas no coinciden.");
      return;
    }

    // Validar longitud mínima
    if (nueva.length < 6) {
      alert("❌ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Validar que tenga al menos una mayúscula
    if (!/[A-Z]/.test(nueva)) {
      alert("❌ La contraseña debe contener al menos una letra mayúscula.");
      return;
    }

    // Validar que tenga al menos un número
    if (!/[0-9]/.test(nueva)) {
      alert("❌ La contraseña debe contener al menos un número.");
      return;
    }

    // Validar que tenga al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nueva)) {
      alert("❌ La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{};\':\"|,.<>?/).");
      return;
    }

    // Detectar si viene de recuperación o sesión activa
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
        if (esNuevoRegistro) {
          alert("✅ Contraseña creada con éxito. Ya puedes iniciar sesión.");
        } else {
          alert("✅ Contraseña actualizada con éxito. Tu sesión se cerrará por seguridad.");
        }
        
        // Limpiar completamente el localStorage y sessionStorage
        localStorage.removeItem("usuarioRecuperacion");
        localStorage.removeItem("usuarioActivo");
        sessionStorage.clear();
        localStorage.clear();
        
        form.reset();
        
        // Redirigir al login
        window.location.href = "Ingreso.html";
      } else {
        alert(`❌ Error: ${result.msg || "No se pudo actualizar la contraseña."}`);
      }
    } catch (err) {
      console.error("Error actualizando contraseña:", err);
      alert("❌ Error de conexión con el servidor.");
    }
  });
});