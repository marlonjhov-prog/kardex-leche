// Inicializar con tus datos reales del Kardex
let kardexData = JSON.parse(localStorage.getItem('kardexData')) || [
    { dia: 'Día 1', fecha: '2026-07-21', ingreso: 545, consumo: 278, acumulado: 278, restante: 21703 },
    { dia: 'Día 2', fecha: '2026-07-22', ingreso: 4590, consumo: 169.444, acumulado: 447.444, restante: 21533.556 },
    { dia: 'Día 3', fecha: '2026-07-24', ingreso: 3640, consumo: 27.778, acumulado: 475.222, restante: 21505.778 },
    { dia: 'Día 4', fecha: '2026-07-27', ingreso: 1860, consumo: 166.667, acumulado: 641.889, restante: 21339.111 },
    { dia: 'Día 5', fecha: '2026-07-28', ingreso: 4510, consumo: 277.778, acumulado: 919.667, restante: 21061.333 },
    { dia: 'Día 6', fecha: '2026-07-29', ingreso: 7420, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 7', fecha: '2026-07-30', ingreso: 1825, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 8', fecha: '2026-08-03', ingreso: 3830, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 9', fecha: '2026-08-04', ingreso: 1835, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 10', fecha: '2026-08-05', ingreso: 570, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 11', fecha: '2026-08-07', ingreso: 2750, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 12', fecha: '2026-08-08', ingreso: 1855, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Dita 13', fecha: '2026-08-10', ingreso: 4540, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 14', fecha: '2026-08-11', ingreso: 5410, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 15', fecha: '2026-08-12', ingreso: 5685, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 16', fecha: '2026-08-13', ingreso: 3560, consumo: 0, acumulado: 0, restante: 0 },
    { dia: 'Día 17', fecha: '2026-08-19', ingreso: 5585, consumo: 0, acumulado: 0, restante: 0 }
];

function renderApp() {
    localStorage.setItem('kardexData', JSON.stringify(kardexData));
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    let totalIngreso = 0, totalConsumo = 0;
    
    kardexData.forEach((item, index) => {
        totalIngreso += Number(item.ingreso) || 0;
        totalConsumo += Number(item.consumo) || 0;
        
        tbody.innerHTML += `<tr>
            <td>${item.dia}</td>
            <td>${item.fecha}</td>
            <td><input type="number" value="${item.ingreso}" onchange="updateValue(${index}, 'ingreso', this.value)" style="width:80px"></td>
            <td><input type="number" step="0.001" value="${item.consumo}" onchange="updateValue(${index}, 'consumo', this.value)" style="width:80px"></td>
            <td>
                <button class="btn-delete" onclick="deleteItem(${index})">Eliminar</button>
            </td>
        </tr>`;
    });

    document.getElementById('kpiIngreso').innerText = totalIngreso.toLocaleString() + " L";
    document.getElementById('kpiConsumo').innerText = totalConsumo.toFixed(3) + " kg";
    document.getElementById('kpiRestante').innerText = (21981 - totalConsumo).toFixed(3) + " kg";
    
    updateChart();
}

function updateValue(index, field, value) {
    kardexData[index][field] = parseFloat(value) || 0;
    renderApp();
}

function deleteItem(index) {
    kardexData.splice(index, 1);
    renderApp();
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
            plugins: {
                title: { display: true, text: 'Gráfica de Avance de Consumo Diario' }
            }
        }
    });
}

function toggleTable() {
    const s = document.getElementById('tableSection');
    s.style.display = s.style.display === 'none' ? 'block' : 'none';
}

// Forzar limpieza de almacenamiento local obsoleto una sola vez si está vacío
if(!localStorage.getItem('kardexInitialized')) {
    localStorage.removeItem('kardexData');
    localStorage.setItem('kardexInitialized', 'true');
    location.reload();
}

renderApp();
