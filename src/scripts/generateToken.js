
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Usuario = require('../models/Usuario');

const generarToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario._id,
            email: usuario.email,
            roles: usuario.roles
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '24h'
        }
    );
};

const main = async () => {
    try {

        console.log(' Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' Conectado a MongoDB\n');
        
        const email = process.argv[2];
        
        if (!email) {
            console.log(' Error: Debes proporcionar un email de usuario\n');
            console.log('Uso: node src/scripts/generateToken.js [email]\n');
            console.log('Ejemplo: node src/scripts/generateToken.js admin@example.com\n');
            process.exit(1);
        }

        console.log(` Buscando usuario: ${email}`);
        const usuario = await Usuario.findOne({ email: email.toLowerCase() })
            .populate('roles', 'nombre_rol');
        
        if (!usuario) {
            console.log(` Usuario no encontrado: ${email}\n`);
            console.log('Usuarios disponibles:');
            const usuarios = await Usuario.find().select('nombre apellido email');
            usuarios.forEach(u => {
                console.log(`  - ${u.email} (${u.nombre} ${u.apellido})`);
            });
            process.exit(1);
        }

        if (usuario.estado !== 'activo') {
            console.log(`  Advertencia: El usuario está ${usuario.estado}\n`);
        }

        const token = generarToken(usuario);

        const roles = usuario.roles.map(r => r.nombre_rol).join(', ');
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log(' TOKEN JWT GENERADO EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log(' Usuario:');
        console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
        console.log(`   Email: ${usuario.email}`);
        console.log(`   Roles: ${roles || 'Sin roles asignados'}`);
        console.log(`   Estado: ${usuario.estado}\n`);
        
        console.log(' Token JWT:');
        console.log(`   ${token}\n`);
        
        console.log(' Expiración:');
        console.log(`   ${process.env.JWT_EXPIRE || '24h'}\n`);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('  CÓMO USAR EL TOKEN');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('En Postman/Thunder Client:');
        console.log('1. Ve a la pestaña "Authorization"');
        console.log('2. Tipo: Bearer Token');
        console.log('3. Pega el token arriba\n');
        
        console.log('Con curl:');
        console.log(`curl http://localhost:3000/api/RUTA \\`);
        console.log(`  -H "Authorization: Bearer ${token.substring(0, 30)}..."\n`);
        
        console.log('═══════════════════════════════════════════════════════\n');
        
        await mongoose.connection.close();
        console.log('Conexión cerrada\n');
        
    } catch (error) {
        console.error('Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

main();