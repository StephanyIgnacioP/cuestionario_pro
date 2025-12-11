// scripts/demo-reporte.js

const https = require('https');
const http2 = require('http2');
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════');
console.log('    REPORTE DE VERIFICACIÓN: HTTPS + HTTP/2');
console.log('═══════════════════════════════════════════════════════\n');


console.log(' [1/5] Verificando certificados SSL...');
const certPath = path.join(__dirname, '..', 'certs');
const archivos = ['key.pem', 'cert.pem'];
let certificadosOK = true;

archivos.forEach(archivo => {
    const ruta = path.join(certPath, archivo);
    if (fs.existsSync(ruta)) {
        const stats = fs.statSync(ruta);
        console.log(`    ${archivo} - ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
        console.log(`    ${archivo} - NO ENCONTRADO`);
        certificadosOK = false;
    }
});

if (!certificadosOK) {
    console.log('\n Error: Certificados no encontrados');
    console.log('   Ejecuta: npm run generate:certs\n');
    process.exit(1);
}

console.log('    Certificados SSL presentes\n');


console.log(' [2/5] Verificando configuración .env...');
require('dotenv').config();

const config = {
    USAR_HTTPS: process.env.USAR_HTTPS === 'true',
    USAR_HTTP2: process.env.USAR_HTTP2 === 'true',
    PORT: process.env.PORT || 3000
};

console.log(`   USAR_HTTPS: ${config.USAR_HTTPS ? ' ' : ' '} ${config.USAR_HTTPS}`);
console.log(`   USAR_HTTP2: ${config.USAR_HTTP2 ? ' ' : ' '} ${config.USAR_HTTP2}`);
console.log(`   PORT: ${config.PORT}\n`);


console.log(' [3/5] Verificando servidor...');
const opciones = {
    hostname: 'localhost',
    port: config.PORT,
    path: '/',
    method: 'GET',
    rejectUnauthorized: false 
};

const verificarServidor = () => {
    return new Promise((resolve, reject) => {
        const req = https.request(opciones, (res) => {
            console.log(`    Servidor respondiendo en puerto ${config.PORT}`);
            console.log(`    Status Code: ${res.statusCode}`);
            console.log(`    Protocolo: ${res.httpVersion === '2.0' ? 'HTTP/2' : 'HTTP/1.1'}`);
            console.log(`    Cifrado: ${res.connection.encrypted ? 'Activo' : 'Inactivo'}\n`);
            resolve(res.httpVersion);
        });

        req.on('error', (err) => {
            console.log(`    Error: ${err.message}`);
            reject(err);
        });

        req.end();
    });
};


const generarReporte = async () => {
    try {
        const httpVersion = await verificarServidor();
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('    REPORTE DE VERIFICACIÓN COMPLETADO');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log(' RESUMEN:\n');
        console.log(`    HTTPS: ${config.USAR_HTTPS ? ' ACTIVO' : ' INACTIVO'}`);
        console.log(`    HTTP/2: ${httpVersion === '2.0' ? ' ACTIVO' : ' INACTIVO'}`);
        console.log(`    Cifrado SSL/TLS:  ACTIVO`);
        console.log(`    Puerto: ${config.PORT}`);
        console.log(`    URL: https://localhost:${config.PORT}`);
        
        console.log('\n═══════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.log('\n No se pudo completar la verificación');
        console.log('   Verifica que el servidor esté corriendo\n');
        process.exit(1);
    }
};


console.log(' [4/5] Conectando al servidor...\n');
generarReporte();