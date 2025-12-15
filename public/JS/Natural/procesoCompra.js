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

  // 🛒 Verificar primero si hay compra directa desde localStorage
  const productoDirecto = JSON.parse(localStorage.getItem('productoCompra'));
  
  if (productoDirecto) {
    // **COMPRA DIRECTA** - Un solo producto
    console.log("🛍️ Cargando compra directa:", productoDirecto);
    
    const cantidad = 1;
    const precioUnitario = Number(productoDirecto.precio);
    const total = precioUnitario * cantidad;

    tabla.innerHTML = `
      <tr class="text-center">
        <td>${productoDirecto.nombre}</td>
        <td>${cantidad}</td>
        <td>$${precioUnitario.toLocaleString('es-CO')}</td>
        <td>$${total.toLocaleString('es-CO')}</td>
      </tr>
    `;

    totalGeneral.textContent = `$${total.toLocaleString('es-CO')}`;

    // Mostrar info del comercio si existe
    if (infoComercioDiv) {
      infoComercioDiv.innerHTML = `
        <strong>Comercio:</strong> ${productoDirecto.nombreComercio || 'No especificado'}<br>
        <small>Dirección: ${productoDirecto.direccionComercio || 'No especificada'}</small>
      `;
      console.log("ℹ️ Información del comercio mostrada:", productoDirecto.nombreComercio, productoDirecto.direccionComercio);
    }
    
    // NO hacer return aquí, continuar con la configuración del botón
  } else {
    // 🛒 Si no hay compra directa, cargar productos del carrito desde la API
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
      } else {
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
          document.getElementById('nombreComercio').textContent = comercio.nombre;
          document.getElementById('direccionComercio').textContent = comercio.direccion;
        }
      }
    } catch (err) {
      console.error("❌ Error cargando proceso de compra:", err);
      tabla.innerHTML = `<tr><td colspan="4" class="text-center text-danger">⚠️ Error al cargar los productos.</td></tr>`;
      totalGeneral.textContent = "$0.00";
    }
  } // Cierre del else (compra desde carrito)

  // 💳 Finalizar compra
  if (btnFinalizar) {
    console.log("✅ Botón finalizar compra encontrado, agregando listener");
    btnFinalizar.addEventListener("click", async (e) => {
      e.preventDefault();
      
      console.log("🔘 Botón finalizar compra presionado");

      const metodoPago = document.querySelector("input[name='metodoPago']:checked")?.value;
      console.log("💳 Método de pago seleccionado:", metodoPago);
    
    if (!metodoPago) {
      alert("Selecciona un método de pago.");
      return;
    }

    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    const usuarioId = usuarioActivo?.id || null;
    
    console.log("👤 Usuario activo:", usuarioActivo);

    if (!usuarioId) {
      alert("⚠️ Debes iniciar sesión para realizar una compra.");
      window.location.href = "/General/Ingreso.html";
      return;
    }

    // Verificar si es compra directa
    const productoDirecto = JSON.parse(localStorage.getItem('productoCompra'));
    console.log("🛍️ Compra directa:", productoDirecto);

    const datos = {
      usuarioId,
      metodoPago,
      fechaRecoger: document.getElementById("fechaRecoger")?.value || null,
      horaRecoger: document.getElementById("horaRecoger")?.value || null,
      comentariosRecoger: document.getElementById("comentariosRecoger")?.value || null,
      // Agregar datos de compra directa si existen
      compraDirecta: productoDirecto ? {
        idPublicacion: productoDirecto.id,
        nombre: productoDirecto.nombre,
        precio: productoDirecto.precio,
        cantidad: 1
      } : null
    };

    // Validaciones básicas
    if (metodoPago === "recoger" && (!datos.fechaRecoger || !datos.horaRecoger)) {
      alert("Debes seleccionar fecha y hora para recoger en comercio.");
      return;
    }

    console.log("📤 Enviando datos al servidor:", datos);

    try {
      const response = await fetch("/api/finalizar-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      console.log("📥 Respuesta del servidor - Status:", response.status);

      const result = await response.json();
      console.log("📥 Respuesta del servidor - Data:", result);

      if (response.ok && result.success) {
        // Limpiar localStorage si fue compra directa
        localStorage.removeItem('productoCompra');
        
        alert(result.message || "✅ Compra realizada con éxito");
        
        if (result.redirect) {
          window.location.href = result.redirect;
        } else {
          window.location.href = "/Natural/Historial_compras.html";
        }
      } else {
        alert("❌ " + (result.message || "Error al registrar la compra."));
      }
    } catch (err) {
      console.error("❌ Error al finalizar compra:", err);
      alert("Error de conexión con el servidor.");
    }
    });
  } else {
    console.error("❌ No se encontró el botón finalizar compra");
  }
});