const productList = document.getElementById("product_list");
const btnAgregarItem = document.getElementById("btnAgregarItem");
const inputName = document.getElementById("inputName");
const inputPrice = document.getElementById("inputPrice");
const inputDescription = document.getElementById("inputDescription");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");

// Token storage
let authToken = localStorage.getItem('authToken');

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateAuthUI();
});

// Update UI based on auth state
function updateAuthUI() {
    if (authToken) {
        loginForm.style.display = 'none';
        logoutBtn.style.display = 'block';
        loginMessage.textContent = 'Sesión activa';
        loginMessage.style.color = 'green';
    } else {
        loginForm.style.display = 'block';
        logoutBtn.style.display = 'none';
        loginMessage.textContent = '';
    }
}

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            loginMessage.textContent = 'Login exitoso!';
            loginMessage.style.color = 'green';
            updateAuthUI();
            
            // Clear form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            loginMessage.textContent = data.error || 'Error en login';
            loginMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        loginMessage.textContent = 'Error al conectar con el servidor';
        loginMessage.style.color = 'red';
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    authToken = null;
    localStorage.removeItem('authToken');
    updateAuthUI();
    loginMessage.textContent = 'Sesión cerrada';
    loginMessage.style.color = 'blue';
});

// Get auth headers for protected requests
function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

// Load products from database on page load
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
            headers: getAuthHeaders(),
            body: JSON.stringify(product)
        });

        if (response.status === 401) {
            alert('Debes iniciar sesión para crear productos');
            return;
        }
        if (response.status === 403) {
            const errorData = await response.json();
            alert(errorData.error || 'No tienes permisos para esta acción');
            return;
        }

        if (response.ok) {
            const newProduct = await response.json();
            const card = createProductCard(newProduct);
            productList.appendChild(card);

            inputName.value = "";
            inputPrice.value = "";
            inputDescription.value = "";
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Error al guardar el producto');
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
    if (!authToken) {
        alert('Debes iniciar sesión para eliminar productos');
        return;
    }

    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            alert('Debes iniciar sesión para eliminar productos');
            return;
        }
        if (response.status === 403) {
            const errorData = await response.json();
            alert(errorData.error || 'No tienes permisos para esta acción');
            return;
        }

        if (response.ok) {
            cardElement.remove();
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

async function updateProduct(id, cardElement) {
    if (!authToken) {
        alert('Debes iniciar sesión para actualizar productos');
        return;
    }

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
            headers: getAuthHeaders(),
            body: JSON.stringify(product)
        });

        if (response.status === 401) {
            alert('Debes iniciar sesión para actualizar productos');
            return;
        }
        if (response.status === 403) {
            const errorData = await response.json();
            alert(errorData.error || 'No tienes permisos para esta acción');
            return;
        }

        if (response.ok) {
            // Update the card UI
            cardElement.querySelector('.product_name').textContent = product.name;
            cardElement.querySelector('.product_price').textContent = `$${product.price}`;
            cardElement.querySelector('.product_description').textContent = product.description;
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}
