const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxGgCEj3O_jj2AOnxKHBijgyafqkpbelCbOJzAlKJ2riasCBQYF3Y2X4PY_8ZylOR2mTg/exec";
const META_TOTAL = 21981; 

let kardexData = [];

// Cargar datos desde Google Sheets al iniciar la página
async function loadFromGoogleSheets() {
    try {
        let response = await fetch(WEB_APP_URL);
        kardexData = await response.json();
        renderApp();
    } catch (error) {
        console.error("Error al cargar Google Sheets:", error);
        alert("No se pudo conectar con Google Sheets.");
    }
}

// Guardar cambios directamente en Google Sheets
async function saveToGoogleSheets() {
    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(kardexData)
        });
    } catch (error) {
        console.error("Error al guardar en Google Sheets:", error);
    }
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
    saveToGoogleSheets(); // Sincroniza con Google Sheets
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
    saveToGoogleSheets(); // Sincroniza con Google Sheets
}

function deleteItem(index) {
    kardexData.splice(index, 1);
    renderApp();
    saveToGoogleSheets(); // Sincroniza con Google Sheets
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

// Carga inicial al abrir la web
loadFromGoogleSheets();
