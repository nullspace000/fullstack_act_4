const productList = document.getElementById("product_list");
const btnAgregarItem = document.getElementById("btnAgregarItem");
const inputName = document.getElementById("inputName");
const inputPrice = document.getElementById("inputPrice");
const inputDescription = document.getElementById("inputDescription");

// Load products from database on page load
document.addEventListener('DOMContentLoaded', loadProducts);

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        productList.innerHTML = '';
        products.forEach(product => {
            const card = createProductCard(product);
            productList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

btnAgregarItem.addEventListener("click", async function () {
    const name = inputName.value;
    const price = inputPrice.value;
    const description = inputDescription.value;

    if (!name || !price || !description) {
        alert("Por favor completa todos los campos");
        return;
    }

    const product = {
        name,
        price: parseFloat(price),
        description
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            const newProduct = await response.json();
            const card = createProductCard(newProduct);
            productList.appendChild(card);

            inputName.value = "";
            inputPrice.value = "";
            inputDescription.value = "";
        } else {
            alert('Error al guardar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});

// Function to generate html card
function createProductCard(product) {
    const li = document.createElement("li");
    li.className = "product_card";
    li.dataset.id = product.id;
    
    li.innerHTML = `
        <h3 class="product_name">${product.name}</h3>
        <h4 class="product_price">$${product.price}</h4>
        <p class="product_description">${product.description}</p>
        <button class="btnActualizar">Actualizar</button>
        <button class="btnEliminar">Eliminar</button>
    `;

    // Add event listeners for buttons
    const btnEliminar = li.querySelector('.btnEliminar');
    const btnActualizar = li.querySelector('.btnActualizar');

    btnEliminar.addEventListener('click', () => deleteProduct(product.id, li));
    btnActualizar.addEventListener('click', () => updateProduct(product.id, li));

    return li;
}

async function deleteProduct(id, cardElement) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            cardElement.remove();
        } else {
            alert('Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

async function updateProduct(id, cardElement) {
    const name = prompt('Nuevo nombre:', cardElement.querySelector('.product_name').textContent);
    if (name === null) return;

    const price = prompt('Nuevo precio:', cardElement.querySelector('.product_price').textContent.replace('$', ''));
    if (price === null) return;

    const description = prompt('Nueva descripción:', cardElement.querySelector('.product_description').textContent);
    if (description === null) return;

    const product = {
        name,
        price: parseFloat(price),
        description
    };

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            // Update the card UI
            cardElement.querySelector('.product_name').textContent = product.name;
            cardElement.querySelector('.product_price').textContent = `$${product.price}`;
            cardElement.querySelector('.product_description').textContent = product.description;
        } else {
            alert('Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}
