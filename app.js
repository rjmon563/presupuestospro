let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let agenda = JSON.parse(localStorage.getItem("agenda")) || [];

let clienteActual = null;
let obraActual = null;
let calcValor = "0";
let calcTipo = "";

/* ===== INICIO ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderClientes();
  renderAgenda();
});

/* ===== NAVEGACIÓN ===== */
function irAPantalla(p) {
  ["clientes","expediente","nombre-obra","trabajo","agenda"].forEach(x => {
    document.getElementById("pantalla-" + x)?.classList.add("hidden");
  });
  document.getElementById("pantalla-" + p).classList.remove("hidden");
}

/* ===== CLIENTES ===== */
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
  clientes.push({ id: Date.now(), nombre, obras: [] });
  guardar();
  renderClientes();
  cerrarModalCliente();
}

function renderClientes() {
  const lista = document.getElementById("lista-clientes");
  lista.innerHTML = "";
  clientes.forEach(c => {
    const d = document.createElement("div");
    d.className = "bg-white p-4 rounded-2xl shadow font-bold active-scale";
    d.textContent = c.nombre;
    d.onclick = () => abrirCliente(c.id);
    lista.appendChild(d);
  });
}

function abrirCliente(id) {
  clienteActual = clientes.find(c => c.id === id);
  document.getElementById("ficha-cliente-detalle").innerHTML =
    `<h2 class="text-xl font-black">${clienteActual.nombre}</h2>`;
  irAPantalla("expediente");
}

/* ===== OBRAS ===== */
function confirmarNombreObra() {
  const nombre = document.getElementById("input-nombre-obra").value.trim();
  if (!nombre) return;
  obraActual = { id: Date.now(), nombre, mediciones: [] };
  clienteActual.obras.push(obraActual);
  guardar();
  document.getElementById("titulo-obra-actual").textContent = nombre;
  renderBotonesTrabajo();
  renderMediciones();
  irAPantalla("trabajo");
}

function guardarObraCompleta() {
  guardar();
  irAPantalla("expediente");
}

/* ===== MEDICIONES ===== */
function renderBotonesTrabajo() {
  const c = document.getElementById("botones-trabajo");
  c.innerHTML = "";
  ["m²","Horas","Unidades"].forEach(t => {
    const b = document.createElement("button");
    b.className = "bg-blue-600 text-white py-6 rounded-2xl font-black active-scale";
    b.textContent = t;
    b.onclick = () => abrirCalc(t);
    c.appendChild(b);
  });
}

function renderMediciones() {
  const l = document.getElementById("lista-medidas-obra");
  l.innerHTML = "";
  obraActual.mediciones.forEach(m => {
    const d = document.createElement("div");
    d.className = "bg-white p-3 rounded-xl shadow";
    d.textContent = `${m.tipo}: ${m.valor}`;
    l.appendChild(d);
  });
}

/* ===== CALCULADORA ===== */
function abrirCalc(tipo) {
  calcValor = "0";
  calcTipo = tipo;
  document.getElementById("modal-calc").classList.remove("hidden");
}

function cerrarCalc() {
  document.getElementById("modal-calc").classList.add("hidden");
}

function teclear(v) {
  if (v === "DEL") calcValor = "0";
  else if (v === "OK") {
    obraActual.mediciones.push({ tipo: calcTipo, valor: calcValor });
    guardar();
    renderMediciones();
    cerrarCalc();
    return;
  } else calcValor = calcValor === "0" ? v : calcValor + v;
  document.getElementById("calc-display").textContent = calcValor;
}

/* ===== AGENDA ===== */
function abrirModalAgenda() {
  document.getElementById("modal-agenda").classList.remove("hidden");
}

function guardarCita() {
  agenda.push({
    id: Date.now(),
    fecha: document.getElementById("agenda-fecha").value,
    nota: document.getElementById("agenda-nota").value
  });
  guardar();
  renderAgenda();
  document.getElementById("modal-agenda").classList.add("hidden");
}

function renderAgenda() {
  const l = document.getElementById("lista-agenda");
  if (!l) return;
  l.innerHTML = "";
  agenda.forEach(a => {
    const d = document.createElement("div");
    d.className = "bg-white p-4 rounded-xl shadow";
    d.textContent = `${a.fecha} — ${a.nota}`;
    l.appendChild(d);
  });
}

/* ===== PDF ===== */
function generarPDF() {
  let html = `<strong>Cliente:</strong> ${clienteActual.nombre}<br><strong>Obra:</strong> ${obraActual.nombre}<hr>`;
  obraActual.mediciones.forEach(m => {
    html += `${m.tipo}: ${m.valor}<br>`;
  });
  document.getElementById("print-contenido").innerHTML = html;
  window.print();
}

/* ===== STORAGE ===== */
function guardar() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
  localStorage.setItem("agenda", JSON.stringify(agenda));
}

/* ===== PWA ===== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
