const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock database for testing
let mockProducts = [
    { id: 1, name: 'Producto 1', price: 100, description: 'Descripción 1' },
    { id: 2, name: 'Producto 2', price: 200, description: 'Descripción 2' }
];

let productIdCounter = 3;

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_seguro_aqui_2024';

// Generate test tokens
const adminToken = jwt.sign({ id: 1, username: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
const userToken = jwt.sign({ id: 2, username: 'user' }, JWT_SECRET, { expiresIn: '1h' });

describe('API Products', () => {
    describe('GET /api/products', () => {
        it('should return all products without authentication', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/products');
            
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should return products with correct structure', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/products');
            
            expect(response.status).toBe(200);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('price');
            expect(response.body[0]).toHaveProperty('description');
        });
    });

    describe('POST /api/products', () => {
        it('should require authentication', async () => {
            const newProduct = { name: 'Test', price: 100, description: 'Test desc' };
            
            const response = await request('http://localhost:3000')
                .post('/api/products')
                .send(newProduct);
            
            expect(response.status).toBe(401);
            expect(response.body.error).toContain('Token');
        });

        it('should require admin role', async () => {
            const newProduct = { name: 'Test', price: 100, description: 'Test desc' };
            
            const response = await request('http://localhost:3000')
                .post('/api/products')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newProduct);
            
            expect(response.status).toBe(403);
            expect(response.body.error).toContain('admin');
        });

        it('should create product with valid admin token', async () => {
            const newProduct = { name: 'Nuevo Producto', price: 500, description: 'Descripción nueva' };
            
            const response = await request('http://localhost:3000')
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newProduct);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Nuevo Producto');
            expect(response.body.price).toBe(500);
        });

        it('should validate required fields', async () => {
            const invalidProduct = { name: 'Test' };
            
            const response = await request('http://localhost:3000')
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidProduct);
            
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('campos');
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should require admin role', async () => {
            const updatedProduct = { name: 'Updated', price: 300, description: 'Updated desc' };
            
            const response = await request('http://localhost:3000')
                .put('/api/products/1')
                .set('Authorization', `Bearer ${userToken}`)
                .send(updatedProduct);
            
            expect(response.status).toBe(403);
        });

        it('should update product with admin token', async () => {
            const updatedProduct = { name: 'Producto Actualizado', price: 350, description: 'Nueva descripción' };
            
            const response = await request('http://localhost:3000')
                .put('/api/products/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatedProduct);
            
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Producto Actualizado');
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should require admin role', async () => {
            const response = await request('http://localhost:3000')
                .delete('/api/products/1')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(403);
        });

        it('should delete product with admin token', async () => {
            const response = await request('http://localhost:3000')
                .delete('/api/products/1')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
        });
    });
});

describe('API Auth', () => {
    describe('POST /api/login', () => {
        it('should return error for invalid credentials', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/login')
                .send({ username: 'invalid', password: 'wrong' });
            
            expect(response.status).toBe(401);
        });

        it('should return error for missing fields', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/login')
                .send({ username: 'admin' });
            
            expect(response.status).toBe(400);
        });

        it('should return token for valid credentials', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/login')
                .send({ username: 'admin', password: 'admin123' });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.username).toBe('admin');
        });
    });

    describe('POST /api/register', () => {
        it('should register new user', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/register')
                .send({ username: 'newuser', password: 'password123' });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.username).toBe('newuser');
        });

        it('should reject duplicate users', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/register')
                .send({ username: 'admin', password: 'password123' });
            
            expect(response.status).toBe(400);
        });

        it('should require minimum password length', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/register')
                .send({ username: 'testuser', password: '123' });
            
            expect(response.status).toBe(400);
        });
    });
});
