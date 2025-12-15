/**
 * Script de protección de páginas
 * Evita el acceso a páginas sin sesión válida
 * Previene problemas de caché al cerrar sesión
 */

(function() {
  'use strict';
  
  // Evitar que se pueda volver atrás después de cerrar sesión
  window.history.pushState(null, '', window.location.href);
  window.onpopstate = function() {
    // Verificar si hay sesión activa
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    if (!usuarioActivo) {
      // No hay sesión, redirigir al login
      window.location.replace('/General/Ingreso.html');
    } else {
      // Hay sesión, permitir navegación pero actualizar el estado
      window.history.pushState(null, '', window.location.href);
    }
  };
  
  // Verificar sesión al cargar la página
  async function verificarSesionActiva() {
    try {
      const response = await fetch('/api/verificar-sesion');
      const data = await response.json();
      
      if (!data.activa) {
        // No hay sesión en el servidor, limpiar localStorage
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('productoCompra');
        
        // Si estamos en una página protegida, redirigir
        const paginasProtegidas = [
          '/Natural/', '/Comerciante/', '/PrestadorServicios/', '/Administrador/'
        ];
        
        const rutaActual = window.location.pathname;
        const esProtegida = paginasProtegidas.some(ruta => rutaActual.includes(ruta));
        
        if (esProtegida) {
          console.warn('⚠️ Sesión no válida, redirigiendo al login');
          window.location.replace('/General/Ingreso.html');
        }
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
    }
  }
  
  // Ejecutar verificación al cargar la página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarSesionActiva);
  } else {
    verificarSesionActiva();
  }
  
  // Evitar caché de páginas
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      // La página fue cargada desde el caché del navegador
      verificarSesionActiva();
    }
  });
})();
