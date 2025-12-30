// 📂 public/JS/app.js

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('user-name').value.trim();
  const password = document.getElementById('input-pass').value.trim();
  const mensajeError = document.getElementById('mensaje-error');

  try {
    // 🔄 Crear timeout de 5 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.success) {
      // ✅ Guardar en localStorage
        localStorage.setItem("usuarioActivo", JSON.stringify({
          id: data.idUsuario,
          nombre: data.usuario,
          tipo: data.tipo
        }));


      // ✅ Redirigir según tipo de usuario
      if (data.redirect) {
        // Redirección personalizada desde el backend (para Administrador)
        window.location.href = data.redirect;
      } else if (data.tipo === 'Natural') {
        window.location.href = '/Natural/perfil_usuario.html';
      } else if (data.tipo === 'Comerciante') {
        window.location.href = '/Comerciante/perfil_comerciante.html';
      } else if (data.tipo === 'PrestadorServicio') {
        window.location.href = '/PrestadorServicios/perfil_servicios.html';
      } else {
        window.location.href = '/General/index.html';
      }

    } else {
      // Verificar si es un error por usuario inactivo
      if (data.requiereAprobacion && data.estado === 'Inactivo') {
        mensajeError.textContent = '⏳ ' + data.error;
        mensajeError.style.color = '#ff9800'; // Color naranja para indicar pendiente
      } else {
        mensajeError.textContent = data.error || 'Usuario y/o contraseña errada.';
      }
    }
  } catch (error) {
    console.error('❌ Error al conectar con el servidor:', error);
    if (error.name === 'AbortError') {
      mensajeError.textContent = '⚠️ El servidor no responde. Intenta más tarde.';
    } else {
      mensajeError.textContent = 'Error en el servidor. Intenta más tarde.';
    }
  }
});
