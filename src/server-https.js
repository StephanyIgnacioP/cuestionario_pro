// src/server-https.js
const http2 = require('http2');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});


mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log(' MongoDB conectado'))
    .catch(err => console.error(' Error MongoDB:', err.message));


const categoriaRoutes = require('./routes/categoriaRoutes');
const subcategoriaRoutes = require('./routes/subcategoriaRoutes');
const nivelDificultadRoutes = require('./routes/nivelDificultadRoutes');
const rangoEdadRoutes = require('./routes/rangoEdadRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const privilegioRoutes = require('./routes/privilegioRoutes');


app.use('/api/categorias', categoriaRoutes);
app.use('/api/subcategorias', subcategoriaRoutes);
app.use('/api/niveles-dificultad', nivelDificultadRoutes);
app.use('/api/rangos-edad', rangoEdadRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/privilegios', privilegioRoutes);


app.get('/', (req, res) => {
    res.json({
        message: ' API Cuestionario Pro - HTTPS + HTTP/2',
        version: '2.0.0',
        protocol: req.httpVersion === '2.0' ? 'HTTP/2' : 'HTTPS',
        endpoints: {
            categorias: '/api/categorias',
            subcategorias: '/api/subcategorias',
            niveles_dificultad: '/api/niveles-dificultad',
            rangos_edad: '/api/rangos-edad',
            usuarios: '/api/usuarios',
            roles: '/api/roles',
            privilegios: '/api/privilegios'
        }
    });
});


app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Configuración
const PORT = process.env.PORT || 3000;
const USAR_HTTPS = process.env.USAR_HTTPS === 'true';
const USAR_HTTP2 = process.env.USAR_HTTP2 === 'true';

// Iniciar servidor
if (!USAR_HTTPS) {
    
    app.listen(PORT, () => {
        console.log(`\n Servidor HTTP en http://localhost:${PORT}\n`);
    });
} else {
    
    const certPath = path.join(__dirname, 'certs');
    
    try {
        const opciones = {
            key: fs.readFileSync(path.join(certPath, 'key.pem')),
            cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
            allowHTTP1: true
        };

        if (USAR_HTTP2) {
            
            const servidor = http2.createSecureServer(opciones, app);
            servidor.listen(PORT, () => {
                console.log('\n═══════════════════════════════════════════════════════');
                console.log('    SERVIDOR HTTPS + HTTP/2 INICIADO');
                console.log('═══════════════════════════════════════════════════════');
                console.log(`   Puerto: ${PORT}`);
                console.log(`   URL: https://localhost:${PORT}`);
                console.log(`   Protocolo: HTTP/2 sobre TLS`);
                console.log(`   Cifrado:  Activo`);
                console.log('═══════════════════════════════════════════════════════\n');
            });
        } else {
            // Solo HTTPS
            const servidor = https.createServer(opciones, app);
            servidor.listen(PORT, () => {
                console.log(`\n Servidor HTTPS en https://localhost:${PORT}\n`);
            });
        }
    } catch (error) {
        console.error(' Error cargando certificados:', error.message);
        console.log(' Ejecuta: node src/scripts/generar-certificados.js\n');
        process.exit(1);
    }
}