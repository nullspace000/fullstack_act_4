require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('front'));

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_seguro_aqui_2024';

// Connect to SQLite database
const db = new Database('db/products.db');

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

// POST /api/login - User login
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

        // Check if password is hashed or plain text
        const validPassword = await bcrypt.compare(password, user.password);
        
        // Also support plain text passwords for existing users
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

// POST /api/register - Register new user (optional, for testing)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username y contraseña son requeridos' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        // Check if user exists
        const checkStmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const existingUser = checkStmt.get(username);
        
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
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

// GET - Obtener todos los productos (público)
app.get('/api/products', (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY id').all();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Crear nuevo producto (solo admin)
app.post('/api/products', authenticateToken, isAdmin, (req, res) => {
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

// PUT - Actualizar producto (solo admin)
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

// DELETE - Eliminar producto (solo admin)
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

// Start server
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
