require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function seed() {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://diegocouto217:rlvi2iOItVwTH1@cluster0.yml35wa.mongodb.net/?appName=Cluster0';
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // Clear existing data
        await db.collection('products').deleteMany({});
        await db.collection('users').deleteMany({});
        console.log('Cleared existing data');
        
        // Seed products from db/write.sql
        const products = [
            {
                name: 'Biblia de Linux',
                price: 1000,
                description: 'La Arch Wiki en versión impresa. Viene con pasta dura y una foto de Linus Torvals en la parte de atrás.'
            },
            {
                name: 'Playera de Archlinux XXL',
                price: 500,
                description: 'Vestimenta típica de la tribu de linux. Duplica la masa corporal del usuario a lo largo de la primera semana de uso.'
            }
        ];
        
        await db.collection('products').insertMany(products);
        console.log('Inserted products');
        
        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        await db.collection('users').insertOne({
            username: 'admin',
            password: hashedPassword
        });
        console.log('Created admin user (username: admin, password: admin123)');
        
        console.log('\n✅ Seed completed successfully!');
        console.log('\n📝 Environment variables needed:');
        console.log('   - MONGODB_URI: Your MongoDB Atlas connection string');
        console.log('   - JWT_SECRET: Your JWT secret key');
        
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

seed();
