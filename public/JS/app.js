// 📂 public/JS/app.js

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('user-name').value.trim();
  const password = document.getElementById('input-pass').value.trim();
  const mensajeError = document.getElementById('mensaje-error');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      // ✅ Guardar en localStorage
        localStorage.setItem("usuarioActivo", JSON.stringify({
          id: data.idUsuario,
          nombre: data.usuario,
          tipo: data.tipo
        }));


      // ✅ Redirigir según tipo de usuario
      if (data.tipo === 'Natural') {
        window.location.href = '/Natural/perfil_usuario.html';
      } else if (data.tipo === 'Comerciante') {
        window.location.href = '/Comerciante/perfil_comerciante.html';
      } else if (data.tipo === 'PrestadorServicio') {
        window.location.href = '/PrestadorServicios/perfil_servicios.html';
      } else {
        window.location.href = '/General/index.html';
      }

    } else {
      mensajeError.textContent = data.error || 'Usuario y/o contraseña errada.';
    }
  } catch (error) {
    console.error('❌ Error al conectar con el servidor:', error);
    mensajeError.textContent = 'Error en el servidor. Intenta más tarde.';
  }
});
