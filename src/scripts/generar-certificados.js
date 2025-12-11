// scripts/generar-certificados.js
const forge = require('node-forge');
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

        console.log(' Generando certificados SSL...\n');
        console.log('    Generando par de claves RSA 2048 bits...');
        const keys = forge.pki.rsa.generateKeyPair(2048);
        console.log('    Claves generadas\n');

        console.log('    Creando certificado X.509...');
        const cert = forge.pki.createCertificate();
        
        cert.publicKey = keys.publicKey;
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

        const attrs = [
            { name: 'commonName', value: 'localhost' },
            { name: 'countryName', value: 'BO' },
            { shortName: 'ST', value: 'Cochabamba' },
            { name: 'localityName', value: 'Cochabamba' },
            { name: 'organizationName', value: 'Cuestionario Pro' },
            { shortName: 'OU', value: 'Development' }
        ];

        cert.setSubject(attrs);
        cert.setIssuer(attrs);

        cert.setExtensions([
            { name: 'basicConstraints', cA: true },
            { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
            { name: 'extKeyUsage', serverAuth: true, clientAuth: true, codeSigning: true, emailProtection: true, timeStamping: true },
            { name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }] }
        ]);

        cert.sign(keys.privateKey, forge.md.sha256.create());
        console.log('    Certificado creado y firmado\n');

        const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
        const pemCert = forge.pki.certificateToPem(cert);

        const keyPath = path.join(certsDir, 'key.pem');
        const certPath = path.join(certsDir, 'cert.pem');

        fs.writeFileSync(keyPath, pemKey);
        fs.writeFileSync(certPath, pemCert);

        console.log(' Certificados generados exitosamente\n');
        console.log(' Archivos creados:');
        console.log('   • certs/key.pem  (Clave privada)');
        console.log('   • certs/cert.pem (Certificado público)\n');
     
    } catch (error) {
        console.error('\n Error:', error.message);
        console.log('\n Instala la dependencia: npm install node-forge\n');
        process.exit(1);
    }
};

generarCertificados();