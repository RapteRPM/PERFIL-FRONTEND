document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/dashboard/comerciante', {
      credentials: 'include'
    });
    const data = await res.json();

    if (data.error) {
      console.error('Error en el dashboard:', data.error);
      return;
    }

    // 🧮 Actualizar datos en las tarjetas principales
    const totalVentasEl = document.getElementById('totalProductos');
    const totalRecaudadoEl = document.getElementById('totalRecaudado');
    if (totalVentasEl) totalVentasEl.textContent = data.totalVentas || 0;
    if (totalRecaudadoEl) totalRecaudadoEl.textContent = `$${data.totalRecaudado.toLocaleString()}`;

    // Ventas recientes
    const ventasHoyEl = document.getElementById('ventasHoy');
    const ventasSemanaEl = document.getElementById('ventasSemana');
    if (ventasHoyEl) ventasHoyEl.textContent = `$${data.ventasHoy.toLocaleString()}`;
    if (ventasSemanaEl) ventasSemanaEl.textContent = `$${data.ventasSemana.toLocaleString()}`;

    // 📊 Gráfica de ventas por categoría
    if (data.categorias && data.ventasPorCategoria) {
      const ctx = document.getElementById('graficoVentas').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.categorias,
          datasets: [{
            label: 'Ventas por categoría',
            data: data.ventasPorCategoria,
            backgroundColor: ['#ff6b00', '#ff9100', '#ffd180'],
            borderColor: '#ffffff',
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: '#ffffff' } }
          },
          scales: {
            x: { ticks: { color: '#ffffff' } },
            y: { ticks: { color: '#ffffff' } }
          }
        }
      });
    }

    // 💡 Mostrar totales por categoría
    const promedioDiv = document.getElementById('promedioCategorias');
    if (promedioDiv && data.categorias && data.ventasPorCategoria) {
      promedioDiv.innerHTML = '';
      data.categorias.forEach((cat, i) => {
        const monto = data.ventasPorCategoria[i] || 0;
        const p = document.createElement('p');
        p.className = 'card-text';
        p.innerHTML = `📦 ${cat}: <strong>$${monto.toLocaleString()}</strong>`;
        promedioDiv.appendChild(p);
      });
    }

  } catch (error) {
    console.error('❌ Error al cargar dashboard:', error);
  }
});
