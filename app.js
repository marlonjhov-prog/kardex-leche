const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbylJXbGq82dswmKNkLeexP2vQi-k4cm5p34-RU9Pe1hvmMyRhUm_kErhhdXd0jrB6ee5w/exec";
const META_TOTAL = 21981; 

let kardexData = [];

// Cargar datos desde Google Sheets (con respaldo local)
async function loadFromGoogleSheets() {
    try {
        let response = await fetch(WEB_APP_URL);
        let result = await response.json();
        if (Array.isArray(result) && result.length > 0) {
            kardexData = result;
        } else {
            // Si la hoja está vacía, usamos los datos base
            kardexData = getBaseData();
        }
        renderApp();
    } catch (error) {
        console.warn("No se pudo conectar a Google Sheets, cargando modo local:", error);
        kardexData = JSON.parse(localStorage.getItem('kardexData')) || getBaseData();
        renderApp();
    }
}

// Guardar cambios en Google Sheets y en respaldo local
async function saveToGoogleSheets() {
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

function getBaseData() {
    return [
        { dia: 'Día 1', fecha: '2026-07-21', ingreso: 545, consumo: 278 },
        { dia: 'Día 2', fecha: '2026-07-22', ingreso: 4590, consumo: 169.444 },
        { dia: 'Día 3', fecha: '2026-07-24', ingreso: 3640, consumo: 27.778 },
        { dia: 'Día 4', fecha: '2026-07-27', ingreso: 1860, consumo: 166.667 },
        { dia: 'Día 5', fecha: '2026-07-28', ingreso: 4510, consumo: 277.778 },
        { dia: 'Día 6', fecha: '2026-07-29', ingreso: 7420, consumo: 0 },
        { dia: 'Día 7', fecha: '2026-07-30', ingreso: 1825, consumo: 0 },
        { dia: 'Día 8', fecha: '2026-08-03', ingreso: 3830, consumo: 0 },
        { dia: 'Día 9', fecha: '2026-08-04', ingreso: 1835, consumo: 0 },
        { dia: 'Día 10', fecha: '2026-08-05', ingreso: 570, consumo: 0 },
        { dia: 'Día 11', fecha: '2026-08-07', ingreso: 2750, consumo: 0 },
        { dia: 'Día 12', fecha: '2026-08-08', ingreso: 1855, consumo: 0 },
        { dia: 'Día 13', fecha: '2026-08-10', ingreso: 4540, consumo: 0 },
        { dia: 'Día 14', fecha: '2026-08-11', ingreso: 5410, consumo: 0 },
        { dia: 'Día 15', fecha: '2026-08-12', ingreso: 5685, consumo: 0 },
        { dia: 'Día 16', fecha: '2026-08-13', ingreso: 3560, consumo: 0 },
        { dia: 'Día 17', fecha: '2026-08-19', ingreso: 5585, consumo: 0 }
    ];
}

function renderApp() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    let totalIngreso = 0, totalConsumo = 0, acumuladoTemp = 0;
    
    kardexData.forEach((item, index) => {
        let ing = Number(item.ingreso) || 0;
        let con = Number(item.consumo) || 0;
        
        totalIngreso += ing;
        totalConsumo += con;
        acumuladoTemp += con;
        let restanteTemp = META_TOTAL - acumuladoTemp;
        
        tbody.innerHTML += `<tr>
            <td>${item.dia}</td>
            <td>${item.fecha}</td>
            <td><input type="number" id="ing_${index}" value="${ing}" disabled style="width:70px"></td>
            <td><input type="number" step="0.001" id="con_${index}" value="${con}" disabled style="width:70px"></td>
            <td>${acumuladoTemp.toFixed(3)}</td>
            <td>${restanteTemp.toFixed(3)}</td>
            <td>
                <button class="btn-edit" id="btnEdit_${index}" onclick="enableEdit(${index})">Editar</button>
                <button class="btn-save" id="btnSave_${index}" onclick="saveEdit(${index})">Guardar</button>
                <button class="btn-delete" onclick="deleteItem(${index})">Eliminar</button>
            </td>
        </tr>`;
    });

    document.getElementById('kpiIngreso').innerText = totalIngreso.toLocaleString() + " L";
    document.getElementById('kpiConsumo').innerText = totalConsumo.toFixed(3) + " kg";
    document.getElementById('kpiRestante').innerText = (META_TOTAL - totalConsumo).toFixed(3) + " kg";
    
    updateChart();
}

function enableEdit(index) {
    document.getElementById(`ing_${index}`).disabled = false;
    document.getElementById(`con_${index}`).disabled = false;
    document.getElementById(`btnEdit_${index}`).style.display = 'none';
    document.getElementById(`btnSave_${index}`).style.display = 'inline-block';
}

function saveEdit(index) {
    let newIng = document.getElementById(`ing_${index}`).value;
    let newCon = document.getElementById(`con_${index}`).value;
    
    kardexData[index].ingreso = parseFloat(newIng) || 0;
    kardexData[index].consumo = parseFloat(newCon) || 0;
    
    renderApp();
    saveToGoogleSheets();
}

function addNewItem() {
    const dia = document.getElementById('newDia').value.trim();
    const fecha = document.getElementById('newFecha').value;
    const ingreso = parseFloat(document.getElementById('newIngreso').value) || 0;
    const consumo = parseFloat(document.getElementById('newConsumo').value) || 0;

    if (!dia || !fecha) {
        alert("Completa el nombre del día y la fecha.");
        return;
    }

    kardexData.push({ dia, fecha, ingreso, consumo });
    
    document.getElementById('newDia').value = '';
    document.getElementById('newFecha').value = '';
    document.getElementById('newIngreso').value = '';
    document.getElementById('newConsumo').value = '';

    renderApp();
    saveToGoogleSheets();
}

function deleteItem(index) {
    kardexData.splice(index, 1);
    renderApp();
    saveToGoogleSheets();
}

function updateChart() {
    const ctx = document.getElementById('kardexChart').getContext('2d');
    if(window.myChart) window.myChart.destroy();
    
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: kardexData.map(i => i.dia),
            datasets: [{
                label: 'Consumo Diario (kg)',
                data: kardexData.map(i => i.consumo),
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Evolución del Consumo Diario de Leche' }
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
