// src/server-https.js
//Ejecutar : node src/server-https.js
const http2 = require('http2');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const spdy = require('spdy'); 

dotenv.config();

const PORT = process.env.PORT || 3000;
const USAR_HTTPS = process.env.USAR_HTTPS === 'true';
const USAR_HTTP2 = process.env.USAR_HTTP2 === 'true';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { connectDB } = require('./config/database.js');
connectDB().catch(err => {
    console.error('  Error conectando a MongoDB:', err.message);
});

try {
    app.use('/api/categorias', require('./routes/categoriaRoutes.js'));
    app.use('/api/subcategorias', require('./routes/subcategoriaRoutes.js'));
    app.use('/api/niveles-dificultad', require('./routes/nivelDificultadRoutes.js'));
    app.use('/api/rangos-edad', require('./routes/rangoEdadRoutes.js'));
    app.use('/api/usuarios', require('./routes/usuarioRoutes.js'));
    app.use('/api/roles', require('./routes/rolRoutes.js'));
    app.use('/api/privilegios', require('./routes/privilegioRoutes.js'));
} catch (error) {
    console.error('  Error cargando rutas:', error.message);
    process.exit(1);
}

// Ruta raíz
app.get('/', (req, res) => {
    // Detectar protocolo HTTP/2
    const isHTTP2 = req.httpVersionMajor === 2 || 
                    (req.stream && req.stream.session);
    
    const protocol = isHTTP2 ? 'HTTP/2' : 
                    (req.socket && req.socket.encrypted) ? 'HTTPS (HTTP/1.1)' : 'HTTP/1.1';
    
    res.json({
        message: ' API Cuestionario Pro',
        version: '2.0.0',
        protocol: protocol,
        httpVersion: isHTTP2 ? '2.0' : (req.httpVersion || '1.1'),
        httpVersionMajor: req.httpVersionMajor,
        encrypted: !!(req.socket && req.socket.encrypted),
        http2: isHTTP2,
        spdyVersion: req.spdyVersion || null,
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

app.get('/health', (req, res) => {
    const isHTTP2 = req.httpVersionMajor === 2 || (req.stream && req.stream.session);
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        protocol: isHTTP2 ? 'HTTP/2' : `HTTP/${req.httpVersion || '1.1'}`,
        uptime: process.uptime()
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
    console.error('  Error en petición:', err.message);
    
   
    if (!res.headersSent) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

const iniciarServidor = () => {
    // Servidor HTTP simple
    if (!USAR_HTTPS) {
        app.listen(PORT, () => {
            console.log('\n═══════════════════════════════════════════════════════');
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
            cert: fs.readFileSync(certPathFile)
        };
        
        console.log('✓ Certificados SSL cargados correctamente');
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

    // Servidor HTTPS con HTTP/2 usando SPDY
    if (USAR_HTTP2) {
        try {
            
            const spdyOptions = {
                ...opciones,
                spdy: {
                    protocols: ['h2', 'http/1.1'], 
                    plain: false,
                    ssl: true
                }
            };

            const servidor = spdy.createServer(spdyOptions, app);
            
            servidor.on('error', (err) => {
                console.error('  Error en servidor:', err.message);
            });
            
            servidor.listen(PORT, (err) => {
                if (err) {
                    console.error('  Error al iniciar servidor:', err);
                    process.exit(1);
                }
                
                console.log('\n═══════════════════════════════════════════════════════');
                console.log('      SERVIDOR HTTPS + HTTP/2 INICIADO');
                console.log('═══════════════════════════════════════════════════════');
                console.log(`   Puerto: ${PORT}`);
                console.log(`   URL: https://localhost:${PORT}`);
                console.log(`   Protocolo: HTTP/2 (SPDY)`);
                console.log(`   Fallback: HTTP/1.1`);
                console.log(`   Cifrado:  Activo`);
                console.log(`   Compatible: Express + SPDY`);
                console.log(`   Node.js: ${process.version}`);
                console.log('═══════════════════════════════════════════════════════');
            });
        } catch (error) {
            console.error('\  Error al crear servidor HTTP/2:', error.message);
            console.error('   Stack:', error.stack);
            process.exit(1);
        }
    } 
    // Servidor HTTPS con HTTP/1.1
    else {
        try {
            const servidor = https.createServer(opciones, app);
            
            servidor.on('error', (err) => {
                console.error('  Error en servidor HTTPS:', err.message);
                process.exit(1);
            });
            
            servidor.listen(PORT, () => {
                console.log('\n═══════════════════════════════════════════════════════');
                console.log('      SERVIDOR HTTPS INICIADO');
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
    
});

process.on('uncaughtException', (err) => {
   
    if (err.message.includes('EADDRINUSE') || err.message.includes('EACCES')) {
        console.error('\n  Error crítico:', err.message);
        process.exit(1);
    }
});

try {
    iniciarServidor();
} catch (error) {
    console.error('\n  Error fatal al iniciar servidor:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
}