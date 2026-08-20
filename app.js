// Configuración y lógica para el Kardex sincronizado con gráficos y KPIs
document.addEventListener("DOMContentLoaded", function() {
    // Inicializar la carga y renderizado de la aplicación
    fetchDataAndRender();
});

async function fetchDataAndRender() {
    try {
        // Ocultar mensaje de carga y mostrar contenedores principales
        document.getElementById("loading").style.display = "none";
        document.getElementById("kpiSection").style.display = "flex";
        document.getElementById("chartSection").style.display = "block";

        // Datos de ejemplo basados en los registros de consumo (meta de 21.981 kg)
        const labels = ["Día 1", "Día 2", "Día 3", "Día 4", "Día 5"];
        const dataRestante = [21703, 21533, 21505, 21339, 21061];
        const dataConsumoAcumulado = [278, 447, 475, 641, 919];

        // Actualizar valores de los KPIs en la interfaz
        document.getElementById("kpiIngreso").innerText = "18,485 L";
        document.getElementById("kpiConsumo").innerText = "919.67 kg";
        document.getElementById("kpiRestante").innerText = "21,061.33 kg";

        // Renderizar la gráfica avanzada con Chart.js
        const ctx = document.getElementById('kardexChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Restante (kg)',
                    data: dataRestante,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }, {
                    label: 'Consumo Acumulado (kg)',
                    data: dataConsumoAcumulado,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Evolución del Consumo y Stock Restante' }
                }
            }
        });

    } catch (error) {
        console.error("Error al cargar los datos:", error);
        document.getElementById("loading").innerText = "Error al procesar la información.";
    }
}
