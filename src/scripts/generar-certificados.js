// scripts/generar-certificados.js


const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const generarCertificados = () => {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('   GENERACIÓN DE CERTIFICADOS SSL (DESARROLLO)');
        console.log('═══════════════════════════════════════════════════════\n');

        
        const certsDir = path.join(__dirname, '..', 'certs');
        if (!fs.existsSync(certsDir)) {
            fs.mkdirSync(certsDir);
            console.log(' Carpeta "certs" creada\n');
        }

        console.log('  Generando certificados SSL...');
        console.log('   (Esto puede tardar unos segundos)\n');

        
        const comando = `openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/C=BO/ST=Cochabamba/L=Cochabamba/O=Cuestionario Pro/CN=localhost"`;

        execSync(comando, { stdio: 'inherit' });

        console.log('\n Certificados generados exitosamente\n');
        console.log(' Archivos creados:');
        console.log('   • certs/key.pem  (Clave privada)');
        console.log('   • certs/cert.pem (Certificado público)\n');


    } catch (error) {
        console.error('\n Error:', error.message);
        process.exit(1);
    }
};

generarCertificados();