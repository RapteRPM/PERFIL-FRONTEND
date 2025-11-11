document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('tabla-carrito');
  const totalGeneral = document.getElementById('total-general');

  try {
    const response = await fetch('/api/carrito');
    if (!response.ok) throw new Error('Error al obtener el carrito');

    const carrito = await response.json();

    tbody.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-gray-600">
            🛒 Tu carrito está vacío
          </td>
        </tr>
      `;
      totalGeneral.textContent = '$0.00';
      return;
    }

    carrito.forEach((producto) => {
      const subtotal = producto.Precio * producto.Cantidad;
      total += subtotal;

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${producto.NombreProducto}</td>
        <td>$${Number(producto.Precio || 0).toLocaleString('es-CO')}</td>
        <td>
          <input 
            type="number" 
            min="1" 
            value="${producto.Cantidad}" 
            onchange="cambiarCantidad(${producto.IdCarrito}, this.value)"
            class="border rounded px-2 py-1 w-20 text-center"
          >
        </td>
        <td>$${subtotal.toLocaleString()}</td>
        <td>
          <button 
            class="btn btn-danger btn-sm" 
            onclick="eliminarProducto(${producto.IdCarrito})">
            Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(fila);
    });

    totalGeneral.textContent = `$${total.toLocaleString()}`;
  } catch (error) {
    console.error('❌ Error al cargar carrito:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-red-600">
          ⚠️ Error al cargar el carrito. Intenta nuevamente.
        </td>
      </tr>
    `;
  }
});

// 🔄 Cambiar cantidad de un producto
async function cambiarCantidad(idCarrito, nuevaCantidad) {
  try {
    await fetch(`/api/carrito/${idCarrito}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad: nuevaCantidad }),
    });
    location.reload();
  } catch (err) {
    console.error('❌ Error al actualizar cantidad:', err);
  }
}

// ❌ Eliminar producto del carrito
async function eliminarProducto(idCarrito) {
  if (!confirm('¿Eliminar este producto del carrito?')) return;

  try {
    await fetch(`/api/carrito/${idCarrito}`, { method: 'DELETE' });
    location.reload();
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err);
  }
}

// ===============================
// 💳 Finalizar compra
// ===============================
function finalizarCompra() {
  alert('🛍️ Redirigiendo a la página de pago...');
  window.location.href = 'Proceso_compra.html';
}
