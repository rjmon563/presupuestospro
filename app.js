/**********************
 * DATOS Y ESTADO
 **********************/
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let clienteActual = null;
let obraActual = null;

const IVA = 0.21;

/**********************
 * CALCULADORA PROFESIONAL
 **********************/
let calcTipo = "";
let buffer = [];
let inputActual = "";

/**********************
 * INICIO
 **********************/
document.addEventListener("DOMContentLoaded", () => {
  renderClientes();
});

/**********************
 * NAVEGACIÓN
 **********************/
function irAPantalla(p) {
  document.querySelectorAll("[id^='pantalla-']").forEach(d =>
    d.classList.add("hidden")
  );
  document.getElementById("pantalla-" + p).classList.remove("hidden");
}

/**********************
 * CLIENTES
 **********************/
function nuevoCliente() {
  id("modal-cliente").classList.remove("hidden");
}

function guardarCliente() {
  const nombre = input("input-cliente");
  if (!nombre) return;

  clientes.push({
    id: Date.now(),
    nombre,
    obras: []
  });

  guardar();
  cerrar("modal-cliente");
  renderClientes();
}

function renderClientes() {
  const lista = id("lista-clientes");
  lista.innerHTML = "";

  clientes.forEach(c => {
    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded-xl shadow font-bold";
    div.textContent = c.nombre;
    div.onclick = () => abrirCliente(c.id);
    lista.appendChild(div);
  });
}

function abrirCliente(idCliente) {
  clienteActual = clientes.find(c => c.id === idCliente);
  id("detalle-cliente").innerHTML =
    `<h2 class="text-xl font-black">${clienteActual.nombre}</h2>`;
  irAPantalla("expediente");
}

/**********************
 * OBRAS
 **********************/
function confirmarNombreObra() {
  const nombre = input("input-nombre-obra");
  if (!nombre) return;

  obraActual = {
    id: Date.now(),
    nombre,
    mediciones: []
  };

  clienteActual.obras.push(obraActual);
  guardar();

  id("titulo-obra").textContent = nombre;
  renderMediciones();
  irAPantalla("trabajo");
}

/**********************
 * CALCULADORA (METRO LÁSER)
 **********************/
function abrirCalc(tipo) {
  calcTipo = tipo;
  buffer = [];
  inputActual = "";
  id("calc-display").textContent = "0";
  id("calc-titulo").textContent = tipo;
  id("precio-unitario").value = "";
  id("modal-calc").classList.remove("hidden");
}

function tecla(v) {
  if (v === "+") {
    if (inputActual) {
      buffer.push(parseFloat(inputActual));
      inputActual = "";
      mostrarParcial();
    }
    return;
  }

  if (v === "OK") {
    if (inputActual) buffer.push(parseFloat(inputActual));
    procesarMedicion();
    cerrar("modal-calc");
    return;
  }

  inputActual += v;
  id("calc-display").textContent = inputActual;
}

function mostrarParcial() {
  const suma = buffer.reduce((a, b) => a + b, 0);
  id("calc-display").textContent = suma.toFixed(2);
}

function procesarMedicion() {
  let cantidad = 0;

  if (calcTipo === "Techos" || calcTipo === "Tabiques") {
    if (buffer.length < 2) return;
    cantidad = buffer[0] * buffer[1];
  }

  if (calcTipo === "Cajones" || calcTipo === "Tabicas") {
    if (buffer.length < 2 || buffer[1] <= 0.6) return;
    cantidad = buffer[0] * buffer[1];
  }

  if (calcTipo === "Cantoneras") {
    cantidad = buffer.reduce((a, b) => a + b, 0);
  }

  if (calcTipo === "Horas") {
    cantidad = buffer.reduce((a, b) => a + b, 0);
  }

  const precio = parseFloat(id("precio-unitario").value || 0);

  obraActual.mediciones.push({
    tipo: calcTipo,
    cantidad,
    precio,
    total: cantidad * precio
  });

  guardar();
  renderMediciones();
}

/**********************
 * MEDICIONES Y TOTALES
 **********************/
function renderMediciones() {
  const lista = id("lista-mediciones");
  lista.innerHTML = "";

  let subtotal = 0;

  obraActual.mediciones.forEach(m => {
    subtotal += m.total;
    const div = document.createElement("div");
    div.className = "bg-white p-3 rounded-xl shadow";
    div.textContent =
      `${m.tipo}: ${m.cantidad.toFixed(2)} x ${m.precio}€ = ${m.total.toFixed(2)}€`;
    lista.appendChild(div);
  });

  const iva = subtotal * IVA;
  const total = subtotal + iva;

  id("subtotal").textContent = subtotal.toFixed(2) + " €";
  id("iva").textContent = iva.toFixed(2) + " €";
  id("total").textContent = total.toFixed(2) + " €";
}

/**********************
 * PDF
 **********************/
function generarPDF() {
  let html = `
    <h1>${clienteActual.nombre}</h1>
    <h2>${obraActual.nombre}</h2>
    <hr><br>
  `;

  obraActual.mediciones.forEach(m => {
    html += `
      ${m.tipo}: ${m.cantidad.toFixed(2)} × ${m.precio}€ = ${m.total.toFixed(2)}€<br>
    `;
  });

  html += `<br><strong>Total: ${id("total").textContent}</strong>`;

  id("print-contenido").innerHTML = html;
  window.print();
}

/**********************
 * UTILIDADES
 **********************/
function guardar() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function id(x) {
  return document.getElementById(x);
}

function input(x) {
  return id(x).value.trim();
}

function cerrar(x) {
  id(x).classList.add("hidden");
}
