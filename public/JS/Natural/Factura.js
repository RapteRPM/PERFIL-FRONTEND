document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const facturaId = params.get('factura') || params.get('id'); // acepta ambos nombres

  const contenedor = document.querySelector('.factura-container');

  if (!facturaId) {
    contenedor.innerHTML = '<p>No se encontró ID de factura</p>';
    console.warn('⚠️ No se encontró parámetro de factura en la URL');
    return;
  }

  try {
    const res = await fetch(`/api/factura/${facturaId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.msg || 'Error al obtener factura');

    const { factura, detalles } = data;

    // Obtener información del comercio (del primer producto)
    const comercioInfo = detalles.length > 0 ? {
      nombre: detalles[0].NombreComercio || 'No especificado',
      direccion: detalles[0].DireccionComercio || 'No especificada'
    } : { nombre: 'No especificado', direccion: 'No especificada' };

    contenedor.innerHTML = `
      <div class="factura-header text-center mb-4">
        <h2>Factura de Compra</h2>
        <p class="text-muted">Transacción confirmada</p>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="mt-3">
            <h5><i class="fas fa-user text-primary"></i> Datos del Comprador</h5>
            <p><strong>Nombre:</strong> ${factura.NombreUsuario} ${factura.ApellidoUsuario}</p>
            <p><strong>Correo:</strong> ${factura.Correo}</p>
            <p><strong>Teléfono:</strong> ${factura.Telefono || 'No registrado'}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mt-3">
            <h5><i class="fas fa-store text-success"></i> Datos del Comercio</h5>
            <p><strong>Nombre:</strong> ${comercioInfo.nombre}</p>
            <p><strong>Dirección:</strong> ${comercioInfo.direccion}</p>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <h5><i class="fas fa-file-invoice text-info"></i> Detalles de la Factura</h5>
        <p><strong>N°:</strong> #FAC-${factura.IdFactura}</p>
        <p><strong>Fecha:</strong> ${new Date(factura.FechaCompra).toLocaleString()}</p>
        <p><strong>Método de pago:</strong> ${factura.MetodoPago || 'No especificado'}</p>
        <p><strong>Estado:</strong> ✅ ${factura.Estado}</p>
      </div>

      <div class="mt-4" id="seccion-productos">
        <h5><i class="fas fa-shopping-cart text-warning"></i> Productos Comprados</h5>
        <table class="table table-striped text-center align-middle">
          <thead class="table-dark">
            <tr>
              <th>Producto</th>
              <th>Comercio</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${detalles.map(d => `
              <tr>
                <td>${d.NombreProducto}</td>
                <td><small class="text-muted">${d.NombreComercio || 'N/A'}</small></td>
                <td>${d.Cantidad}</td>
                <td>$${Number(d.PrecioUnitario).toLocaleString()}</td>
                <td>$${Number(d.Total).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="fw-bold text-end mt-3 fs-5">
          Total Pagado: <span class="text-primary">$${Number(factura.TotalPago).toLocaleString()}</span>
        </p>
      </div>

      <div class="text-center mt-4 d-flex justify-content-center gap-3">
        <button class="btn btn-success px-4 py-2 rounded-3 shadow-sm" onclick="descargarPDF()">
          <i class="fas fa-file-pdf me-2"></i> Descargar Factura (PDF)
        </button>
        <a href="Historial_compras.html" class="btn btn-outline-primary px-4 py-2 rounded-3">
          <i class="fas fa-arrow-left me-2"></i> Volver al Historial
        </a>
      </div>
    `;

    // Guardar datos globalmente para la descarga PDF
    window.facturaData = { factura, detalles, comercioInfo };

  } catch (error) {
    console.error('❌ Error cargando factura:', error);
    contenedor.innerHTML = '<p>No se pudo cargar la factura</p>';
  }
});

// Función para descargar la factura como PDF
function descargarPDF() {
  const { factura, detalles, comercioInfo } = window.facturaData;
  
  // Crear contenido HTML para el PDF
  const contenidoPDF = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Factura #FAC-${factura.IdFactura}</title>
      <style>
        body { font-family: 'Inter', 'Arial', sans-serif; padding: 20px; color: #1f2937; background-color: #f3f4f6; }
        .header { text-align: center; background: linear-gradient(135deg, red, #004B87); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; margin-bottom: 20px; }
        .header h1 { color: white; margin: 10px 0; font-size: 28px; font-weight: bold; }
        .header p { color: #e5e7eb; margin: 5px 0; font-style: italic; }
        .logo { font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px; }
        .section { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .section h3 { color: #004B87; border-bottom: 2px solid #004B87; padding-bottom: 8px; margin-bottom: 15px; font-weight: bold; }
        .row { display: flex; justify-content: space-between; gap: 20px; }
        .col { width: 48%; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: center; }
        th { background: linear-gradient(135deg, red, #004B87); color: white; font-weight: bold; }
        tbody tr:nth-child(even) { background-color: #f9fafb; }
        .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 15px; color: #004B87; background: #e0f2fe; padding: 10px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #004B87; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">RPM</div>
        <h1>FACTURA DE COMPRA</h1>
        <p>Confianza que mueve tu camino</p>
      </div>
      
      <div class="row">
        <div class="col">
          <div class="section">
            <h3>Datos del Comprador</h3>
            <p><strong>Nombre:</strong> ${factura.NombreUsuario} ${factura.ApellidoUsuario}</p>
            <p><strong>Correo:</strong> ${factura.Correo}</p>
            <p><strong>Teléfono:</strong> ${factura.Telefono || 'No registrado'}</p>
          </div>
        </div>
        <div class="col">
          <div class="section">
            <h3>Datos del Comercio</h3>
            <p><strong>Nombre:</strong> ${comercioInfo.nombre}</p>
            <p><strong>Dirección:</strong> ${comercioInfo.direccion}</p>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3>Detalles de la Factura</h3>
        <p><strong>N° Factura:</strong> #FAC-${factura.IdFactura}</p>
        <p><strong>Fecha:</strong> ${new Date(factura.FechaCompra).toLocaleString()}</p>
        <p><strong>Método de pago:</strong> ${factura.MetodoPago || 'No especificado'}</p>
        <p><strong>Estado:</strong> ✅ ${factura.Estado}</p>
      </div>
      
      <div class="section">
        <h3>Productos Comprados</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Comercio</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${detalles.map(d => `
              <tr>
                <td>${d.NombreProducto}</td>
                <td>${d.NombreComercio || 'N/A'}</td>
                <td>${d.Cantidad}</td>
                <td>$${Number(d.PrecioUnitario).toLocaleString()}</td>
                <td>$${Number(d.Total).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="total">Total Pagado: $${Number(factura.TotalPago).toLocaleString()}</p>
      </div>
      
      <div class="footer">
        <p>RPM Market - rpmservice2026@gmail.com - Tel: 301 403 8181</p>
        <p>Gracias por su compra</p>
      </div>
    </body>
    </html>
  `;
  
  // Abrir ventana de impresión
  const ventana = window.open('', '_blank');
  ventana.document.write(contenidoPDF);
  ventana.document.close();
  
  // Esperar a que cargue y luego imprimir
  ventana.onload = function() {
    ventana.print();
  };
}
