document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuario || !usuario.id) return; // ⛔ No mostrar nada si no hay sesión

  const header = document.querySelector("header");
  const contenedorSuperior = header.querySelector(".max-w-7xl.mx-auto.flex.items-center.justify-start");

  // Crear el bloque de perfil (sin mostrar si no hay sesión)
  const perfilHTML = `
    <div class="flex items-center space-x-4 ml-auto">
      <div class="dropdown">
        <button class="flex items-center bg-transparent border-0 text-white" id="perfilDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <img id="foto-usuario" src="${usuario.foto || '../image/imagen_perfil.png'}" alt="Usuario" class="w-20 h-20 object-cover rounded-full border-2 border-white mr-2"/>
          <span class="font-semibold text-lg" id="nombre-usuario">${usuario.nombre || 'Usuario'}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="perfilDropdown">
          <li><a class="dropdown-item" href="Editar_perfil.html">Configuración Perfil</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="cerrarSesion">Cerrar sesión</a></li>
        </ul>
      </div>
    </div>
  `;

  contenedorSuperior.insertAdjacentHTML("beforeend", perfilHTML);

  // Cerrar sesión
  document.getElementById("cerrarSesion").addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    window.location.reload();
  });

  // 👉 Control del menú desplegable de Categorías
  const btnCategorias = document.getElementById("btnCategorias");
  const menuCategorias = document.getElementById("menuCategorias");

  if (btnCategorias && menuCategorias) {
    btnCategorias.addEventListener("click", (e) => {
      e.stopPropagation(); // evita que el clic se propague
      menuCategorias.classList.toggle("hidden");
    });

    // Cierra el menú si se hace clic fuera
    document.addEventListener("click", (e) => {
      if (!menuCategorias.contains(e.target) && !btnCategorias.contains(e.target)) {
        menuCategorias.classList.add("hidden");
      }
    });
  }
});