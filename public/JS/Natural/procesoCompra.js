document.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tabla-productos");
  const totalGeneral = document.getElementById("total-general");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const campoRecoger = document.getElementById("campoRecoger");
  const infoComercioDiv = document.getElementById("infoComercio");

  // Mostrar/ocultar campos adicionales para recoger en comercio
  document.querySelectorAll("input[name='metodoPago']").forEach(radio => {
    radio.addEventListener("change", () => {
      campoRecoger.classList.toggle("d-none", !(radio.value === "recoger" && radio.checked));
    });
  });

  // 🛒 Cargar productos del carrito desde la API
  let comercio = { nombre: '', direccion: '' };
  try {
    const resp = await fetch("/api/proceso-compra");
    if (!resp.ok) throw new Error("Error al obtener productos del carrito");

    const carrito = await resp.json();
    tabla.innerHTML = "";
    let total = 0;

    if (!Array.isArray(carrito) || carrito.length === 0) {
      tabla.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay productos en el carrito.</td></tr>`;
      totalGeneral.textContent = "$0.00";
      return;
    }

    // Usamos el primer registro para extraer datos del comercio
    comercio = {
      nombre: carrito[0].NombreComercio || carrito[0].NombreUsuarioComercio || "No especificado",
      direccion: carrito[0].DireccionComercio || "No especificada"
    };

    carrito.forEach(item => {
      const subtotal = Number(item.Subtotal);
      total += subtotal;

      tabla.innerHTML += `
        <tr>
          <td>${item.Producto}</td>
          <td class="text-center">${item.Cantidad}</td>
          <td>$${Number(item.Precio).toLocaleString()}</td>
          <td>$${subtotal.toLocaleString()}</td>
        </tr>
      `;
    });

    totalGeneral.textContent = `$${total.toLocaleString()}`;

    // Mostrar información del comercio
    if (infoComercioDiv) {
      infoComercioDiv.innerHTML = `
        <strong>Comercio:</strong> ${comercio.nombre}<br>
        <small>Dirección: ${comercio.direccion}</small>
      `;
    }
  } catch (err) {
    console.error("❌ Error cargando proceso de compra:", err);
    tabla.innerHTML = `<tr><td colspan="4" class="text-center text-danger">⚠️ Error al cargar los productos.</td></tr>`;
    totalGeneral.textContent = "$0.00";
  }

  // 💳 Finalizar compra
  btnFinalizar.addEventListener("click", async (e) => {
    e.preventDefault();

    const metodoPago = document.querySelector("input[name='metodoPago']:checked")?.value;
    if (!metodoPago) return alert("Selecciona un método de pago.");

    const usuarioId = localStorage.getItem("usuarioId") || null;

    const datos = {
      usuarioId,
      metodoPago,
      fechaRecoger: document.getElementById("fechaRecoger")?.value || null,
      horaRecoger: document.getElementById("horaRecoger")?.value || null,
      comentariosRecoger: document.getElementById("comentariosRecoger")?.value || null
    };

    // Validaciones básicas

    if (metodoPago === "recoger" && (!datos.fechaRecoger || !datos.horaRecoger)) {
      return alert("Debes seleccionar fecha y hora para recoger en comercio.");
    }

    try {
      const response = await fetch("/api/finalizar-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.redirect) {
          alert(result.message);
          window.location.href = result.redirect;
        } else {
          const mensajeDiv = document.createElement("div");
          mensajeDiv.className = "alert alert-success mt-4 text-center";
          mensajeDiv.textContent = result.message;
          document.querySelector("main.container").appendChild(mensajeDiv);

          tabla.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay productos en el carrito.</td></tr>`;
          totalGeneral.textContent = "$0.00";

          btnFinalizar.disabled = true;
          btnFinalizar.textContent = "Compra registrada";
        }
      } else {
        alert("❌ " + (result.message || "Error al registrar la compra."));
      }
    } catch (err) {
      console.error("❌ Error al finalizar compra:", err);
      alert("Error de conexión con el servidor.");
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const producto = JSON.parse(localStorage.getItem('productoCompra'));

  if (!producto) {
    document.getElementById('tabla-productos').innerHTML = `
      <tr><td colspan="4" class="text-center text-danger">No se encontró información del producto.</td></tr>
    `;
    return;
  }

  const cantidad = 1;
  const precioUnitario = Number(producto.precio);
  const total = precioUnitario * cantidad;

  const filaHTML = `
    <tr class="text-center">
      <td>${producto.nombre}</td>
      <td>${cantidad}</td>
      <td>$${precioUnitario.toLocaleString('es-CO')}</td>
      <td>$${total.toLocaleString('es-CO')}</td>
    </tr>
  `;

  document.getElementById('tabla-productos').innerHTML = filaHTML;
  document.getElementById('total-general').textContent = `$${total.toLocaleString('es-CO')}`;

  // Si tienes datos del comercio, puedes mostrarlos aquí también
  if (document.getElementById('nombreComercio')) {
    document.getElementById('nombreComercio').textContent = producto.nombreComercio || 'No especificado';
  }
  if (document.getElementById('direccionComercio')) {
    document.getElementById('direccionComercio').textContent = producto.direccionComercio || 'No especificada';
  }
});