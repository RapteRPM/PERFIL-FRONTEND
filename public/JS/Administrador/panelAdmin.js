// Panel de Administrador - Dashboard
document.addEventListener('DOMContentLoaded', () => {
  cargarEstadisticas();
});

// Cargar estadísticas del panel
async function cargarEstadisticas() {
  try {
    const response = await fetch('/api/admin/estadisticas');
    
    if (!response.ok) {
      throw new Error('Error al cargar estadísticas');
    }
    
    const data = await response.json();
    
    // Actualizar los contadores
    document.getElementById('total-usuarios').textContent = data.totalUsuarios || 0;
    document.getElementById('total-publicaciones').textContent = data.totalPublicaciones || 0;
    document.getElementById('total-pqr').textContent = data.totalPQR || 0;
    document.getElementById('total-ventas').textContent = data.ventasHoy || 0;
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
    // Mantener valores en 0 si hay error
  }
}
