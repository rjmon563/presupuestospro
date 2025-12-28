let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let clienteActual = null;
let obraActual = null;

let calcValor = "0";
let calcTipo = "";

const IVA = 0.21;

document.addEventListener("DOMContentLoaded", renderClientes);

/* NAVEGACIÓN */
function irAPantalla(p) {
  document.querySelectorAll("[id^='pantalla-']").forEach(x => x.classList.add("hidden"));
  document.getElementById("pantalla-" + p).classList.remove("hidden");
}

/* CLIENTES */
function nuevoCliente() {
  document.getElementById("modal-cliente").classList.remove("hidden");
}

function guardarCliente() {
  const nombre = input("input-cliente");
  if (!nombre) return;
  clientes.push({ id: Date.now(), nombre, obras: [] });
  guardar();
  cerrar("modal-cliente");
  renderClientes();
}

function renderClientes() {
  const l = id("lista-clientes");
  l.innerHTML = "";
  clientes.forEach(c => {
    const d = document.createElement("div");
    d.className = "bg-white p-4 rounded-xl shadow font-bold";
    d.textContent = c.nombre;
    d.onclick = () => abrirCliente(c.id);
    l.appendChild(d);
  });
}

function abrirCliente(idc) {
  clienteActual = clientes.find(c => c.id === idc);
  id("detalle-cliente").innerHTML =
    `<h2 class="text-xl font-black">${clienteActual.nombre}</h2>`;
  irAPantalla("expediente");
}

/* OBRAS */
function confirmarNombreObra() {
  const nombre = input("input-nombre-obra");
  obraActual = { id: Date.now(), nombre, mediciones: [] };
  clienteActual.obras.push(obraActual);
  guardar();
  id("titulo-obra").textContent = nombre;
  renderMediciones();
  irAPantalla("trabajo");
}

/* CALCULADORA */
function abrirCalc(tipo) {
  calcTipo = tipo;
  calcValor = "0";
  id("calc-display").textContent = "0";
  id("calc-titulo").textContent = tipo;
  id("precio-unitario").value = "";
  id("modal-calc").classList.remove("hidden");
}

function tecla(v) {
  if (v === "OK") {
    const precio = parseFloat(id("precio-unitario").value || 0);
    const cantidad = parseFloat(calcValor);
    const total = cantidad * precio;

    obraActual.mediciones.push({
      tipo: calcTipo,
      cantidad,
      precio,
      total
    });

    guardar();
    renderMediciones();
    cerrar("modal-calc");
    return;
  }
  calcValor = calcValor === "0" ? v : calcValor + v;
  id("calc-display").textContent = calcValor;
}

/* MEDICIONES + TOTALES */
function renderMediciones() {
  const l = id("lista-mediciones");
  l.innerHTML = "";
  let subtotal = 0;

  obraActual.mediciones.forEach(m => {
    subtotal += m.total;
    const d = document.createElement("div");
    d.className = "bg-white p-3 rounded-xl shadow";
    d.textContent = `${m.tipo}: ${m.cantidad} x ${m.precio}€ = ${m.total.toFixed(2)}€`;
    l.appendChild(d);
  });

  const iva = subtotal * IVA;
  const total = subtotal + iva;

  id("subtotal").textContent = subtotal.toFixed(2) + " €";
  id("iva").textContent = iva.toFixed(2) + " €";
  id("total").textContent = total.toFixed(2) + " €";
}

/* PDF */
function generarPDF() {
  let html = `
    <h1>${clienteActual.nombre}</h1>
    <h2>${obraActual.nombre}</h2><hr><br>
  `;
  obraActual.mediciones.forEach(m => {
    html += `${m.tipo}: ${m.cantidad} x ${m.precio}€ = ${m.total.toFixed(2)}€<br>`;
  });
  html += `<br><strong>Total: ${id("total").textContent}</strong>`;

  id("print-contenido").innerHTML = html;
  window.print();
}

/* UTILIDADES */
function guardar() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}
function id(x) { return document.getElementById(x); }
function input(x) { return id(x).value.trim(); }
function cerrar(x) { id(x).classList.add("hidden"); }
