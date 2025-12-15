// 📁 public/JS/usuarioSesion.js

// 🧭 Función para cargar la info del usuario en el header (nombre y foto)
async function cargarUsuarioHeader() {
  try {
    const res = await fetch("/api/usuario-actual");
    if (!res.ok) throw new Error("No autenticado");

    const data = await res.json();

    const nombreEl = document.getElementById("nombre-usuario");
    const fotoEl = document.getElementById("foto-usuario");

    // Extraer solo el primer nombre
    let nombreMostrar = data.nombre || "Usuario";
    if (nombreMostrar.includes(' ')) {
      nombreMostrar = nombreMostrar.split(' ')[0];
    }

    if (nombreEl) nombreEl.textContent = nombreMostrar;
    
    // Usar ruta absoluta para la foto
    if (fotoEl) {
      // Si data.foto viene con ruta, usar tal cual, sino usar imagen por defecto
      if (data.foto && data.foto.startsWith('/')) {
        fotoEl.src = data.foto;
      } else if (data.foto) {
        fotoEl.src = '/' + data.foto;
      } else {
        fotoEl.src = "/General/IMAGENINGRESO/imagen_perfil.png";
      }
    }
  } catch (error) {
    console.warn("⚠️ No se pudo cargar la sesión:", error);
    const nombreEl = document.getElementById("nombre-usuario");
    const fotoEl = document.getElementById("foto-usuario");

    if (nombreEl) nombreEl.textContent = "Invitado";
    if (fotoEl) fotoEl.src = "/General/IMAGENINGRESO/imagen_perfil.png";
  }
}

// ⚙️ Función general para verificar sesión y tipo de usuario (sin redirigir)
async function verificarSesion(usuarioEsperadoTipo = null) {
  try {
    const res = await fetch("/api/verificar-sesion");
    if (!res.ok) return null;

    const usuario = await res.json();
    if (!usuario) return null;

    // Si se espera un tipo específico y no coincide
    if (usuarioEsperadoTipo && usuario.tipo !== usuarioEsperadoTipo) {
      console.warn(`El usuario no es del tipo esperado (${usuarioEsperadoTipo}).`);
      return null;
    }

    return usuario; // ✅ Devuelve el usuario si está logueado
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    return null;
  }
}
