require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_seguro_aqui_2024';

let db;
let client;

// Connect to MongoDB
async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
    return db;
}

// Initialize DB connection
connectDB().catch(console.error);

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
        const user = await db.collection('users').findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        const validPlainPassword = password === user.password;

        if (!validPassword && !validPlainPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user._id, username: user.username }
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
        const existingUser = await db.collection('users').findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.collection('users').insertOne({
            username,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: { id: result.insertedId, username }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.collection('products').find({}).toArray();
        // Convert _id to id for frontend compatibility
        const productsWithId = products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            price: p.price,
            description: p.description
        }));
        res.json(productsWithId);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create product (admin only)
app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
    const { name, price, description } = req.body;

    if (!name || !price || !description) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const result = await db.collection('products').insertOne({
            name,
            price: parseFloat(price),
            description
        });

        res.status(201).json({
            id: result.insertedId.toString(),
            name,
            price: parseFloat(price),
            description
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    if (!name || !price || !description) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const objectId = new ObjectId(id);
        const result = await db.collection('products').findOneAndUpdate(
            { _id: objectId },
            { $set: { name, price: parseFloat(price), description } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({
            id: result._id.toString(),
            name: result.name,
            price: result.price,
            description: result.description
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const objectId = new ObjectId(id);
        const result = await db.collection('products').deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve static files
app.use(express.static('front'));

// Graceful shutdown
process.on('SIGINT', async () => {
    if (client) {
        await client.close();
    }
    process.exit(0);
});

module.exports = app;
