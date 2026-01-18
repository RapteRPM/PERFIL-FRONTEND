// 📁 public/JS/perfil_usuario.js

document.addEventListener('DOMContentLoaded', async () => {
  console.log("🔵 perfil_usuario.js - Iniciando...");
  
  const nombreUsuario = document.getElementById('nombre-usuario');
  const fotoUsuario = document.getElementById('foto-usuario');

  try {
    console.log("🔵 Solicitando /api/usuario-actual...");
    const response = await fetch('/api/usuario-actual');
    console.log("🔵 Response status:", response.status);
    
    if (!response.ok) {
      console.log("⚠️ Response no OK, lanzando error");
      throw new Error("Error al obtener datos del usuario");
    }

    const data = await response.json();
    console.log("✅ Datos recibidos:", data);

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
    console.error("❌ Error en perfil_usuario.js:", error.message);
    console.error("❌ Stack:", error.stack);

    // Si no hay sesión activa, limpiar localStorage
    localStorage.removeItem('usuarioActivo');

    // Ocultar el dropdown completo si no hay usuario logueado
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
      console.log("🔵 Ocultando dropdown (no hay sesión)");
      dropdown.style.display = 'none';
    }
  }
});
