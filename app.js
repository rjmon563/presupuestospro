/* ================= ESTADO ================= */
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let clienteActual = null;
let obraActual = null;
let calcValor = "0";

/* ================= INICIO ================= */
document.addEventListener("DOMContentLoaded", () => {
  renderClientes();
});

/* ================= NAVEGACIÓN ================= */
function irAPantalla(p) {
  ["clientes","expediente","nombre-obra","trabajo"].forEach(x => {
    const el = document.getElementById("pantalla-" + x);
    if (el) el.classList.add("hidden");
  });
  document.getElementById("pantalla-" + p).classList.remove("hidden");
}

/* ================= CLIENTES ================= */
function nuevoCliente() {
  document.getElementById("modal-cliente").classList.remove("hidden");
}

function cerrarModalCliente() {
  document.getElementById("modal-cliente").classList.add("hidden");
  document.getElementById("input-nuevo-cliente").value = "";
}

function guardarNuevoCliente() {
  const nombre = document.getElementById("input-nuevo-cliente").value.trim();
  if (!nombre) return;

  clientes.push({
    id: Date.now(),
    nombre,
    obras: []
  });

  guardar();
  renderClientes();
  cerrarModalCliente();
}

function renderClientes() {
  const lista = document.getElementById("lista-clientes");
  lista.innerHTML = "";

  if (clientes.length === 0) {
    lista.innerHTML = `<p class="text-center text-slate-500">No hay clientes</p>`;
    return;
  }

  clientes.forEach(c => {
    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded-2xl shadow font-bold active-scale";
    div.textContent = c.nombre;
    div.onclick = () => abrirCliente(c.id);
    lista.appendChild(div);
  });
}

function abrirCliente(id) {
  clienteActual = clientes.find(c => c.id === id);

  document.getElementById("ficha-cliente-detalle").innerHTML = `
    <h2 class="text-xl font-black">${clienteActual.nombre}</h2>
    <p class="text-sm text-slate-500">${clienteActual.obras.length} trabajos</p>
  `;

  irAPantalla("expediente");
}

/* ================= OBRAS ================= */
function confirmarNombreObra() {
  const input = document.getElementById("input-nombre-obra");
  if (!input.value.trim()) return;

  obraActual = {
    id: Date.now(),
    nombre: input.value,
    mediciones: []
  };

  clienteActual.obras.push(obraActual);
  guardar();

  document.getElementById("titulo-obra-actual").textContent = obraActual.nombre;
  renderBotonesTrabajo();
  renderMediciones();

  input.value = "";
  irAPantalla("trabajo");
}

function guardarObraCompleta() {
  guardar();
  irAPantalla("expediente");
}

/* ================= MEDICIONES ================= */
function renderBotonesTrabajo() {
  const cont = document.getElementById("botones-trabajo");
  cont.innerHTML = "";

  ["Medición m²","Horas","Unidades"].forEach(tipo => {
    const b = document.createElement("button");
    b.className = "bg-blue-600 text-white py-6 rounded-2xl font-black active-scale";
    b.textContent = tipo;
    b.onclick = () => abrirCalculadora(tipo);
    cont.appendChild(b);
  });
}

function renderMediciones() {
  const lista = document.getElementById("lista-medidas-obra");
  lista.innerHTML = "";

  obraActual.mediciones.forEach(m => {
    const div = document.createElement("div");
    div.className = "bg-white p-3 rounded-xl shadow text-sm";
    div.textContent = `${m.tipo}: ${m.valor}`;
    lista.appendChild(div);
  });
}

/* ================= CALCULADORA ================= */
function abrirCalculadora(tipo) {
  calcValor = "0";
  document.getElementById("calc-titulo").textContent = tipo;
  actualizarDisplay();
  document.getElementById("modal-calc").classList.remove("hidden");

  window._calcTipo = tipo;
}

function cerrarCalc() {
  document.getElementById("modal-calc").classList.add("hidden");
}

function teclear(v) {
  if (v === "DEL") calcValor = "0";
  else if (v === "OK") {
    obraActual.mediciones.push({ tipo: window._calcTipo, valor: calcValor });
    guardar();
    renderMediciones();
    cerrarCalc();
    return;
  } else {
    if (calcValor === "0") calcValor = v;
    else calcValor += v;
  }
  actualizarDisplay();
}

function actualizarDisplay() {
  document.getElementById("calc-display").textContent = calcValor;
}

/* ================= STORAGE ================= */
function guardar() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

/* ================= PWA ================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
