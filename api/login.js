require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_seguro_aqui_2024';

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new Database('db/products.db');

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

module.exports = app;
