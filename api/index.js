require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Setup SQLite
const Database = require('better-sqlite3');
const db = new Database(path.join(process.cwd(), 'db/products.db'));

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_seguro_aqui_2024';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.username === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Solo el usuario admin puede realizar esta acción' });
    }
};

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username y contraseña son requeridos' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username);

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        const validPlainPassword = password === user.password;
        
        if (!validPassword && !validPlainPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username y contraseña son requeridos' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        const checkStmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const existingUser = checkStmt.get(username);
        
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertStmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        const result = insertStmt.run(username, hashedPassword);

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: { id: result.lastInsertRowid, username }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all products
app.get('/api/products', (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY id').all();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create product (admin only)
app.post('/api/products', authenticateToken, isAdmin, (req, res) => {
    const { name, price, description } = req.body;
    
    if (!name || !price || !description) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const stmt = db.prepare('INSERT INTO products (name, price, description) VALUES (?, ?, ?)');
        const result = stmt.run(name, parseFloat(price), description);
        
        res.status(201).json({
            id: result.lastInsertRowid,
            name,
            price: parseFloat(price),
            description
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, isAdmin, (req, res) => {
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

// Delete product (admin only)
app.delete('/api/products/:id', authenticateToken, isAdmin, (req, res) => {
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

// Serve static files
app.use(express.static('front'));

module.exports = app;
