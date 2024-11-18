let pyodide;

async function cargarPyodide() {
    pyodide = await loadPyodide();
    console.log("Pyodide cargado correctamente");
}

cargarPyodide();

async function calcularMM1() {
    const lamda = parseFloat(document.getElementById('lamda').value);
    const mu = parseFloat(document.getElementById('mu').value);
    const resultadoDiv = document.getElementById('resultado');
    const procedimientoDiv = document.getElementById('procedimiento');
    const errorDiv = document.getElementById('error');

    if (isNaN(lamda) || isNaN(mu) || lamda <= 0 || mu <= 0) {
        errorDiv.textContent = "Por favor, ingresa valores válidos para λ y μ. Asegúrate de que ambos sean números positivos.";
        resultadoDiv.textContent = '';
        procedimientoDiv.textContent = '';
        return;
    }

    if (lamda > mu) {
        errorDiv.textContent = "Error, si la tasa de llegada (λ) es mayor que la tasa de servicio (μ), los cálculos relacionados con el sistema de colas pueden resultar en valores negativos o infinitos, lo cual no tiene sentido práctico.";
        resultadoDiv.textContent = '';
        procedimientoDiv.textContent = '';
        return;
    }

    errorDiv.textContent = ''; // Limpiar error si no lo hay

    const codigoPython = `
def format_num(n):
    return ('{:.4f}'.format(n)).rstrip('0').rstrip('.') if '.' in '{:.4f}'.format(n) else str(n)

def sistema_m_m_1(lamda, mu):
    rho = lamda / mu  # Utilización
    Lq = (rho**2) / (1 - rho)  # Número promedio en la fila
    Wq = Lq / lamda  # Tiempo promedio de espera en la cola
    W = Wq + (1 / mu)  # Tiempo promedio en el sistema
    L = lamda * W  # Número promedio en el sistema
    Po = 1 - rho  # Probabilidad de que no haya clientes
    Pw = rho  # Probabilidad de que un cliente espere
    
    # Calculamos Pn para n = 0, 1, 2, 3 como ejemplo
    Pn_values = [(i, Po * (rho**i)) for i in range(0, 4)]

    #procedimiento detallado
    procedimiento = f"1. Cálculo de la utilización (ρ):\\n<p><b>ρ = λ / μ =</b></p> {format_num(lamda)} / {format_num(mu)} = {format_num(rho)}\\n\\n"
    procedimiento += f"2. Cálculo del número promedio en la fila (Lq):\\n<p><b>Lq = ρ² / (1 - ρ) =</b></p> ({format_num(rho)})² / (1 - {format_num(rho)}) = {format_num(Lq)}\\n\\n"
    procedimiento += f"3. Cálculo del tiempo promedio de espera en la cola (Wq):\\n<p><b>Wq = Lq / λ =</b></p> {format_num(Lq)} / {format_num(lamda)} = {format_num(Wq)} horas\\n\\n"
    procedimiento += f"4. Cálculo del tiempo promedio en el sistema (W):\\n<p><b>W = Wq + 1 / μ =</b></p> {format_num(Wq)} + 1 / {format_num(mu)} = {format_num(W)} horas\\n\\n"
    procedimiento += f"5. Cálculo del número promedio en el sistema (L):\\n<p><b>L = λ * W =</b></p> {format_num(lamda)} * {format_num(W)} = {format_num(L)}\\n\\n"
    procedimiento += f"6. Cálculo de la probabilidad de que no haya clientes (Po):\\n<p><b>Po = 1 - ρ =</b></p> 1 - {format_num(rho)} = {format_num(Po)}\\n\\n"
    procedimiento += f"7. Cálculo de la probabilidad de que un cliente espere (Pw):\\n<p><b>Pw = 1 - Po = ρ</b></p> = {format_num(rho)}\\n\\n"
    procedimiento += f"8. Cálculo de la probabilidad de n clientes en el sistema (Pn):\\n<p><b>Pn = Po * ρ^n</b></p>\\n"
    
    for n, pn in Pn_values:
        procedimiento += f"P{n} = {format_num(Po)} * ({format_num(rho)})^{n} = {format_num(pn)}\\n"

    pn_result = "\\n".join([f"P{n} = {format_num(pn)}" for n, pn in Pn_values])
    resultado = f"Utilización: {format_num(rho)}\\nNúmero promedio en la fila (Lq): {format_num(Lq)}\\n" \
    f"Tiempo promedio de espera en la cola (Wq): {format_num(Wq)} horas\\n" \
    f"Tiempo promedio en el sistema (W): {format_num(W)} horas\\n" \
    f"Número promedio en el sistema (L): {format_num(L)}\\n" \
    f"Probabilidad de que no haya clientes (Po): {format_num(Po)}\\n" \
    f"Probabilidad de espera (Pw): {format_num(Pw)}\\n" \
    f"Probabilidad de n clientes en el sistema:\\n{pn_result}"

    return resultado, procedimiento

resultado, procedimiento = sistema_m_m_1(${lamda}, ${mu})
resultado, procedimiento
`;

    try {
        const [result, procedimiento] = await pyodide.runPythonAsync(codigoPython);
        resultadoDiv.innerHTML = result.replace(/\n/g, "<br>");
        procedimientoDiv.innerHTML = "<strong>Procedimiento detallado:</strong><br>" + procedimiento.replace(/\n/g, "<br>");
    } catch (error) {
        console.error("Error en el cálculo:", error);
        errorDiv.textContent = "Error en el cálculo: " + error.message || String(error);
    }
}

function Ayuda() {
    // Mostrar la pestaña de ayuda
    document.getElementById('ayuda-tab').style.display = 'block';
}

function cerrarAyuda() {
    // Ocultar la pestaña de ayuda
    document.getElementById('ayuda-tab').style.display = 'none';
}

function volver() {
    // Redirigir a la página anterior en el historial
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // Redirigir a una URL específica si no hay historial
        window.location.href = 'index.html'; // Cambia 'index.html' por la URL deseada
    }
}



function showError(message) {
    document.getElementById('error').textContent = message;
}

function showTab(tab) {
    const mm1Container = document.querySelector('.container');
    const mmcContainer = document.querySelector('.mmc-container');
    if (tab === 'mm1') {
        mm1Container.style.display = 'block';
        mmcContainer.style.display = 'none';
    } else {
        mm1Container.style.display = 'none';
        mmcContainer.style.display = 'block';
    }

    // Cambiar la clase activa
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.tab[onclick="showTab('${tab}')"]`).classList.add('active');
}

function reiniciarPagina() {
    location.reload();
}




