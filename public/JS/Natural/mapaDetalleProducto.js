// Mapa específico para la página de detalle de producto
// Solo muestra la ubicación del taller que publicó el producto

document.addEventListener("DOMContentLoaded", () => {
  // Esperar a que se cargue el detalle de la publicación
  const params = new URLSearchParams(window.location.search);
  const idPublicacion = params.get('id');

  if (!idPublicacion) {
    console.error('No se proporcionó id de publicación');
    return;
  }

  // Escuchar evento personalizado del script detallePublicacion.js
  window.addEventListener('publicacionCargada', (event) => {
    const publicacion = event.detail;
    inicializarMapa(publicacion);
  });

  // Si ya está disponible globalmente (por si acaso)
  if (window.publicacionDetalle) {
    inicializarMapa(window.publicacionDetalle);
  }
});

function inicializarMapa(publicacion) {
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.warn('No se encontró el elemento #map');
    return;
  }

  const lat = publicacion.Latitud;
  const lng = publicacion.Longitud;

  // Si no hay coordenadas, mostrar Bogotá por defecto y un mensaje
  if (!lat || !lng) {
    const map = L.map('map').setView([4.60971, -74.08175], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    L.marker([4.60971, -74.08175])
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center;">
          <b>⚠️ Ubicación no disponible</b><br>
          <span style="font-size: 12px;">Este taller no ha registrado su ubicación</span>
        </div>
      `)
      .openPopup();
    
    return;
  }

  // Crear mapa centrado en la ubicación del taller
  const map = L.map('map').setView([lat, lng], 15);

  // Capa base de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Icono personalizado para el taller
  const tallerIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: #dc3545;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
        font-size: 13px;
      ">
        <i class="fas fa-store"></i> ${publicacion.NombreComercio || 'Taller'}
      </div>
    `,
    iconSize: [150, 40],
    iconAnchor: [75, 40]
  });

  // Agregar marcador del taller
  L.marker([lat, lng], { icon: tallerIcon })
    .addTo(map)
    .bindPopup(`
      <div style="min-width: 200px;">
        <b style="font-size: 16px; color: #dc3545;">${publicacion.NombreComercio || "Taller"}</b><br><br>
        ${publicacion.Barrio ? `<b>📍 Barrio:</b> ${publicacion.Barrio}<br>` : ''}
        ${publicacion.Direccion ? `<b>🏠 Dirección:</b> ${publicacion.Direccion}<br>` : ''}
        ${publicacion.DiasAtencion ? `<b>📅 Días:</b> ${publicacion.DiasAtencion}<br>` : ''}
        ${publicacion.HoraInicio && publicacion.HoraFin ? `<b>🕐 Horario:</b> ${publicacion.HoraInicio} - ${publicacion.HoraFin}` : ''}
      </div>
    `)
    .openPopup();

  // Agregar círculo de área aproximada
  L.circle([lat, lng], {
    color: '#dc3545',
    fillColor: '#dc3545',
    fillOpacity: 0.1,
    radius: 300
  }).addTo(map);
}
