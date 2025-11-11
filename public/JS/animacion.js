document.addEventListener("DOMContentLoaded", function () {
    const tipoUsuario = document.getElementById("tipoUsuario");
    const formRegistro = document.getElementById("formRegistro");

    const formNatural = document.getElementById("tipoNatural");
    const formComerciante = document.getElementById("tipoComerciante");
    const formServicio = document.getElementById("TipoServicio");
    const datosComunes = document.getElementById("datosComunes");

    if (tipoUsuario) {
        tipoUsuario.addEventListener("change", function () {
            // Ocultar formularios y quitar required de todos sus inputs
            [formNatural, formComerciante, formServicio].forEach(form => {
                if (form) {
                    form.style.display = "none";
                    form.querySelectorAll("input, select, textarea").forEach(input => {
                        input.required = false;
                    });
                }
            });
        if (datosComunes) {
            datosComunes.style.display = this.value ? "block" : "none";}
            let selectedForm = null;

            if (this.value === "natural") selectedForm = formNatural;
            if (this.value === "comerciante") selectedForm = formComerciante;
            if (this.value === "servicio") selectedForm = formServicio;

            if (selectedForm) {
                selectedForm.style.display = "block";
                selectedForm.querySelectorAll("input, select, textarea").forEach(input => {
                    input.required = true;
                });
            }
        });
    }

    if (formRegistro) {
        formRegistro.addEventListener("submit", function () {

            // Desactivar campos requeridos ocultos
            const allRequiredFields = formRegistro.querySelectorAll("[required]");
            allRequiredFields.forEach(field => {
                if (field.offsetParent === null) field.required = false;
            });
        });
    }
});
