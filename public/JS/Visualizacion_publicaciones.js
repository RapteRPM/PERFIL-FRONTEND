// ===============================
// 📦 Visualizacion_publicaciones.js
// ===============================

let publicacionesGlobal = [];
let categoriaSeleccionada = null;

/**
 * Carga publicaciones desde la API
 * @param {string|null} categoria - Nombre de la categoría ("Todos", "Accesorios", etc.)
 * @param {number|null} limite - Límite de resultados
 */
async function cargarPublicaciones(categoria = null, limite = null) {
  try {
    console.log("🔵 Visualizacion_publicaciones.js - cargarPublicaciones iniciando...", {categoria, limite});
    let url = '/api/publicaciones_publicas';
    const params = [];
    if (categoria && categoria.toLowerCase() !== 'todos') {
      params.push(`categoria=${encodeURIComponent(categoria)}`);
    }
    if (limite) {
      params.push(`limite=${limite}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    console.log("🔵 Fetching URL:", url);
    const res = await fetch(url);
    console.log("🔵 Response status:", res.status);
    let productos = await res.json();
    console.log("🔵 Productos recibidos:", productos.length);

    // 🔹 Normalizar rutas de imágenes
    productos = productos.map(p => {
      let imagenes = [];

      if (Array.isArray(p.imagenes)) {
        imagenes = p.imagenes.map(img => img.replace(/\\/g, '/').trim());
      } else if (typeof p.imagenes === 'string' && p.imagenes.length > 0) {
        try {
          // Intentar parsear como JSON primero (formato Railway: ["imagen/..."])
          imagenes = JSON.parse(p.imagenes);
        } catch {
          // Si falla, intentar como string separado por comas
          imagenes = p.imagenes.split(',').map(img => img.replace(/\\/g, '/').trim());
        }
      } else {
        imagenes = ['imagen/placeholder.png'];
      }

      imagenes = imagenes.map(img => img.startsWith('/') ? img.slice(1) : img);

      return { ...p, imagenes };
    });

    if (!categoria || categoria.toLowerCase() === 'todos') {
      shuffleArray(productos);
    }

    publicacionesGlobal = productos;
    console.log("🔵 Llamando renderizarProductos con", productos.slice(0, limite || productos.length).length, "productos");
    renderizarProductos(productos.slice(0, limite || productos.length));

  } catch (err) {
    console.error("❌ Error al cargar publicaciones:", err);
  }
}

/**
 * Renderiza productos en el contenedor
 */
function renderizarProductos(lista) {
  console.log("🔵 renderizarProductos llamado con", lista.length, "productos");
  const contenedor = document.getElementById("contenedor-productos");
  console.log("🔵 Contenedor encontrado:", !!contenedor);
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="text-center text-gray-500 col-span-full">No se encontraron productos.</p>`;
    return;
  }

  lista.forEach(p => {
    console.log("🔵 Renderizando producto:", p.nombreProducto);
    const carouselId = `carousel-${p.idPublicacion}`;

    // 🖼️ Crear carrusel con imágenes
    const imagenesHTML = p.imagenes
      .map((img, index) => `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
          <img src="/${img}" class="d-block w-100 producto-imagen rounded" alt="Imagen ${index + 1}">
        </div>
      `).join("");

    // 🧩 Tarjeta del producto
    const card = `
      <div class="card card-bootstrap shadow-lg border-0">
        <div id="${carouselId}" class="carousel slide">
          <div class="carousel-inner">
            ${imagenesHTML}
          </div>
          ${p.imagenes.length > 1 ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
              <span class="carousel-control-next-icon"></span>
            </button>
          ` : ""}
        </div>
        <div class="card-body">
          <h5 class="card-title font-bold">${p.nombreProducto}</h5>
          <p class="text-gray-600">$${Number(p.precio || 0).toLocaleString('es-CO')}</p>
          <a href="/Natural/Detalle_producto.html?id=${p.idPublicacion}" class="btn btn-danger">Ver Más</a>
        </div>
      </div>
    `;
    contenedor.insertAdjacentHTML("beforeend", card);
  });
}

/**
 * Mezcla aleatoriamente un array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Filtra publicaciones por categoría (máx 6 sugerencias)
 */
function filtrarCategoria(nombre) {
  const limite = 6;
  categoriaSeleccionada = nombre;
  cargarPublicaciones(nombre, limite);
}

/**
 * Carga categorías y genera botones
 */
async function cargarCategorias() {
  try {
    const res = await fetch('/api/categorias');
    const categorias = await res.json();

    const contenedor = document.getElementById("contenedor-categorias");
    if (!contenedor) return;

    // Botón "Todos" por defecto
    const btnTodos = document.createElement("button");
    btnTodos.textContent = "Todos";
    btnTodos.className = "categoria-boton bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700";
    btnTodos.addEventListener("click", () => filtrarCategoria("Todos"));
    contenedor.appendChild(btnTodos);

    // Botones por categoría
    categorias.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat.NombreCategoria;
      btn.className = "categoria-boton bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700";
      btn.addEventListener("click", () => filtrarCategoria(cat.NombreCategoria));
      contenedor.appendChild(btn);
    });
  } catch (err) {
    console.error("❌ Error al cargar categorías:", err);
  }
}

/**
 * Inicialización al cargar la página
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔵 Visualizacion_publicaciones.js - DOMContentLoaded iniciando...");
  cargarCategorias();
  cargarPublicaciones(null, 6);

  const inputBusqueda = document.getElementById("busqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", () => {
      const texto = inputBusqueda.value.toLowerCase();
      const filtrados = publicacionesGlobal.filter(p =>
        p.nombreProducto.toLowerCase().includes(texto)
      );
      renderizarProductos(filtrados.slice(0, 6));
    });
  }
});

/// INDEX.HTML VISUALIZACION DE PRODUCTOS

// Variable global para almacenar todos los productos
let todosLosProductos = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log("🔵 Visualizacion_publicaciones.js - Segundo DOMContentLoaded (INDEX.HTML)");
  
  // Solo ejecutar si estamos en index.html (verificar si existe productos-grid)
  const gridIndex = document.getElementById('productos-grid');
  if (!gridIndex) {
    console.log("🔵 No se encontró productos-grid, saltando inicialización de index.html");
    return;
  }
  
  console.log("🔵 Encontrado productos-grid, inicializando para index.html...");
  
  // 🔹 Mostrar todos los productos públicos
  try {
    const res = await fetch('/api/publicaciones_publicas?limite=50'); // Cargar más productos para filtrar
    const productos = await res.json();
    todosLosProductos = productos; // Guardar en variable global

    if (Array.isArray(productos) && productos.length > 0) {
      mostrarProductos(productos.slice(0, 12)); // Mostrar primeros 12
    }
  } catch (err) {
    console.error('❌ Error cargando productos públicos:', err);
  }

  // 🔹 Configurar botones de categorías
  configurarBotonesCategorias();

  // 🔹 Configurar búsqueda en tiempo real
  configurarBusqueda();
  
  // 🔹 Continuar con visualizaciones recientes
  cargarVisualizacionesRecientes();
});

/**
 * Muestra los productos en el grid
 */
function mostrarProductos(productos) {
  const grid = document.getElementById('productos-grid');
  if (!grid) return;
  
  grid.innerHTML = ''; // Limpiar grid
  
  if (productos.length === 0) {
    grid.innerHTML = '<p class="col-span-3 text-center text-gray-500">No se encontraron productos</p>';
    return;
  }
  
  productos.forEach(p => {
    const imagen = Array.isArray(p.imagenes) && p.imagenes.length > 0
      ? p.imagenes[0]
      : '/imagen/placeholder.png';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'card card-bootstrap shadow-lg border-0';
    tarjeta.innerHTML = `
      <img src="${imagen}" class="d-block w-100 rounded-t-lg" alt="${p.nombreProducto}" onerror="this.src='/imagen/placeholder.png'">
      <div class="card-body">
        <h5 class="card-title font-bold">${p.nombreProducto}</h5>
        <p class="text-gray-600">$${Number(p.precio).toLocaleString('es-CO')}</p>
        <a href="/Natural/Detalle_producto.html?id=${p.idPublicacion}" class="btn btn-danger">Ver Más</a>
      </div>
    `;
    grid.appendChild(tarjeta);
  });
}

/**
 * Configura los botones de categorías
 */
function configurarBotonesCategorias() {
  const btnTodos = document.getElementById('btn-todos');
  const btnAccesorios = document.getElementById('btn-accesorios');
  const btnServicios = document.getElementById('btn-servicios');
  const btnRepuestos = document.getElementById('btn-repuestos');
  
  const botones = [btnTodos, btnAccesorios, btnServicios, btnRepuestos];
  
  // Función para resaltar botón activo
  function activarBoton(botonActivo) {
    botones.forEach(btn => {
      if (btn) {
        btn.classList.remove('bg-gray-700', 'bg-red-700');
        btn.classList.add(btn === botonActivo ? 'bg-gray-700' : 'bg-red-600');
      }
    });
  }
  
  if (btnTodos) {
    btnTodos.addEventListener('click', () => {
      activarBoton(btnTodos);
      mostrarProductos(todosLosProductos.slice(0, 12));
    });
  }
  
  if (btnAccesorios) {
    btnAccesorios.addEventListener('click', () => {
      activarBoton(btnAccesorios);
      const filtrados = todosLosProductos.filter(p => 
        p.categoria && p.categoria.toLowerCase() === 'accesorios'
      );
      mostrarProductos(filtrados.slice(0, 12));
    });
  }
  
  if (btnServicios) {
    btnServicios.addEventListener('click', () => {
      activarBoton(btnServicios);
      const filtrados = todosLosProductos.filter(p => 
        p.categoria && p.categoria.toLowerCase() === 'servicio mecanico'
      );
      mostrarProductos(filtrados.slice(0, 12));
    });
  }
  
  if (btnRepuestos) {
    btnRepuestos.addEventListener('click', () => {
      activarBoton(btnRepuestos);
      const filtrados = todosLosProductos.filter(p => 
        p.categoria && p.categoria.toLowerCase() === 'repuestos'
      );
      mostrarProductos(filtrados.slice(0, 12));
    });
  }
}

/**
 * Configura la búsqueda en tiempo real
 */
function configurarBusqueda() {
  const inputBusqueda = document.getElementById('buscar-productos');
  
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', (e) => {
      const texto = e.target.value.toLowerCase().trim();
      
      if (texto === '') {
        mostrarProductos(todosLosProductos.slice(0, 12));
        return;
      }
      
      const filtrados = todosLosProductos.filter(p => 
        p.nombreProducto && p.nombreProducto.toLowerCase().includes(texto)
      );
      
      mostrarProductos(filtrados.slice(0, 12));
    });
  }
}

/**
 * Carga las visualizaciones recientes del usuario
 */
async function cargarVisualizacionesRecientes() {

  // 🔹 Mostrar visualizaciones recientes si el usuario está logueado
  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuarioActivo || !usuarioActivo.id) {
    console.log("ℹ️ No hay usuario logueado, omitiendo visualizaciones");
    return;
  }

  try {
    const res = await fetch(`/api/visualizaciones/${usuarioActivo.id}`);
    
    // Si el endpoint no existe o falla, no hacer nada (sin error)
    if (!res.ok) {
      console.log("ℹ️ No hay visualizaciones disponibles o endpoint no configurado");
      return;
    }

    const publicaciones = await res.json();
    
    // Validar que la respuesta sea un array
    if (!Array.isArray(publicaciones)) {
      console.log("ℹ️ Respuesta no es un array, omitiendo visualizaciones");
      return;
    }
    
    if (publicaciones.length === 0) {
      console.log("ℹ️ No hay visualizaciones recientes");
      return;
    }

    const contenedor = document.createElement('section');
    contenedor.className = 'mb-12';
    contenedor.innerHTML = `
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Tus productos vistos recientemente</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="visualizaciones-recientes"></div>
    `;
    document.querySelector('main').appendChild(contenedor);

    const grid = document.getElementById('visualizaciones-recientes');

    publicaciones.forEach(p => {
      const imagen = Array.isArray(p.ImagenProducto)
        ? p.ImagenProducto[0]
        : (typeof p.ImagenProducto === 'string' ? p.ImagenProducto.split(',')[0] : '/imagen/placeholder.png');

      const rutaImagen = imagen.startsWith('/') ? imagen : `/imagen/${imagen.trim().replace(/\\/g, '/')}`;

      const tarjeta = document.createElement('div');
      tarjeta.className = 'card card-bootstrap shadow-lg border-0';
      tarjeta.innerHTML = `
        <img src="${rutaImagen}" class="d-block w-100 rounded-t-lg" alt="${p.NombreProducto}" onerror="this.src='/imagen/placeholder.png'">
        <div class="card-body">
          <h5 class="card-title font-bold">${p.NombreProducto}</h5>
          <p class="text-gray-600">$${Number(p.Precio).toLocaleString('es-CO')}</p>
          <a href="/Natural/Detalle_producto.html?id=${p.IdPublicacion}" class="btn btn-danger">Ver Más</a>
        </div>
      `;
      grid.appendChild(tarjeta);
    });
    
    console.log(`✅ ${publicaciones.length} visualizaciones cargadas`);
  } catch (err) {
    console.log("ℹ️ No se pudieron cargar visualizaciones (esto es normal si no hay endpoint configurado):", err.message);
  }
}