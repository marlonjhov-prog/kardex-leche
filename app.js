const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZrjjen_BaUte8ez3w8184M9v-Igu0XXosQLjMZwRwlev-OmkwECos-PrwwrGjY6E2HQ/exec";
const META_TOTAL_KG = 21981; 
const RATIO_L_POR_KG = 9;   

let kardexData = [];

// Formato de KPIs con puntos de miles y sin decimales largos
function formatKPI(num) {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Cargar datos desde Google Sheets
async function loadFromGoogleSheets() {
    try {
        let response = await fetch(WEB_APP_URL);
        let result = await response.json();
        if (Array.isArray(result) && result.length > 0) {
            kardexData = result;
        } else {
            kardexData = getBaseData();
            saveToGoogleSheets();
        }
        renderApp();
    } catch (error) {
        console.warn("Cargando desde respaldo local:", error);
        kardexData = JSON.parse(localStorage.getItem('kardexData')) || getBaseData();
        renderApp();
    }
}

// Guardar datos en Google Sheets
async function saveToGoogleSheets() {
    if (!Array.isArray(kardexData) || kardexData.length === 0) return;
    localStorage.setItem('kardexData', JSON.stringify(kardexData));
    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(kardexData)
        });
    } catch (error) {
        console.error("Error al sincronizar con Google Sheets:", error);
    }
}

// Datos iniciales base por si la hoja está vacía
function getBaseData() {
    return [
        { fecha: '2026-07-21', cantidad: 545 },
        { fecha: '2026-07-22', cantidad: 4590 },
        { fecha: '2026-07-24', cantidad: 3640 },
        { fecha: '2026-07-27', cantidad: 1860 },
        { fecha: '2026-07-28', cantidad: 4510 },
        { fecha: '2026-07-29', cantidad: 7420 },
        { fecha: '2026-07-30', cantidad: 1825 },
        { fecha: '2026-08-03', cantidad: 3830 },
        { fecha: '2026-08-04', cantidad: 1835 },
        { fecha: '2026-08-05', cantidad: 570 },
        { fecha: '2026-08-07', cantidad: 2750 },
        { fecha: '2026-08-08', cantidad: 1855 },
        { fecha: '2026-08-10', cantidad: 4540 },
        { fecha: '2026-08-11', cantidad: 5410 },
        { fecha: '2026-08-12', cantidad: 5685 },
        { fecha: '2026-08-13', cantidad: 3560 },
        { fecha: '2026-08-19', cantidad: 5585 }
    ];
}

// Renderizar la interfaz web
function renderApp() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    let totalIngresoL = 0;
    
    kardexData.forEach((item, index) => {
        let cantidadL = Number(item.cantidad) || 0;
        totalIngresoL += cantidadL;
        let numeroDia = `Día ${index + 1}`;
        
        tbody.innerHTML += `<tr>
            <td>${numeroDia}</td>
            <td>${item.fecha}</td>
            <td><input type="number" step="any" id="cant_${index}" value="${cantidadL}" disabled style="width:100px"></td>
            <td>
                <button class="btn-edit" id="btnEdit_${index}" onclick="enableEdit(${index})">Modificar</button>
                <button class="btn-save" id="btnSave_${index}" onclick="saveEdit(${index})">Guardar</button>
                <button class="btn-delete" onclick="deleteItem(${index})">Eliminar</button>
            </td>
        </tr>`;
    });

    let totalConsumoEqKg = totalIngresoL / RATIO_L_POR_KG;
    let restanteKg = META_TOTAL_KG - totalConsumoEqKg;

    document.getElementById('kpiIngreso').innerText = formatKPI(totalIngresoL) + " L";
    document.getElementById('kpiConsumo').innerText = formatKPI(totalConsumoEqKg) + " kg";
    document.getElementById('kpiRestante').innerText = formatKPI(restanteKg) + " kg";
    
    updateChart();
}

function enableEdit(index) {
    document.getElementById(`cant_${index}`).disabled = false;
    document.getElementById(`btnEdit_${index}`).style.display = 'none';
    document.getElementById(`btnSave_${index}`).style.display = 'inline-block';
}

function saveEdit(index) {
    let nuevaCantidad = document.getElementById(`cant_${index}`).value;
    kardexData[index].cantidad = parseFloat(nuevaCantidad) || 0;
    
    renderApp();
    saveToGoogleSheets();
}

function addNewItem() {
    const fecha = document.getElementById('newFecha').value;
    const cantidad = parseFloat(document.getElementById('newCantidad').value) || 0;

    if (!fecha || isNaN(cantidad)) {
        alert("Por favor selecciona una fecha y escribe una cantidad válida.");
        return;
    }

    kardexData.push({ fecha, cantidad });
    
    document.getElementById('newFecha').value = '';
    document.getElementById('newCantidad').value = '';

    renderApp();
    saveToGoogleSheets();
}

function deleteItem(index) {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
        kardexData.splice(index, 1);
        renderApp();
        saveToGoogleSheets();
    }
}

function updateChart() {
    const ctx = document.getElementById('kardexChart').getContext('2d');
    if(window.myChart) window.myChart.destroy();
    
    let acumuladoTemp = 0;
    let datosGrafica = kardexData.map((i, idx) => {
        acumuladoTemp += (Number(i.cantidad) || 0) / RATIO_L_POR_KG;
        return { dia: `Día ${idx + 1}`, acumulado: acumuladoTemp };
    });

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datosGrafica.map(i => i.dia),
            datasets: [{
                label: 'Avance Acumulado (kg)',
                data: datosGrafica.map(i => i.acumulado),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Progreso Acumulado hacia la Meta de 21.981 kg' }
            }
        }
    });
}

function toggleTable() {
    const s = document.getElementById('tableSection');
    s.style.display = s.style.display === 'none' ? 'block' : 'none';
}

// Iniciar aplicación
loadFromGoogleSheets();
