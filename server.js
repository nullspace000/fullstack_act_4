const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('front'));

// Connect to SQLite database
const db = new Database('db/products.db');

// GET - Obtener todos los productos
app.get('/api/products', (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY id').all();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Crear nuevo producto
app.post('/api/products', (req, res) => {
    const { name, price, description } = req.body;
    
    if (!name || !price || !description) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const stmt = db.prepare('INSERT INTO products (name, price, description) VALUES (?, ?, ?)');
        const result = stmt.run(name, parseFloat(price), description);
        
        const newProduct = {
            id: result.lastInsertRowid,
            name,
            price: parseFloat(price),
            description
        };
        
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Actualizar producto
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    if (!name || !price || !description) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const stmt = db.prepare('UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?');
        const result = stmt.run(name, parseFloat(price), description, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ id: parseInt(id), name, price: parseFloat(price), description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Eliminar producto
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
