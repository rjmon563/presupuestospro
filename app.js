/*************************
 * ESTADO GLOBAL
 *************************/
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let clienteActual = null;
let obraActual = null;

let calcValor = "0";
let calcContexto = "";

/*************************
 * UTILIDADES
 *************************/
function guardarStorage() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function $(id) {
  return document.getElementById(id);
}

function irAPantalla(nombre) {
  document.querySelectorAll("[id^='pantalla-']").forEach(p => {
    p.classList.add("hidden");
  });
  $(`pantalla-${nombre}`).classList.remove("hidden");
}

/*************************
 * CLIENTES
 *************************/
function renderClientes() {
  const cont = $("lista-clientes");
  cont.innerHTML = "";

  clientes.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded-2xl shadow font-bold active-scale";
    div.innerText = c.nombre;
    div.onclick = () => abrirCliente(i);
    cont.appendChild(div);
  });
}

function nuevoCliente() {
  const nombre = prompt("Nombre del cliente:");
  if (!nombre || nombre.length < 2) return;

  clientes.push({ nombre, obras: [] });
  guardarStorage();
  renderClientes();
}

function abrirCliente(index) {
  clienteActual = index;
  const cliente = clientes[index];

  $("ficha-cliente-detalle").innerHTML = `
    <h2 class="text-xl font-black mb-4">${cliente.nombre}</h2>
    <div class="space-y-2">
      ${cliente.obras.map(o => `
        <div class="bg-slate-100 p-3 rounded-xl font-bold">${o.nombre}</div>
      `).join("")}
    </div>
  `;

  irAPantalla("expediente");
}

/*************************
 * OBRAS
 *************************/
function confirmarNombreObra() {
  const nombre = $("input-nombre-obra").value.trim();
  if (nombre.length < 3) {
    alert("Introduce un nombre válido");
    return;
  }

  obraActual = {
    nombre,
    medidas: []
  };

  clientes[clienteActual].obras.push(obraActual);
  guardarStorage();

  $("titulo-obra-actual").innerText = nombre;
  $("lista-medidas-obra").innerHTML = "";
  $("input-nombre-obra").value = "";

  renderBotonesTrabajo();
  irAPantalla("trabajo");
}

function guardarObraCompleta() {
  guardarStorage();
  navigator.vibrate?.(30);
  alert("Obra guardada");
  irAPantalla("expediente");
}

/*************************
 * TRABAJO / MEDICIONES
 *************************/
const tiposTrabajo = [
  "Pintura",
  "Pladur",
  "Alicatado",
  "Electricidad",
  "Fontanería",
  "Horas"
];

function renderBotonesTrabajo() {
  const cont = $("botones-trabajo");
  cont.innerHTML = "";

  tiposTrabajo.forEach(tipo => {
    const btn = document.createElement("button");
    btn.className =
      "bg-blue-600 text-white p-4 rounded-2xl font-black uppercase active-scale";
    btn.innerText = tipo;
    btn.onclick = () => abrirCalculadora(tipo);
    cont.appendChild(btn);
  });
}

function abrirCalculadora(tipo) {
  calcValor = "0";
  calcContexto = tipo;
  $("calc-display").innerText = "0";
  $("calc-titulo").innerText = tipo;

  $("modal-calc").classList.remove("hidden");
  document.body.classList.add("no-scroll");
}

function cerrarCalc() {
  $("modal-calc").classList.add("hidden");
  document.body.classList.remove("no-scroll");
}

/*************************
 * CALCULADORA
 *************************/
function teclear(valor) {
  if (valor === "DEL") {
    calcValor = "0";
  } else if (valor === "OK") {
    guardarMedida();
    cerrarCalc();
    return;
  } else {
    if (calcValor === "0") calcValor = "";
    calcValor += valor;
  }
  $("calc-display").innerText = calcValor;
}

function guardarMedida() {
  const normalizado = calcValor.replace(",", ".");
  const numero = parseFloat(normalizado);

  if (isNaN(numero)) return;

  obraActual.medidas.push({
    tipo: calcContexto,
    valor: numero,
    fecha: new Date().toISOString()
  });

  renderMedidas();
  guardarStorage();
}

function renderMedidas() {
  const cont = $("lista-medidas-obra");
  cont.innerHTML = "";

  obraActual.medidas.forEach(m => {
    const div = document.createElement("div");
    div.className =
      "bg-white p-3 rounded-xl shadow flex justify-between font-bold";
    div.innerHTML = `
      <span>${m.tipo}</span>
      <span>${m.valor.toFixed(2)}</span>
    `;
    cont.appendChild(div);
  });
}

/*************************
 * INICIO
 *************************/
renderClientes();

/*************************
 * SERVICE WORKER
 *************************/
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
