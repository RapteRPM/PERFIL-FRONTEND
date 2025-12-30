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
      const nombreCompleto = document.getElementById("Nombre").value.trim();
      const { nombres, apellidos } = separarNombreCompleto(nombreCompleto);
      
      formData.append("TipoUsuario", "Natural");
      formData.append("Usuario", document.getElementById("Usuario").value);
      formData.append("Nombre", nombres);
      formData.append("Apellido", apellidos);
      formData.append("Correo", document.getElementById("Correo").value);
      formData.append("Direccion", document.getElementById("Direccion").value);
      formData.append("Telefono", document.getElementById("Telefono").value);
      formData.append("Barrio", document.getElementById("Barrio").value);

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
        // Verificar si el usuario requiere aprobación
        if (data.requiereAprobacion && data.estado === 'Inactivo') {
          alert("✅ " + data.mensaje);
          console.log("Usuario registrado en estado Inactivo, requiere aprobación del administrador");
          // Redirigir al login en lugar de cambiar contraseña
          window.location.href = "Ingreso.html";
        } else {
          alert("✅ Registro exitoso. Ahora crea tu contraseña de acceso.");
          console.log("Respuesta del servidor:", data);
          
          // Guardar usuario recién registrado para crear contraseña
          localStorage.setItem("usuarioRecuperacion", JSON.stringify({
            id: data.usuario,
            esNuevoRegistro: true
          }));
          
          window.location.href = "CambiarContraseña.html";
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
