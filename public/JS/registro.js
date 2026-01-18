// registro.js — versión segura para los tres tipos de usuario(REGISTRAR NUEVOS USUARIOS)

// Función para separar nombre completo en nombres y apellidos
function separarNombreCompleto(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/); // Separar por espacios
  
  if (partes.length === 1) {
    return { nombres: partes[0], apellidos: '' };
  } else if (partes.length === 2) {
    return { nombres: partes[0], apellidos: partes[1] };
  } else if (partes.length === 3) {
    return { nombres: partes[0], apellidos: `${partes[1]} ${partes[2]}` };
  } else {
    // 4 o más palabras: primeras 2 son nombres, resto apellidos
    const nombres = `${partes[0]} ${partes[1]}`;
    const apellidos = partes.slice(2).join(' ');
    return { nombres, apellidos };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tipoUsuarioSelect = document.getElementById("tipoUsuario");
  const formRegistro = document.getElementById("formRegistro");

  const formNatural = document.getElementById("formNatural");
  const formComerciante = document.getElementById("formComerciante");
  const formServicio = document.getElementById("formServicio");

  // --- 🔹 Mostrar/Ocultar formularios según selección ---
  tipoUsuarioSelect.addEventListener("change", () => {
    const tipo = tipoUsuarioSelect.value;

    // Ocultar todos
    formNatural.style.display = "none";
    formComerciante.style.display = "none";
    formServicio.style.display = "none";

    // Quitar todos los "required"
    formRegistro.querySelectorAll("[required]").forEach(el => el.removeAttribute("required"));

    // Mostrar y activar "required" solo para el tipo seleccionado
    if (tipo === "natural") {
      formNatural.style.display = "block";
      formNatural.querySelectorAll("[data-required='true']").forEach(el => el.setAttribute("required", ""));
    } else if (tipo === "comerciante") {
      formComerciante.style.display = "block";
      formComerciante.querySelectorAll("[data-required='true']").forEach(el => el.setAttribute("required", ""));
    } else if (tipo === "servicio") {
      formServicio.style.display = "block";
      formServicio.querySelectorAll("[data-required='true']").forEach(el => el.setAttribute("required", ""));
    }
  });

  // --- 🔹 Evento de envío del formulario ---
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipoUsuario = tipoUsuarioSelect.value;
    if (!tipoUsuario) {
      alert("Por favor, selecciona un tipo de usuario.");
      return;
    }

    const formData = new FormData();

    // --- Campos comunes según tipo ---
    if (tipoUsuario === "natural") {
      const getVal = (id) => document.getElementById(id)?.value?.trim() || "";
      
      const nombreCompleto = getVal("Nombre");
      const { nombres, apellidos } = separarNombreCompleto(nombreCompleto);
      
      formData.append("TipoUsuario", "Natural");
      formData.append("Usuario", getVal("Usuario"));
      formData.append("Nombre", nombres);
      formData.append("Apellido", apellidos);
      formData.append("Correo", getVal("Correo"));
      formData.append("Telefono", getVal("Telefono"));
      formData.append("Barrio", getVal("Barrio"));

      // --- Construir dirección completa para usuario natural ---
      const tipoVia = getVal("TipoViaNatural");
      const numPrincipal = getVal("NumPrincipalNatural");
      const letra1 = getVal("Letra1Natural");
      const orient1 = getVal("Orient1Natural");
      const numSecundario = getVal("NumSecundarioNatural");
      const letra2 = getVal("Letra2Natural");
      const orient2 = getVal("Orient2Natural");
      const numFinal = getVal("NumFinalNatural");
      const letra3 = getVal("Letra3Natural");

      let direccionCompleta = `${tipoVia} ${numPrincipal}`.trim();
      if (letra1) direccionCompleta += ` ${letra1}`;
      if (orient1) direccionCompleta += ` ${orient1}`;
      if (numSecundario) direccionCompleta += ` #${numSecundario}`;
      if (letra2) direccionCompleta += ` ${letra2}`;
      if (orient2) direccionCompleta += ` ${orient2}`;
      if (numFinal) direccionCompleta += ` - ${numFinal}`;
      if (letra3) direccionCompleta += ` ${letra3}`;

      if (!direccionCompleta || direccionCompleta.trim() === "" || direccionCompleta === "undefined") {
        direccionCompleta = "Sin dirección especificada";
      }

      formData.append("Direccion", direccionCompleta);

      const fotoPerfil = document.getElementById("FotoPerfil")?.files?.[0];
      if (fotoPerfil) formData.append("FotoPerfil", fotoPerfil);
    }

if (tipoUsuario === "comerciante") {
  const getVal = (id) => document.getElementById(id)?.value?.trim() || "";

  const nombreCompleto = getVal("NombreComerciante");
  const { nombres, apellidos } = separarNombreCompleto(nombreCompleto);

  formData.append("TipoUsuario", "Comerciante");
  formData.append("Usuario", getVal("UsuarioComercio"));
  formData.append("Nombre", nombres);
  formData.append("Apellido", apellidos);
  formData.append("Correo", getVal("CorreoComercio"));

  // --- Construir dirección completa ---
  const tipoVia = getVal("TipoVia");
  const numPrincipal = getVal("NumPrincipal");
  const letra1 = getVal("Letra1");
  const numSecundario = getVal("NumSecundario");
  const letra2 = getVal("Letra2");
  const numFinal = getVal("NumFinal");
  const letra3 = getVal("Letra3");

  let direccionCompleta = `${tipoVia} ${numPrincipal} ${letra1}`.trim();
  if (numSecundario || letra2) direccionCompleta += ` #${numSecundario} ${letra2}`.trim();
  if (numFinal || letra3) direccionCompleta += ` - ${numFinal} ${letra3}`.trim();

  if (!direccionCompleta || direccionCompleta.trim() === "" || direccionCompleta === "undefined") {
    direccionCompleta = "Sin dirección especificada";
  }

  formData.append("Direccion", direccionCompleta);
  formData.append("Telefono", getVal("TelefonoComercio"));
  formData.append("Barrio", getVal("BarrioComercio"));
  formData.append("DiasAtencion", getVal("DiasAtencion"));
  formData.append("RedesSociales", getVal("RedesSociales"));
  formData.append("NombreComercio", getVal("NombreComercio"));
  formData.append("NitComercio", getVal("InfoVendedor"));
  formData.append("HoraInicio", getVal("horaInicio"));
  formData.append("HoraFin", getVal("horaFin"));

  const fotoPerfil = document.getElementById("fotoPerfilComercio")?.files?.[0];
  if (fotoPerfil) formData.append("FotoPerfil", fotoPerfil);

  // --- 🔹 Convertir dirección a coordenadas usando Nominatim ---
  const direccion = direccionCompleta; // usamos la misma dirección ya construida
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion + ", Bogotá, Colombia")}`);
    const dataGeo = await response.json();

    if (dataGeo && dataGeo.length > 0) {
      formData.append("latitud", dataGeo[0].lat);
      formData.append("longitud", dataGeo[0].lon);
      console.log("📍 Coordenadas obtenidas:", dataGeo[0].lat, dataGeo[0].lon);
    } else {
      console.warn("⚠️ No se encontraron coordenadas, se usarán valores por defecto");
      formData.append("latitud", "0.0");
      formData.append("longitud", "0.0");
    }
  } catch (error) {
    console.error("Error obteniendo coordenadas:", error);
    formData.append("latitud", "0.0");
    formData.append("longitud", "0.0");
  }
}


    if (tipoUsuario === "servicio" || tipoUsuario === "prestadorservicios") {
      const getVal = (id) => document.getElementById(id)?.value || "";

      const nombreCompleto = getVal("NombreServicio");
      const { nombres, apellidos } = separarNombreCompleto(nombreCompleto);

      formData.append("TipoUsuario", "PrestadorServicio");
      formData.append("Usuario", getVal("UsuarioServicio"));
      formData.append("Nombre", nombres);
      formData.append("Apellido", apellidos);
      formData.append("Correo", getVal("CorreoServicio"));
      formData.append("Telefono", getVal("TelefonoServicio"));
      formData.append("Direccion", getVal("DireccionServicio"));
      formData.append("Barrio", getVal("BarrioServicio"));
      formData.append("RedesSociales", getVal("RedesSocialesServicio"));
      formData.append("DiasAtencion", getVal("diasAtencionServicio"));
      formData.append("HoraInicio", getVal("horaInicioServicio"));
      formData.append("HoraFin", getVal("horaFinServicio"));

      const fotoPerfil = document.getElementById("FotoPerfilServicio")?.files?.[0];
      const certificado = document.getElementById("Certificado")?.files?.[0];

      if (fotoPerfil) formData.append("FotoPerfil", fotoPerfil);
      if (certificado) formData.append("Certificado", certificado);
    }

    // --- 🔹 Enviar al servidor ---
    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        // Siempre redirigir a la página de crear contraseña con el token
        if (data.token) {
          console.log("✅ Registro exitoso, redirigiendo a crear contraseña...");
          console.log("Respuesta del servidor:", data);
          
          // Redirigir directamente a la página de crear contraseña con el token
          window.location.href = `crear-contrasena.html?token=${data.token}`;
        } else {
          // Fallback si no hay token (no debería pasar)
          alert("✅ " + data.mensaje);
          window.location.href = "Ingreso.html";
        }
      } else {
        // Manejar tanto 'error' como 'mensaje'
        const mensajeError = data.error || data.mensaje || "No se pudo registrar";
        alert("⚠️ " + mensajeError);
      }
    } catch (err) {
      console.error("Error en fetch:", err);
      alert("⚠️ Error al conectar con el servidor");
    }
  });
});
