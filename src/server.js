// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Logging de requests (desarrollo)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

const categoriaRoutes = require('./routes/categoriaRoutes');
const subcategoriaRoutes = require('./routes/subcategoriaRoutes');
const nivelDificultadRoutes = require('./routes/nivelDificultadRoutes');
const rangoEdadRoutes = require('./routes/rangoEdadRoutes');


app.use('/api/categorias', categoriaRoutes);
app.use('/api/subcategorias', subcategoriaRoutes);
app.use('/api/niveles-dificultad', nivelDificultadRoutes);
app.use('/api/rangos-edad', rangoEdadRoutes);


app.get('/api', (req, res) => {
    res.json({
        message: 'API de Cuestionarios - Sistema Educativo',
        version: '1.0.0',
        tablas_base: {
            '1': 'Categorías',
            '2': 'Subcategorías',
            '3': 'Niveles de Dificultad',
            '4': 'Rangos de Edad'
        },
        endpoints: {
            categorias: '/api/categorias',
            subcategorias: '/api/subcategorias',
            niveles_dificultad: '/api/niveles-dificultad',
            rangos_edad: '/api/rangos-edad'
        },
        documentation: 'Para más información, consulta el README.md'
    });
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('  ERROR: MONGODB_URI no está definido en el archivo .env');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('  Conectado exitosamente a MongoDB Atlas');
        console.log('  Base de datos:', mongoose.connection.name);
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`  Servidor corriendo en http://localhost:${PORT}`);
            console.log(`  API disponible en http://localhost:${PORT}/api`);
            console.log(`\n  Endpoints de las 4 tablas base:`);
            console.log(`   1. GET/POST    /api/categorias`);
            console.log(`   2. GET/POST    /api/subcategorias`);
            console.log(`   3. GET/POST    /api/niveles-dificultad`);
            console.log(`   4. GET/POST    /api/rangos-edad`);
            console.log(`\n  Presiona CTRL+C para detener el servidor\n`);
        });
    })
    .catch((error) => {
        console.error(' Error de conexión a MongoDB:', error.message);
        process.exit(1);
    });


process.on('SIGINT', async () => {
    console.log('\n\n  Cerrando servidor...');
    await mongoose.connection.close();
    console.log(' Conexión a MongoDB cerrada');
    process.exit(0);
});

module.exports = app;