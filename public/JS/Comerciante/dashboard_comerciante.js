let chartInstance = null; // Guardar instancia del gráfico para poder actualizarlo
let datosCompletos = []; // Guardar todos los datos sin filtrar

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔵 Dashboard comerciante - Iniciando...');
  await cargarDashboard();
  
  // Configurar listeners para los filtros
  const filtroDia = document.getElementById('dia');
  const filtroMes = document.getElementById('mes');
  const filtroAnio = document.getElementById('anio');
  
  if (filtroDia) {
    filtroDia.addEventListener('change', aplicarFiltros);
  }
  if (filtroMes) {
    filtroMes.addEventListener('change', aplicarFiltros);
  }
  if (filtroAnio) {
    filtroAnio.addEventListener('change', aplicarFiltros);
  }
});

async function cargarDashboard(filtros = {}) {
  try {
    console.log('🔵 Solicitando /api/dashboard/comerciante...');
    
    // Construir URL con parámetros de filtro
    let url = '/api/dashboard/comerciante';
    const params = new URLSearchParams();
    if (filtros.dia) params.append('dia', filtros.dia);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.anio) params.append('anio', filtros.anio);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    console.log('🔵 URL:', url);
    
    const res = await fetch(url, {
      credentials: 'include'
    });
    console.log('🔵 Response status:', res.status);
    
    // Si no hay sesión, redirigir al login
    if (res.status === 401) {
      console.warn('⚠️ No hay sesión activa, redirigiendo al login...');
      window.location.href = '../General/Ingreso.html';
      return;
    }
    
    const data = await res.json();
    console.log('🔵 Datos recibidos:', data);

    if (data.error) {
      console.error('❌ Error en el dashboard:', data.error);
      // Aún así mostrar un gráfico vacío
      actualizarGrafico({ categorias: [], ventasPorCategoria: [] });
      return;
    }

    // Guardar datos completos
    datosCompletos = data;

    // 🧮 Actualizar datos en las tarjetas principales
    const totalVentasEl = document.getElementById('totalProductos');
    const totalRecaudadoEl = document.getElementById('totalRecaudado');
    console.log('🔵 Elementos encontrados:', {totalVentasEl: !!totalVentasEl, totalRecaudadoEl: !!totalRecaudadoEl});
    if (totalVentasEl) totalVentasEl.textContent = data.totalVentas || 0;
    if (totalRecaudadoEl) totalRecaudadoEl.textContent = `$${data.totalRecaudado.toLocaleString()}`;

    // Ventas recientes
    const ventasHoyEl = document.getElementById('ventasHoy');
    const ventasSemanaEl = document.getElementById('ventasSemana');
    if (ventasHoyEl) ventasHoyEl.textContent = `$${data.ventasHoy.toLocaleString()}`;
    if (ventasSemanaEl) ventasSemanaEl.textContent = `$${data.ventasSemana.toLocaleString()}`;

    console.log('🔵 Datos de categorías:', {categorias: data.categorias, ventas: data.ventasPorCategoria});

    // 📊 Gráfica de ventas por categoría
    actualizarGrafico(data);

    // 💡 Mostrar totales por categoría
    const promedioDiv = document.getElementById('promedioCategorias');
    console.log('🔵 Elemento promedioCategorias:', !!promedioDiv);
    if (promedioDiv) {
      promedioDiv.innerHTML = '';
      
      if (data.categorias && data.categorias.length > 0) {
        data.categorias.forEach((cat, i) => {
          const monto = data.ventasPorCategoria[i] || 0;
          const p = document.createElement('p');
          p.className = 'card-text';
          p.innerHTML = `📦 ${cat}: <strong>$${monto.toLocaleString()}</strong>`;
          promedioDiv.appendChild(p);
        });
        console.log('✅ Promedios por categoría actualizados');
      } else {
        const p = document.createElement('p');
        p.className = 'card-text text-muted';
        p.innerHTML = '📊 <em>Sin ventas aún</em>';
        promedioDiv.appendChild(p);
      }
    }

    console.log('✅ Dashboard cargado completamente');

  } catch (error) {
    console.error('❌ Error al cargar dashboard:', error);
    // Mostrar gráfico vacío en caso de error de conexión
    actualizarGrafico({ categorias: [], ventasPorCategoria: [] });
  }
}

function actualizarGrafico(data) {
  const ctx = document.getElementById('graficoVentas');
  if (!ctx) return;
  
  // Destruir gráfico anterior si existe
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Si no hay categorías o están vacías, mostrar mensaje
  const categorias = data.categorias || [];
  const ventasPorCategoria = data.ventasPorCategoria || [];
  
  if (categorias.length === 0) {
    console.log('🔵 No hay ventas registradas, mostrando mensaje');
    // Mostrar gráfico con mensaje de "Sin datos"
    chartInstance = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Sin ventas registradas'],
        datasets: [{
          label: 'Ventas por categoría',
          data: [0],
          backgroundColor: ['#6c757d'],
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { 
            labels: { color: '#ffffff' },
            display: true
          },
          title: {
            display: true,
            text: 'Aún no tienes ventas registradas',
            color: '#ffc107',
            font: { size: 16 }
          }
        },
        scales: {
          x: { 
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255,255,255,0.2)' }
          },
          y: { 
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255,255,255,0.2)' },
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
    return;
  }
  
  console.log('🔵 Creando/actualizando gráfico con Chart.js...');
  chartInstance = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: categorias,
      datasets: [{
        label: 'Ventas por categoría ($)',
        data: ventasPorCategoria,
        backgroundColor: ['#ff6b00', '#ff9100', '#ffd180', '#ffb74d', '#ffa726', '#ffab00'],
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { 
          labels: { color: '#ffffff' },
          display: true
        },
        title: {
          display: true,
          text: 'Ventas por Categoría',
          color: '#ffffff'
        }
      },
      scales: {
        x: { 
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255,255,255,0.2)' }
        },
        y: { 
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255,255,255,0.2)' },
          beginAtZero: true
        }
      }
    }
  });
  console.log('✅ Gráfico creado/actualizado');
}

function aplicarFiltros() {
  console.log('🔵 Aplicando filtros...');
  const dia = document.getElementById('dia')?.value || '';
  const categoria = document.getElementById('mes')?.value || ''; // Ya tiene el valor correcto del select
  const anio = document.getElementById('anio')?.value || '';
  
  const filtros = {};
  if (dia) filtros.dia = dia;
  if (categoria) filtros.categoria = categoria; // Si es vacío (Todos), no se envía y muestra todas las categorías
  if (anio) filtros.anio = anio;
  
  console.log('🔵 Filtros aplicados:', filtros);
  
  // Recargar dashboard con filtros
  cargarDashboard(filtros);
}
