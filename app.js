const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby0ISdhqN9LcwLCzO8aRa_zDw7ejU6KihbLNQikWuSu0MhYBH_mDgvmDBcYIXQPNV5eFA/exec";
const META_TOTAL_KG = 21981; 
const RATIO_L_POR_KG = 9;   

let kardexData = [];

// Formato: 21.981 (Punto como separador de miles, sin decimales innecesarios)
function formatKPI(num) {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

async function loadFromGoogleSheets() {
    try {
        let response = await fetch(WEB_APP_URL);
        let result = await response.json();
        if (Array.isArray(result) && result.length > 0) {
            kardexData = result;
        } else {
            kardexData = getBaseData();
        }
        renderApp();
    } catch (error) {
        kardexData = JSON.parse(localStorage.getItem('kardexData')) || getBaseData();
        renderApp();
    }
}

async function saveToGoogleSheets() {
    if (!kardexData || kardexData.length === 0) return;
    localStorage.setItem('kardexData', JSON.stringify(kardexData));
    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(kardexData)
        });
    } catch (error) { console.error("Error al sincronizar"); }
}

function renderApp() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    let totalIngresoL = 0;
    
    kardexData.forEach((item, index) => {
        let cantidadL = Number(item.cantidad) || 0;
        totalIngresoL += cantidadL;
        
        tbody.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td>${item.fecha}</td>
            <td><input type="number" step="any" id="cant_${index}" value="${cantidadL}" disabled style="width:80px"></td>
            <td>
                <button class="btn-edit" id="btnEdit_${index}" onclick="enableEdit(${index})">Editar</button>
                <button class="btn-save" id="btnSave_${index}" onclick="saveEdit(${index})">Guardar</button>
                <button class="btn-delete" onclick="deleteItem(${index})">X</button>
            </td>
        </tr>`;
    });

    let totalConsumoEqKg = totalIngresoL / RATIO_L_POR_KG;
    let restanteKg = META_TOTAL_KG - totalConsumoEqKg;

    // Aplicar formato limpio a los KPIs
    document.getElementById('kpiIngreso').innerText = formatKPI(totalIngresoL) + " L";
    document.getElementById('kpiConsumo').innerText = formatKPI(totalConsumoEqKg) + " kg";
    document.getElementById('kpiRestante').innerText = formatKPI(restanteKg) + " kg";
    
    updateChart();
}
// ... (resto de funciones como addNewItem, updateChart, etc. se mantienen igual)
