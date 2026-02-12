// ===============================
// 3. Crear y agregar elementos dinámicamente
// ===============================

const productList = document.getElementById("product_list");
const btnAgregarItem = document.getElementById("btnAgregarItem");

// Vamos a llevar la cuenta de cuántos ítems se han agregado
let contadorItems = 2;

btnAgregarItem.addEventListener("click", function () {
  contadorItems++;

  // document.createElement: crea un nuevo nodo del tipo indicado. [web:29][web:80]
  const nuevoLi = document.createElement("li");

  // Asignar texto al nuevo elemento
  nuevoLi.textContent = "Elemento agregado " + contadorItems;

  // appendChild: agrega el nuevo nodo como hijo del elemento padre. [web:29]
  listaDemo.appendChild(nuevoLi);
});