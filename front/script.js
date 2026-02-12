
const productList = document.getElementById("product_list");
const btnAgregarItem = document.getElementById("btnAgregarItem");

// Vamos a llevar la cuenta de cuántos ítems se han agregado
let contadorItems = 2;

btnAgregarItem.addEventListener("click", function () {
  contadorItems++;
  console.log(contadorItems);

  // document.createElement: crea un nuevo nodo del tipo indicado. [web:29][web:80]
  const nuevoProducto = document.createElement("li");

  // Asignar texto al nuevo elemento
  nuevoProducto.textContent = "Bocina" + contadorItems;

  // appendChild: agrega el nuevo nodo como hijo del elemento padre. [web:29]
  productList.appendChild(nuevoProducto);
});