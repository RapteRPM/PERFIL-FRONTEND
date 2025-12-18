document.addEventListener("DOMContentLoaded", async () => {
  const header = document.querySelector("header");
  const nav = document.querySelector("nav.nav2");
  
  // 🔍 Buscar el contenedor del perfil en el header
  const headerPerfilContainer = document.getElementById('header-perfil-container');
  
  // 🔍 Buscar el enlace de "Ingresar" en el nav por ID
  const linkIngresar = document.getElementById('link-ingresar');

  // Verificar sesión en el servidor
  let usuario = null;
  try {
    const res = await fetch("/api/verificar-sesion");
    if (res.ok) {
      usuario = await res.json();
    }
  } catch (error) {
    console.log("ℹ️ No hay sesión activa en el servidor");
  }

  if (!usuario || !usuario.id) {
    // ⛔ No hay sesión: limpiar localStorage y mostrar botón "Ingresar"
    localStorage.removeItem("usuarioActivo");
    
    if (linkIngresar) {
      linkIngresar.style.display = "block";
    }
    console.log("ℹ️ No hay sesión activa");
    
    // 👉 Control del menú desplegable de Categorías (aunque no haya sesión)
    configurarMenuCategorias();
    
    return;
  }

  console.log("✅ Sesión activa:", usuario);
  
  // Actualizar localStorage con la sesión actual
  localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

  // ✅ Hay sesión: OCULTAR botón "Ingresar"
  if (linkIngresar) {
    linkIngresar.remove(); // Eliminar el botón Ingresar
  }

  // Crear el bloque de perfil en el HEADER (lado derecho, separado del logo)
  const nombreMostrar = usuario.nombreComercio || usuario.nombre || 'Usuario';
  
  const perfilHTML = `
    <div class="dropdown">
      <button class="btn text-white text-decoration-none d-flex align-items-center gap-2 p-0 bg-transparent border-0 dropdown-toggle" 
              type="button"
              id="perfilDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              style="cursor: pointer;">
        <img id="foto-usuario" 
             src="${usuario.foto && usuario.foto.startsWith('/') ? usuario.foto : '/' + (usuario.foto || 'imagen/imagen_perfil.png')}" 
             alt="Usuario" 
             class="rounded-circle border border-white border-2"
             style="width: 50px; height: 50px; object-fit: cover;"/>
        <div class="d-flex flex-column align-items-start text-start">
          <span class="fw-bold" style="font-size: 1rem;">${nombreMostrar}</span>
          <small class="opacity-75" style="font-size: 0.85rem;">${usuario.tipo || ''}</small>
        </div>
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="perfilDropdown">
        <li>
          <a class="dropdown-item" href="/Natural/perfil_usuario.html">
            <i class="fas fa-user me-2 text-primary"></i>Ver Perfil
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="/Natural/Editar_perfil.html">
            <i class="fas fa-cog me-2 text-success"></i>Configurar Perfil
          </a>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <a class="dropdown-item text-danger" href="#" id="cerrarSesion">
            <i class="fas fa-sign-out-alt me-2"></i>Cerrar sesión
          </a>
        </li>
      </ul>
    </div>
  `;

  // Insertar perfil en el contenedor del header (lado derecho)
  if (headerPerfilContainer) {
    headerPerfilContainer.innerHTML = perfilHTML;
    console.log("✅ Perfil agregado al header (lado derecho)");
    
    // Inicializar el dropdown de Bootstrap manualmente
    setTimeout(() => {
      const dropdownElement = document.getElementById('perfilDropdown');
      if (dropdownElement && typeof bootstrap !== 'undefined') {
        new bootstrap.Dropdown(dropdownElement);
        console.log("✅ Dropdown de Bootstrap inicializado");
      }
      
      // Configurar cerrar sesión DESPUÉS de insertar el HTML
      const btnCerrarSesion = document.getElementById("cerrarSesion");
      if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async (e) => {
          e.preventDefault();
          
          console.log("🚪 Cerrando sesión...");
          
          try {
            // Llamar al endpoint de logout en el servidor
            await fetch("/logout", { method: "GET" });
            console.log("✅ Logout en servidor completado");
          } catch (error) {
            console.error("⚠️ Error al cerrar sesión en servidor:", error);
          }
          
          // Limpiar localStorage
          localStorage.clear();
          sessionStorage.clear();
          console.log("✅ localStorage y sessionStorage limpiados");
          
          // Redirigir al login
          window.location.href = "/General/Ingreso.html";
        });
        console.log("✅ Event listener de cerrar sesión agregado");
      } else {
        console.error("❌ No se encontró el botón de cerrar sesión");
      }
    }, 100);
  } else {
    console.error("❌ No se encontró el contenedor de perfil en el header");
  }

  // 👉 Ajustar navegación según tipo de usuario
  ajustarNavegacionSegunUsuario(usuario);
  
  // 👉 Control del menú desplegable de Categorías
  configurarMenuCategorias();
});

/**
 * Ajusta la navegación según el tipo de usuario
 */
function ajustarNavegacionSegunUsuario(usuario) {
  const categoriaContainer = document.getElementById('btnCategorias')?.parentElement;
  
  if (usuario && usuario.tipo === 'Comerciante' && categoriaContainer) {
    // Reemplazar Categorías por Inicio para comerciantes
    categoriaContainer.innerHTML = '<a href="/Comerciante/perfil_comerciante.html" class="hover:text-gray-200 transition">Inicio</a>';
    console.log('✅ Navegación ajustada para comerciante');
  }
}

/**
 * Configura el menú desplegable de Categorías
 */
function configurarMenuCategorias() {
  const btnCategorias = document.getElementById("btnCategorias");
  const menuCategorias = document.getElementById("menuCategorias");

  if (btnCategorias && menuCategorias) {
    btnCategorias.addEventListener("click", (e) => {
      e.stopPropagation();
      menuCategorias.classList.toggle("hidden");
    });

    // Cierra el menú si se hace clic fuera
    document.addEventListener("click", (e) => {
      if (!menuCategorias.contains(e.target) && !btnCategorias.contains(e.target)) {
        menuCategorias.classList.add("hidden");
      }
    });
  }
}