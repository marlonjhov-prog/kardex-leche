const WEB_APP_URL = "PEGAR_AQUÍ_TU_NUEVA_URL_DE_GOOGLE_APPS_SCRIPT";
const META_TOTAL_KG = 21981; // Meta total en kg de leche en polvo
const RATIO_L_POR_KG = 9;   // 1 kg = 9 Litros

let kardexData = [];

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
        console.warn("Cargando desde respaldo local por error de red:", error);
        kardexData = JSON.parse(localStorage.getItem('kardexData')) || getBaseData();
        renderApp();
    }
}

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

function renderApp() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    let totalIngresoL = 0, acumuladoKg = 0;
    
    kardexData.forEach((item, index) => {
        let cantidadL = Number(item.cantidad) || 0;
        let consumoKg = cantidadL / RATIO_L_POR_KG;
        
        totalIngresoL += cantidadL;
        acumuladoKg += consumoKg;
        let restanteKg = META_TOTAL_KG - acumuladoKg;
        let numeroDia = `Día ${index + 1}`;
        
        tbody.innerHTML += `<tr>
            <td>${numeroDia}</td>
            <td>${item.fecha}</td>
            <td><input type="number" step="any" id="cant_${index}" value="${cantidadL}" disabled style="width:80px"></td>
            <td>${consumoKg.toFixed(3)} kg</td>
            <td>${acumuladoKg.toFixed(3)} kg</td>
            <td>${restanteKg.toFixed(3)} kg</td>
            <td>
                <button class="btn-edit" id="btnEdit_${index}" onclick="enableEdit(${index})">Modificar</button>
                <button class="btn-save" id="btnSave_${index}" onclick="saveEdit(${index})">Guardar</button>
                <button class="btn-delete" onclick="deleteItem(${index})">Eliminar</button>
            </td>
        </tr>`;
    });

    let totalConsumoEqKg = totalIngresoL / RATIO_L_POR_KG;

    document.getElementById('kpiIngreso').innerText = totalIngresoL.toLocaleString() + " L";
    document.getElementById('kpiConsumo').innerText = totalConsumoEqKg.toFixed(3) + " kg";
    document.getElementById('kpiRestante').innerText = (META_TOTAL_KG - totalConsumoEqKg).toFixed(3) + " kg";
    
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

    if (!fecha) {
        alert("Por favor selecciona una fecha.");
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
                title: { display: true, text: 'Progreso Acumulado hacia la Meta de 21,981 kg' }
            }
        }
    });
}

function toggleTable() {
    const s = document.getElementById('tableSection');
    s.style.display = s.style.display === 'none' ? 'block' : 'none';
}

loadFromGoogleSheets();
