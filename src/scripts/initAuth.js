
 //Ejecutar: node src/scripts/initAuth.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

const asignarRol = async () => {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('   ASIGNAR ROL ADMINISTRADOR');
        console.log('═══════════════════════════════════════════════════════\n');
        
       
        console.log(' Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' Conectado a MongoDB\n');
        
        
        console.log(' Buscando rol Administrador...');
        const rolAdmin = await Rol.findOne({ nombre_rol: 'Administrador' });
        
        if (!rolAdmin) {
            console.log(' Error: Rol Administrador no encontrado');
            console.log('   Ejecuta primero: node src/scripts/initAuth.js\n');
            await mongoose.connection.close();
            process.exit(1);
        }
        
        console.log(' Rol encontrado:');
        console.log('   Nombre:', rolAdmin.nombre_rol);
        console.log('   ID:', rolAdmin._id);
        console.log('   Privilegios:', rolAdmin.privilegios.length, '\n');
        
   
        console.log(' Buscando usuario admin...');
        const usuario = await Usuario.findOne({ email: 'admin@cuestionario.com' });
        
        if (!usuario) {
            console.log(' Error: Usuario admin@cuestionario.com no encontrado');
            console.log('   Ejecuta primero: node src/scripts/initAuth.js\n');
            await mongoose.connection.close();
            process.exit(1);
        }
        
        console.log(' Usuario encontrado:');
        console.log('   Nombre:', usuario.nombre, usuario.apellido);
        console.log('   Email:', usuario.email);
        console.log('   Roles actuales:', usuario.roles.length, '\n');
        
    
        const tieneRol = usuario.roles.some(r => r.toString() === rolAdmin._id.toString());
        
        if (tieneRol) {
            console.log(' El usuario YA tiene el rol de Administrador asignado\n');
        } else {
           
            console.log(' Asignando rol de Administrador...');
            usuario.roles = [rolAdmin._id];
            await usuario.save();
            console.log(' Rol asignado exitosamente\n');
        }
        
  
        console.log(' Verificando asignación...');
        const usuarioVerificado = await Usuario.findById(usuario._id)
            .populate('roles', 'nombre_rol');
        
        console.log(' Verificación completada:');
        console.log('   Usuario:', usuarioVerificado.email);
        console.log('   Roles:', usuarioVerificado.roles.map(r => r.nombre_rol).join(', '));
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('    ASIGNACIÓN COMPLETADA');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log(' Próximos pasos:');
        console.log('   1. Generar nuevo token:');
        console.log('      node src/scripts/generateToken.js admin@cuestionario.com');
        console.log('   2. Verificar que diga "Roles: Administrador"');
        console.log('   3. Usar el nuevo token en Postman\n');
        
        await mongoose.connection.close();
        console.log(' Conexión cerrada\n');
        
    } catch (error) {
        console.error('\n Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

asignarRol();