// 📁 public/JS/perfil_usuario.js

document.addEventListener('DOMContentLoaded', async () => {
  const nombreUsuario = document.getElementById('nombre-usuario');
  const fotoUsuario = document.getElementById('foto-usuario');

  try {
    const response = await fetch('/api/usuario-actual');
    if (!response.ok) throw new Error("Error al obtener datos del usuario");

    const data = await response.json();

    // Extraer solo el primer nombre
    let nombreMostrar = data.nombre || 'Usuario';
    if (nombreMostrar.includes(' ')) {
      nombreMostrar = nombreMostrar.split(' ')[0];
    }

    // Mostrar datos en el header
    nombreUsuario.textContent = nombreMostrar;
    fotoUsuario.src = data.foto || '/imagen/imagen_perfil.png';

    // 🧩 Guardar usuario en localStorage para usarlo en otras páginas
    localStorage.setItem('usuarioActivo', JSON.stringify({
      id: data.id || data.IdUsuario, // asegúrate que el backend devuelva "id"
      nombre: data.nombre,
      tipo: data.tipo
    }));

    console.log("✅ Datos del usuario cargados:", data);

  } catch (error) {
    console.error("❌ Error al obtener datos del usuario:", error);

    // Si no hay sesión activa, limpiar localStorage
    localStorage.removeItem('usuarioActivo');

    nombreUsuario.textContent = 'Invitado';
    fotoUsuario.src = '/imagen/imagen_perfil.png';
  }
});
