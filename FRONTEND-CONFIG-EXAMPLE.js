// ===============================
// 🔧 Configuración del Frontend para conectar con el Backend
// ===============================

/**
 * Este archivo muestra cómo debe configurarse el frontend
 * para conectarse correctamente con el backend separado.
 */

// 1. URL base del backend
const API_URL = 'http://localhost:3000';

// 2. Configuración estándar de fetch con credenciales
const fetchConfig = {
  method: 'POST', // o GET, PUT, DELETE según sea necesario
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include' // ¡IMPORTANTE! Permite enviar/recibir cookies
};

// ===============================
// 📝 Ejemplos de uso
// ===============================

// Ejemplo 1: Login
async function login(usuario, password) {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Importante para recibir la cookie de sesión
      body: JSON.stringify({ usuario, password })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Login exitoso:', data);
      // Redirigir según tipo de usuario
      window.location.href = data.redirect;
    } else {
      console.error('Error en login:', data.message);
    }
  } catch (error) {
    console.error('Error de conexión:', error);
  }
}

// Ejemplo 2: Verificar sesión
async function verificarSesion() {
  try {
    const response = await fetch(`${API_URL}/api/verificar-sesion`, {
      method: 'GET',
      credentials: 'include' // Importante para enviar la cookie de sesión
    });

    const data = await response.json();
    
    if (data.activa) {
      console.log('Sesión activa:', data);
      return data;
    } else {
      console.log('No hay sesión activa');
      // Redirigir al login
      window.location.href = '/Ingreso.html';
      return null;
    }
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return null;
  }
}

// Ejemplo 3: Obtener datos (GET)
async function obtenerPublicaciones() {
  try {
    const response = await fetch(`${API_URL}/api/publicaciones`, {
      method: 'GET',
      credentials: 'include' // Siempre incluir credentials
    });

    const publicaciones = await response.json();
    console.log('Publicaciones:', publicaciones);
    return publicaciones;
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    return [];
  }
}

// Ejemplo 4: Enviar datos (POST)
async function crearPublicacion(datos) {
  try {
    const response = await fetch(`${API_URL}/api/publicaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(datos)
    });

    const resultado = await response.json();
    console.log('Publicación creada:', resultado);
    return resultado;
  } catch (error) {
    console.error('Error al crear publicación:', error);
    return null;
  }
}

// Ejemplo 5: Actualizar datos (PUT)
async function actualizarPublicacion(id, datos) {
  try {
    const response = await fetch(`${API_URL}/api/publicaciones/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(datos)
    });

    const resultado = await response.json();
    console.log('Publicación actualizada:', resultado);
    return resultado;
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    return null;
  }
}

// Ejemplo 6: Eliminar datos (DELETE)
async function eliminarPublicacion(id) {
  try {
    const response = await fetch(`${API_URL}/api/publicaciones/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const resultado = await response.json();
    console.log('Publicación eliminada:', resultado);
    return resultado;
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    return null;
  }
}

// Ejemplo 7: Subir archivos (FormData)
async function subirImagen(archivo) {
  try {
    const formData = new FormData();
    formData.append('imagen', archivo);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      credentials: 'include', // No incluir Content-Type cuando usas FormData
      body: formData
    });

    const resultado = await response.json();
    console.log('Imagen subida:', resultado);
    return resultado;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return null;
  }
}

// Ejemplo 8: Logout
async function logout() {
  try {
    const response = await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();
    console.log('Logout exitoso:', data);
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}

// ===============================
// 🚨 Manejo de Errores Global
// ===============================

// Función helper para manejar respuestas
async function fetchWithErrorHandling(url, options = {}) {
  try {
    // Asegurar que siempre se incluyan credentials
    options.credentials = 'include';

    const response = await fetch(url, options);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Si es 401 (No autorizado), redirigir al login
      if (response.status === 401) {
        console.log('Sesión expirada, redirigiendo al login...');
        window.location.href = '/Ingreso.html';
        return null;
      }

      // Para otros errores, lanzar excepción
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // Intentar parsear JSON
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error en la petición:', error);
    
    // Mostrar mensaje al usuario
    alert('Error de conexión con el servidor. Por favor, intenta de nuevo.');
    
    return null;
  }
}

// Ejemplo de uso con manejo de errores
async function ejemploConManejoErrores() {
  const publicaciones = await fetchWithErrorHandling(
    `${API_URL}/api/publicaciones`,
    { method: 'GET' }
  );

  if (publicaciones) {
    console.log('Publicaciones obtenidas:', publicaciones);
  }
}

// ===============================
// 📦 Exportar funciones (si usas módulos)
// ===============================

// Si el frontend usa módulos ES6:
export {
  API_URL,
  login,
  logout,
  verificarSesion,
  obtenerPublicaciones,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  subirImagen,
  fetchWithErrorHandling
};

// ===============================
// 🔗 Rutas de imágenes
// ===============================

/**
 * Para mostrar imágenes del backend, usa:
 * <img src="http://localhost:3000/imagen/ruta/imagen.jpg">
 * 
 * Ejemplo:
 * <img src="${API_URL}/imagen/Natural/123456/foto.jpg">
 */

// ===============================
// ⚠️ IMPORTANTE - Checklist
// ===============================

/**
 * ✅ SIEMPRE incluir `credentials: 'include'` en fetch
 * ✅ NO incluir `Content-Type` cuando uses FormData
 * ✅ Usar `${API_URL}` para todas las rutas API
 * ✅ Manejar errores 401 para sesiones expiradas
 * ✅ Verificar la sesión al cargar páginas protegidas
 * ✅ Usar rutas relativas para navegación local del frontend
 * ✅ Usar rutas absolutas con API_URL para peticiones al backend
 */
