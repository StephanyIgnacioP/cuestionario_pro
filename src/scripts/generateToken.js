// src/scripts/generateToken.js

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

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

        await mongoose.connect(process.env.MONGODB_URI);
        
        const email = process.argv[2];
        
        if (!email) {
            console.log('\n Error: Debes proporcionar un email\n');
            console.log('Uso: node src/scripts/generateToken.js [email]\n');
            console.log('Ejemplo: node src/scripts/generateToken.js admin@cuestionario.com\n');
            await mongoose.connection.close();
            process.exit(1);
        }

        const usuario = await Usuario.findOne({ email: email.toLowerCase() })
            .populate('roles', 'nombre_rol');
        
        if (!usuario) {
            console.log(`\n Usuario no encontrado: ${email}\n`);
            await mongoose.connection.close();
            process.exit(1);
        }

        if (usuario.estado !== 'activo') {
            console.log(`\n Advertencia: Usuario está ${usuario.estado}\n`);
        }

        const token = generarToken(usuario);
    
        const roles = usuario.roles.map(r => r.nombre_rol).join(', ');

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  TOKEN JWT GENERADO');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log(`Usuario: ${usuario.nombre} ${usuario.apellido}`);
        console.log(`Email: ${usuario.email}`);
        console.log(`Roles: ${roles || 'Sin roles'}`);
        console.log(`Estado: ${usuario.estado}\n`);
        
        console.log('TOKEN:');
        console.log(token);
        
        console.log(`\nExpiración: ${process.env.JWT_EXPIRE || '24h'}`);
        console.log('\n═══════════════════════════════════════════════════════\n');

        await mongoose.connection.close();
        
    } catch (error) {
        console.error('\n Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

main();