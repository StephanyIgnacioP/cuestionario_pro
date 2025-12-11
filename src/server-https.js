// src/server-https.js

const http2 = require('http2');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();


const PORT = process.env.PORT || 3000;
const USAR_HTTPS = process.env.USAR_HTTPS === 'true';
const USAR_HTTP2 = process.env.USAR_HTTP2 === 'true';


let app;

if (USAR_HTTPS && USAR_HTTP2) {

    const http2Express = require('http2-express-bridge');
    const expressModule = require('express');
    app = http2Express(expressModule);
} else {
    
    const express = require('express');
    app = express();
}

// Middlewares
app.use(cors());
app.use(require('express').json());
app.use(require('express').urlencoded({ extended: true }));

// Conectar a MongoDB
const { connectDB } = require('./config/database.js');
connectDB().catch(err => {
    console.error('  Error conectando a MongoDB:', err.message);
});

// Importar y registrar rutas
try {
    app.use('/api/categorias', require('./routes/categoriaRoutes.js'));
    app.use('/api/subcategorias', require('./routes/subcategoriaRoutes.js'));
    app.use('/api/niveles-dificultad', require('./routes/nivelDificultadRoutes.js'));
    app.use('/api/rangos-edad', require('./routes/rangoEdadRoutes.js'));
    app.use('/api/usuarios', require('./routes/usuarioRoutes.js'));
    app.use('/api/roles', require('./routes/rolRoutes.js'));
    app.use('/api/privilegios', require('./routes/privilegioRoutes.js'));
} catch (error) {
    console.error(' Error cargando rutas:', error.message);
    process.exit(1);
}

// Ruta raíz
app.get('/', (req, res) => {
    const protocol = req.httpVersion === '2.0' ? 'HTTP/2' : 
                    req.socket.encrypted ? 'HTTPS (HTTP/1.1)' : 'HTTP/1.1';
    
    res.json({
        message: '  API Cuestionario Pro',
        version: '2.0.0',
        protocol: protocol,
        httpVersion: req.httpVersion,
        encrypted: req.socket.encrypted || false,
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

// Ruta de salud del servidor
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        protocol: req.httpVersion 
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(' Error en petición:', err.message);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const iniciarServidor = () => {
    // Servidor HTTP simple
    if (!USAR_HTTPS) {
        app.listen(PORT, () => {
            console.log('\n═══════════════════════════════════════════════════════');
            console.log('     SERVIDOR HTTP INICIADO');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`   Puerto: ${PORT}`);
            console.log(`   URL: http://localhost:${PORT}`);
            console.log(`   Protocolo: HTTP/1.1`);
            console.log('═══════════════════════════════════════════════════════\n');
        });
        return;
    }

    // Cargar certificados SSL
    const certPath = path.join(__dirname, 'certs');
    let opciones;

    try {
        const keyPath = path.join(certPath, 'key.pem');
        const certPathFile = path.join(certPath, 'cert.pem');
        
        if (!fs.existsSync(keyPath) || !fs.existsSync(certPathFile)) {
            throw new Error('Archivos de certificados no encontrados');
        }

        opciones = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPathFile),
            allowHTTP1: true
        };
        
        console.log(' Certificados SSL cargados correctamente');
    } catch (error) {
        console.error('\n Error al cargar certificados SSL');
        console.error(`   Detalles: ${error.message}`);
        console.log('\n Solución:');
        console.log('   1. Ejecuta: npm run generate:certs');
        console.log('   2. Verifica que existan los archivos:');
        console.log(`      - ${path.join(certPath, 'key.pem')}`);
        console.log(`      - ${path.join(certPath, 'cert.pem')}\n`);
        process.exit(1);
    }

    // Servidor HTTPS con HTTP/2
    if (USAR_HTTP2) {
        try {
            const servidor = http2.createSecureServer(opciones, app);
            
            servidor.on('error', (err) => {
                console.error(' Error en servidor HTTP/2:', err.message);
                process.exit(1);
            });
            
            servidor.listen(PORT, () => {
                console.log('\n═══════════════════════════════════════════════════════');
                console.log('    SERVIDOR HTTPS + HTTP/2 INICIADO');
                console.log('═══════════════════════════════════════════════════════');
                console.log(`   Puerto: ${PORT}`);
                console.log(`   URL: https://localhost:${PORT}`);
                console.log(`   Protocolo: HTTP/2 sobre TLS`);
                console.log(`   Fallback: HTTP/1.1 (allowHTTP1: true)`);
                console.log(`   Cifrado:  Activo`);
                console.log(`   Bridge: http2-express-bridge@1.0.7`);
                console.log('═══════════════════════════════════════════════════════');
                console.log('\n  Advertencia: Certificados auto-firmados');
                console.log('   El navegador mostrará advertencia de seguridad');
                console.log('   Esto es normal en desarrollo local\n');
            });
        } catch (error) {
            console.error('\n Error al crear servidor HTTP/2:', error.message);
            console.error('   Stack:', error.stack);
            process.exit(1);
        }
    } 
    // Servidor HTTPS con HTTP/1.1
    else {
        try {
            const servidor = https.createServer(opciones, app);
            
            servidor.on('error', (err) => {
                console.error(' Error en servidor HTTPS:', err.message);
                process.exit(1);
            });
            
            servidor.listen(PORT, () => {
                console.log('\n═══════════════════════════════════════════════════════');
                console.log('    SERVIDOR HTTPS INICIADO');
                console.log('═══════════════════════════════════════════════════════');
                console.log(`   Puerto: ${PORT}`);
                console.log(`   URL: https://localhost:${PORT}`);
                console.log(`   Protocolo: HTTPS (HTTP/1.1)`);
                console.log(`   Cifrado:  Activo`);
                console.log('═══════════════════════════════════════════════════════\n');
            });
        } catch (error) {
            console.error('\n Error al crear servidor HTTPS:', error.message);
            console.error('   Stack:', error.stack);
            process.exit(1);
        }
    }
};

process.on('unhandledRejection', (err) => {
    console.error('\n Error no manejado (unhandledRejection):', err.message);
    console.error('   Stack:', err.stack);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('\n Excepción no capturada (uncaughtException):', err.message);
    console.error('   Stack:', err.stack);
    process.exit(1);
});


try {
    iniciarServidor();
} catch (error) {
    console.error('\n Error fatal al iniciar servidor:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
}