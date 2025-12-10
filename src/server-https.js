// src/server-https.js

const http2 = require('http2');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Importar rutas
const categoriaRoutes = require('./routes/categoriaRoutes');
const subcategoriaRoutes = require('./routes/subcategoriaRoutes');
const nivelDificultadRoutes = require('./routes/nivelDificultadRoutes');
const rangoEdadRoutes = require('./routes/rangoEdadRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const privilegioRoutes = require('./routes/privilegioRoutes');

// Rutas de la API
app.use('/api/categorias', categoriaRoutes);
app.use('/api/subcategorias', subcategoriaRoutes);
app.use('/api/niveles-dificultad', nivelDificultadRoutes);
app.use('/api/rangos-edad', rangoEdadRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/privilegios', privilegioRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '  API Cuestionario Pro',
        version: '2.0.0',
        protocol: req.protocol === 'https' ? 'HTTPS' : 'HTTP',
        http2: req.httpVersion === '2.0',
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
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const USAR_HTTPS = process.env.USAR_HTTPS === 'true';
const USAR_HTTP2 = process.env.USAR_HTTP2 === 'true';

// Función para iniciar el servidor
const iniciarServidor = () => {
    // Servidor HTTP simple (desarrollo básico)
    if (!USAR_HTTPS) {
        app.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════════');
            console.log('      SERVIDOR HTTP INICIADO');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`   Puerto: ${PORT}`);
            console.log(`   URL: http://localhost:${PORT}`);
            console.log(`   Protocolo: HTTP/1.1`);
            console.log('═══════════════════════════════════════════════════════\n');
        });
        return;
    }

    // Cargar certificados SSL
    const certPath = path.join(__dirname, '..', 'certs');
    let opciones;

    try {
        opciones = {
            key: fs.readFileSync(path.join(certPath, 'key.pem')),
            cert: fs.readFileSync(path.join(certPath, 'cert.pem'))
        };
    } catch (error) {
        console.error(' Error: No se encontraron los certificados SSL');
        console.log('\n Solución:');
        console.log('   1. Ejecuta: node scripts/generar-certificados.js');
        console.log('   2. O coloca tus certificados en la carpeta "certs/"\n');
        process.exit(1);
    }

    // Servidor HTTPS con HTTP/2
    if (USAR_HTTP2) {
        const servidor = http2.createSecureServer(opciones, app);
        
        servidor.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════════');
            console.log('     SERVIDOR HTTPS + HTTP/2 INICIADO');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`   Puerto: ${PORT}`);
            console.log(`   URL: https://localhost:${PORT}`);
            console.log(`   Protocolo: HTTP/2 sobre TLS`);
            console.log(`   Cifrado:  Activo`);
            console.log('═══════════════════════════════════════════════════════\n');
            console.log('   Advertencia: Certificados auto-firmados');
            console.log('   El navegador mostrará advertencia de seguridad\n');
        });
    } 
    // Servidor HTTPS con HTTP/1.1
    else {
        const servidor = https.createServer(opciones, app);
        
        servidor.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════════');
            console.log('    SERVIDOR HTTPS INICIADO');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`   Puerto: ${PORT}`);
            console.log(`   URL: https://localhost:${PORT}`);
            console.log(`   Protocolo: HTTPS (HTTP/1.1)`);
            console.log(`   Cifrado:  Activo`);
            console.log('═══════════════════════════════════════════════════════\n');
        });
    }
};

iniciarServidor();

process.on('unhandledRejection', (err) => {
    console.error(' Error no manejado:', err.message);
    process.exit(1);
});
