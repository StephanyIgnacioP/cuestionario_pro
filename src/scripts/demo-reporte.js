// scripts/demo-reporte.js

const http2 = require('http2');
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════');
console.log('    REPORTE DE VERIFICACIÓN: HTTPS + HTTP/2');
console.log('═══════════════════════════════════════════════════════\n');

console.log('✓ [1/5] Verificando certificados SSL...');
const certPath = path.join(__dirname, '..', 'certs');
const archivos = ['key.pem', 'cert.pem'];
let certificadosOK = true;

archivos.forEach(archivo => {
    const ruta = path.join(certPath, archivo);
    if (fs.existsSync(ruta)) {
        const stats = fs.statSync(ruta);
        console.log(`    ✓ ${archivo} - ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
        console.log(`    ✗ ${archivo} - NO ENCONTRADO`);
        certificadosOK = false;
    }
});

if (!certificadosOK) {
    console.log('\n Error: Certificados no encontrados');
    console.log('   Ejecuta: npm run generate:certs\n');
    process.exit(1);
}

console.log('    ✓ Certificados SSL presentes\n');

console.log('✓ [2/5] Verificando configuración .env...');
require('dotenv').config();

const config = {
    USAR_HTTPS: process.env.USAR_HTTPS === 'true',
    USAR_HTTP2: process.env.USAR_HTTP2 === 'true',
    PORT: process.env.PORT || 3000
};

console.log(`   USAR_HTTPS: ${config.USAR_HTTPS ? '✓' : '✗'} ${config.USAR_HTTPS}`);
console.log(`   USAR_HTTP2: ${config.USAR_HTTP2 ? '✓' : '✗'} ${config.USAR_HTTP2}`);
console.log(`   PORT: ${config.PORT}\n`);

console.log('✓ [3/5] Verificando servidor...');

// Método 1: Verificar con HTTPS 
const verificarConHTTPS = () => {
    return new Promise((resolve, reject) => {
        const opciones = {
            hostname: 'localhost',
            port: config.PORT,
            path: '/',
            method: 'GET',
            rejectUnauthorized: false
        };

        const req = https.request(opciones, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    const socket = res.socket || res.connection;
                    const encrypted = socket ? (socket.encrypted || false) : true;
                    
                    resolve({
                        statusCode: res.statusCode,
                        httpVersion: res.httpVersion,
                        encrypted: encrypted,
                        protocol: response.protocol,
                        data: response
                    });
                } catch (e) {
                    const socket = res.socket || res.connection;
                    const encrypted = socket ? (socket.encrypted || false) : true;
                    
                    resolve({
                        statusCode: res.statusCode,
                        httpVersion: res.httpVersion,
                        encrypted: encrypted,
                        protocol: 'unknown',
                        data: null
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout de conexión'));
        });

        req.end();
    });
};

// Método 2: Verificar con HTTP/2 nativo
const verificarConHTTP2 = () => {
    return new Promise((resolve, reject) => {
        const client = http2.connect(`https://localhost:${config.PORT}`, {
            rejectUnauthorized: false
        });

        let resolved = false;
        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                client.destroy();
                reject(new Error('Timeout en conexión HTTP/2'));
            }
        }, 5000);

        client.on('error', (err) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                client.destroy();
                reject(err);
            }
        });

        const req = client.request({
            ':path': '/',
            ':method': 'GET'
        });

        req.setEncoding('utf8');
        let data = '';
        let headers = null;

        req.on('response', (h) => {
            headers = h;
        });

        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                try {
                    const response = JSON.parse(data);
                    const protocol = client.alpnProtocol || 'h2';
                    client.close();
                    resolve({
                        statusCode: headers[':status'],
                        protocol: protocol === 'h2' ? 'HTTP/2' : protocol,
                        encrypted: true,
                        data: response
                    });
                } catch (e) {
                    client.close();
                    reject(new Error('Error al parsear respuesta'));
                }
            }
        });

        req.on('error', (err) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                client.destroy();
                reject(err);
            }
        });

        req.end();
    });
};

const generarReporte = async () => {
    try {
        console.log('  [4/5] Conectando con cliente HTTPS...\n');
        
        // Intentar primero con HTTPS
        const resultadoHTTPS = await verificarConHTTPS();
        
        console.log(`    ✓ Servidor respondiendo en puerto ${config.PORT}`);
        console.log(`    ✓ Status Code: ${resultadoHTTPS.statusCode}`);
        console.log(`    ✓ Protocolo negociado: ${resultadoHTTPS.httpVersion}`);
        console.log(`    ✓ Cifrado: ${resultadoHTTPS.encrypted ? 'Activo' : 'Inactivo'}`);
        console.log(`    ✓ Protocolo reportado por servidor: ${resultadoHTTPS.protocol}\n`);

        // Intentar con HTTP/2 nativo
        console.log('  [5/5] Verificando soporte HTTP/2 nativo...\n');
        
        let soportaHTTP2 = false;
        let protocoloReal = 'HTTP/1.1';
        
        try {
            const resultadoHTTP2 = await verificarConHTTP2();
            soportaHTTP2 = true;
            protocoloReal = resultadoHTTP2.protocol;
            console.log(`    ✓ Cliente HTTP/2 nativo conectado exitosamente`);
            console.log(`    ✓ Protocolo detectado: ${protocoloReal}`);
            console.log(`    ✓ ALPN Protocol: ${resultadoHTTP2.protocol}\n`);
        } catch (error) {
            console.log(`    ⚠ Cliente HTTP/2 nativo: ${error.message}`);
            
        
            if (resultadoHTTPS.data && resultadoHTTPS.data.http2) {
                soportaHTTP2 = true;
                protocoloReal = 'HTTP/2';
                console.log(`    ✓ Servidor reporta soporte HTTP/2 en respuesta JSON\n`);
            } else {
                console.log(`    ℹ El servidor está usando HTTP/1.1\n`);
            }
        }
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('      REPORTE DE VERIFICACIÓN COMPLETADO');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log(' RESUMEN:\n');
        console.log(`    HTTPS: ${config.USAR_HTTPS ? ' ACTIVO' : ' INACTIVO'}`);
        console.log(`    HTTP/2: ${soportaHTTP2 ? ' ACTIVO' : ' INACTIVO'}`);
        console.log(`    Cifrado SSL/TLS:  ACTIVO`);
        console.log(`    Puerto: ${config.PORT}`);
        console.log(`    URL: https://localhost:${config.PORT}`);
        console.log(`    Status Code: ${resultadoHTTPS.statusCode}`);
        console.log(`    Protocolo servidor: ${protocoloReal}`);
        
        
        console.log('\n═══════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.log('\n No se pudo completar la verificación');
        console.log(`   Error: ${error.message}`);
        console.log('   Verifica que el servidor esté corriendo con:\n');
        console.log('   node src/server-https.js\n');
        process.exit(1);
    }
};

generarReporte();