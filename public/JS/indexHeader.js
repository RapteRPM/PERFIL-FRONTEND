document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  const header = document.querySelector("header");
  const nav = document.querySelector("nav.nav2");
  
  // 🔍 Buscar el contenedor del header (donde está el logo)
  const headerContainer = header?.querySelector('.max-w-7xl.mx-auto.flex.items-center.justify-start');
  
  // 🔍 Buscar el enlace de "Ingresar" en el nav por ID
  const linkIngresar = document.getElementById('link-ingresar');

  if (!usuario || !usuario.id) {
    // ⛔ No hay sesión: asegurar que el botón "Ingresar" esté visible
    if (linkIngresar) {
      linkIngresar.style.display = "block";
    }
    console.log("ℹ️ No hay sesión activa");
    
    // 👉 Control del menú desplegable de Categorías (aunque no haya sesión)
    configurarMenuCategorias();
    
    return;
  }

  console.log("✅ Sesión activa:", usuario);

  // ✅ Hay sesión: OCULTAR botón "Ingresar"
  if (linkIngresar) {
    linkIngresar.remove(); // Eliminar el botón Ingresar
  }

  // Crear el bloque de perfil en el HEADER (lado derecho)
  const perfilHTML = `
    <div class="ml-auto flex items-center gap-3">
      <!-- Botón temporal para cerrar sesión -->
      <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" 
              class="btn btn-sm btn-outline-light">
        🚪 Cerrar Sesión
      </button>
      
      <div class="dropdown">
        <button class="flex items-center bg-transparent border-0 text-white hover:opacity-80 transition dropdown-toggle" 
                type="button"
                id="perfilDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false">
          <img id="foto-usuario" 
               src="${usuario.foto || '../imagen/imagen_perfil.png'}" 
               alt="Usuario" 
               class="rounded-circle border border-white border-2 me-2"
               style="width: 50px; height: 50px; object-fit: cover;"/>
          <div class="d-flex flex-column align-items-start">
            <span class="fw-bold">${usuario.nombre || 'Usuario'}</span>
            <small class="text-white-50">${usuario.tipo || ''}</small>
          </div>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="perfilDropdown">
          <li>
            <a class="dropdown-item" href="../Natural/perfil_usuario.html">
              <i class="fas fa-user me-2 text-primary"></i>Ver Perfil
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="../Natural/Editar_perfil.html">
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
    </div>
  `;

  // Insertar perfil al final del header container (lado derecho)
  if (headerContainer) {
    headerContainer.insertAdjacentHTML("beforeend", perfilHTML);
    console.log("✅ Perfil agregado al header");
  }

  // Cerrar sesión
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

  // 👉 Control del menú desplegable de Categorías
  configurarMenuCategorias();
});

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