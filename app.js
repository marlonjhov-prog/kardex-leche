// URL de tu aplicación web de Google Apps Script configurada
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwt9iNmgXu8CJLTFvJ_LHff5OYlOy_MmU4hGqoBMGGF44sbiOi2YAWxZitCVHAw4Xo/exec";

// Función principal para cargar los datos en la tabla
function cargarDatosKardex() {
    const loadingEl = document.getElementById("loading");
    const tableEl = document.getElementById("kardexTable");
    
    loadingEl.style.display = "block";
    tableEl.style.display = "none";

    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("tableBody");
            tbody.innerHTML = "";

            data.forEach((row, index) => {
                const rowIndexGoogleSheets = index + 2; // Desplazamiento por los encabezados

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row["Dia de Consumo"] || ""}</td>
                    <td>${row["Fecha"] || ""}</td>
                    <td>${row["Ingreso (L)"] || ""}</td>
                    <td>${row["Consumo Diario (kg)"] || ""}</td>
                    <td>${row["Acumulado (kg)"] || ""}</td>
                    <td>${row["Restante (kg)"] || ""}</td>
                    <td>
                        <button class="btn-edit" onclick="editarFila(${rowIndexGoogleSheets}, '${row["Fecha"] || ""}', '${row["Ingreso (L)"] || ""}', '${row["Consumo Diario (kg)"] || ""}')">Editar</button>
                        <button class="btn-delete" onclick="eliminarFila(${rowIndexGoogleSheets})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            loadingEl.style.display = "none";
            tableEl.style.display = "table";
        })
        .catch(error => {
            console.error("Error al conectar con la API:", error);
            loadingEl.innerText = "Error al cargar los datos de la API.";
        });
}

// Función para eliminar un registro automáticamente
function eliminarFila(rowIndex) {
    if (!confirm(`¿Estás seguro de eliminar el registro de la fila ${rowIndex}?`)) return;

    document.getElementById("loading").innerText = "Eliminando de la hoja...";
    document.getElementById("loading").style.display = "block";

    fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "delete",
            rowIndex: rowIndex
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === "success") {
            cargarDatosKardex(); // Recarga la tabla sola
        } else {
            alert("No se pudo eliminar.");
            document.getElementById("loading").style.display = "none";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error de red al intentar eliminar.");
    });
}

// Función para editar un registro interactivamente
function editarFila(rowIndex, fechaActual, ingresoActual, consumoActual) {
    const nuevaFecha = prompt("Modificar Fecha (AAAA-MM-DD):", fechaActual);
    if (nuevaFecha === null) return;

    const nuevoIngreso = prompt("Modificar Ingreso (L):", ingresoActual);
    if (nuevoIngreso === null) return;

    const nuevoConsumo = prompt("Modificar Consumo Diario (kg):", consumoActual);
    if (nuevoConsumo === null) return;

    document.getElementById("loading").innerText = "Actualizando la hoja...";
    document.getElementById("loading").style.display = "block";

    fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "edit",
            rowIndex: rowIndex,
            fecha: nuevaFecha,
            ingreso: nuevoIngreso,
            consumoDiario: nuevoConsumo
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === "success") {
            cargarDatosKardex(); // Recarga la tabla con los cambios listos
        } else {
            alert("No se pudo actualizar.");
            document.getElementById("loading").style.display = "none";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error de red al intentar actualizar.");
    });
}

// Cargar automáticamente al abrir la página en GitHub Pages
window.onload = cargarDatosKardex;