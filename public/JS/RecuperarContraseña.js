  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cedula = document.getElementById("cedula").value.trim();

    if (!/^\d+$/.test(cedula)) {
      alert("Ingrese un número de cédula válido");
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/cedula/${cedula}`);
      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("usuarioRecuperacion", JSON.stringify({ id: result.idUsuario }));
        window.location.href = "CambiarContraseña.html";
      } else {
        alert(`❌ ${result.msg}`);
      }
    } catch (err) {
      console.error("Error buscando usuario:", err);
      alert("❌ Error de conexión con el servidor.");
    }
  });