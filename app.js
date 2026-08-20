let kardexData = JSON.parse(localStorage.getItem('kardexData')) || [
    { dia: 'Día 1', fecha: '2026-07-21', ingreso: 545, consumo: 278 },
    { dia: 'Día 2', fecha: '2026-07-22', ingreso: 4590, consumo: 169.444 }
];

function renderApp() {
    localStorage.setItem('kardexData', JSON.stringify(kardexData));
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    let totalIngreso = 0, totalConsumo = 0;
    
    kardexData.forEach((item, index) => {
        totalIngreso += item.ingreso;
        totalConsumo += item.consumo;
        tbody.innerHTML += `<tr>
            <td>${item.dia}</td><td>${item.fecha}</td><td>${item.ingreso}</td><td>${item.consumo}</td>
            <td>
                <button class="btn-edit" onclick="editItem(${index})">Editar</button>
                <button class="btn-delete" onclick="deleteItem(${index})">Eliminar</button>
            </td>
        </tr>`;
    });

    document.getElementById('kpiIngreso').innerText = totalIngreso.toFixed(2);
    document.getElementById('kpiConsumo').innerText = totalConsumo.toFixed(2);
    document.getElementById('kpiRestante').innerText = (21981 - totalConsumo).toFixed(2);
    
    updateChart();
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
            datasets: [{ label: 'Consumo Diario', data: kardexData.map(i => i.consumo), borderColor: '#007bff' }]
        }
    });
}

function toggleTable() {
    const s = document.getElementById('tableSection');
    s.style.display = s.style.display === 'none' ? 'block' : 'none';
}

renderApp();
