
const productList = document.getElementById("product_list");
const btnAgregarItem = document.getElementById("btnAgregarItem");
const inputName = document.getElementById("inputName");
const inputPrice = document.getElementById("inputPrice");
const inputDescription = document.getElementById("inputDescription");

// Vamos a llevar la cuenta de cuántos ítems se han agregado
let contadorItems = 2;

btnAgregarItem.addEventListener("click", function () {
  // Get values from inputs
    const name = inputName.value;
    const price = inputPrice.value;
    const description = inputDescription.value;

    // Validate inputs
    if (!name || !price || !description) {
        alert("Por favor completa todos los campos");
        return;
    }

    contadorItems++;

    // Create product object
    const product = {
        id: contadorItems,
        name: name,
        price: parseFloat(price),
        description: description
    };

    // Create the product card element
    const nuevoProducto = document.createElement("li");
    nuevoProducto.className = "product_card";

    // Set the HTML structure matching the placeholder
    nuevoProducto.innerHTML = `
        <h3 class="product_name">${product.name}</h3>
        <h4 class="product_price">$${product.price}</h4>
        <p class="product_description">${product.description}</p>
        <button class="btnActualizar">Actualizar</button>
        <button class="btnEliminar">Eliminar</button>
    `;

    // Add to the list
    productList.appendChild(nuevoProducto);

    // Clear inputs
    inputName.value = "";
    inputPrice.value = "";
    inputDescription.value = "";
});


// Factory function to create products
function createProduct(id, name, price, description) {
    return {
        id,
        name,
        price,
        description
    };
}

// Function to generate html card
function createProductCard(product) {
    const li = document.createElement("li");
    li.className = "product_card";
    
    li.innerHTML = `
        <h3 class="product_name">${product.name}</h3>
        <h4 class="product_price">$${product.price}</h4>
        <p class="product_description">${product.description}</p>
        <button class="btnActualizar">Actualizar</button>
        <button class="btnEliminar">Eliminar</button>
    `;
    
    return li;
}
