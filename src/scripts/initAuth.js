
 //Ejecutar: node src/scripts/initAuth.js
 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Privilegio = require('../models/Privilegio');
const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');

const privilegiosData = [

    { nombre_privilegio: 'crear_preguntas', descripcion: 'Permite crear nuevas preguntas', categoria: 'preguntas' },
    { nombre_privilegio: 'editar_preguntas', descripcion: 'Permite editar preguntas existentes', categoria: 'preguntas' },
    { nombre_privilegio: 'eliminar_preguntas', descripcion: 'Permite eliminar preguntas', categoria: 'preguntas' },
    { nombre_privilegio: 'publicar_preguntas', descripcion: 'Permite publicar preguntas para uso', categoria: 'preguntas' },
    { nombre_privilegio: 'revisar_preguntas', descripcion: 'Permite revisar y aprobar preguntas', categoria: 'preguntas' },
    
    { nombre_privilegio: 'crear_examenes', descripcion: 'Permite crear nuevos exámenes', categoria: 'examenes' },
    { nombre_privilegio: 'editar_examenes', descripcion: 'Permite editar exámenes existentes', categoria: 'examenes' },
    { nombre_privilegio: 'eliminar_examenes', descripcion: 'Permite eliminar exámenes', categoria: 'examenes' },
    { nombre_privilegio: 'ver_examenes', descripcion: 'Permite ver exámenes disponibles', categoria: 'examenes' },
    { nombre_privilegio: 'responder_examenes', descripcion: 'Permite responder exámenes', categoria: 'examenes' },
    { nombre_privilegio: 'calificar_examenes', descripcion: 'Permite calificar exámenes', categoria: 'examenes' },
    
    { nombre_privilegio: 'gestionar_usuarios', descripcion: 'Permite administrar usuarios del sistema', categoria: 'administracion' },
    { nombre_privilegio: 'gestionar_roles', descripcion: 'Permite administrar roles y permisos', categoria: 'administracion' },
    { nombre_privilegio: 'gestionar_categorias', descripcion: 'Permite administrar categorías y subcategorías', categoria: 'administracion' },

    { nombre_privilegio: 'ver_reportes', descripcion: 'Permite ver reportes y estadísticas', categoria: 'reportes' },
    { nombre_privilegio: 'exportar_datos', descripcion: 'Permite exportar datos del sistema', categoria: 'reportes' }
];

const rolesData = [

    {
        nombre_rol: 'Administrador',
        descripcion: 'Acceso completo al sistema - Control total',
        es_sistema: true,
        privilegios: [
          
            { nombre_privilegio: 'crear_preguntas', descripcion: 'Gestión completa de preguntas' },
            { nombre_privilegio: 'editar_preguntas' },
            { nombre_privilegio: 'eliminar_preguntas' },
            { nombre_privilegio: 'publicar_preguntas' },
            { nombre_privilegio: 'revisar_preguntas' },
            
            { nombre_privilegio: 'crear_examenes', descripcion: 'Gestión completa de exámenes' },
            { nombre_privilegio: 'editar_examenes' },
            { nombre_privilegio: 'eliminar_examenes' },
            { nombre_privilegio: 'ver_examenes' },
            { nombre_privilegio: 'responder_examenes' },
            { nombre_privilegio: 'calificar_examenes' },
          
            { nombre_privilegio: 'gestionar_usuarios', descripcion: 'Administración del sistema' },
            { nombre_privilegio: 'gestionar_roles' },
            { nombre_privilegio: 'gestionar_categorias' },
            
            { nombre_privilegio: 'ver_reportes', descripcion: 'Acceso a reportes' },
            { nombre_privilegio: 'exportar_datos' }
        ]
    },
 
    {
        nombre_rol: 'Editor de Preguntas',
        descripcion: 'Editor y revisor de preguntas - Gestión completa de contenido de preguntas',
        es_sistema: true,
        privilegios: [
        
            { nombre_privilegio: 'crear_preguntas', descripcion: 'Crear nuevas preguntas' },
            { nombre_privilegio: 'editar_preguntas', descripcion: 'Modificar preguntas existentes' },
            { nombre_privilegio: 'eliminar_preguntas', descripcion: 'Eliminar preguntas' },
            { nombre_privilegio: 'revisar_preguntas', descripcion: 'Revisar preguntas de otros' },
            { nombre_privilegio: 'publicar_preguntas', descripcion: 'Aprobar y publicar preguntas' },
         
            { nombre_privilegio: 'gestionar_categorias', descripcion: 'Administrar categorías y subcategorías' }
        ]
    },

    {
        nombre_rol: 'Gestor de Exámenes',
        descripcion: 'Gestión y calificación de exámenes',
        es_sistema: true,
        privilegios: [

            { nombre_privilegio: 'crear_examenes', descripcion: 'Crear nuevos exámenes' },
            { nombre_privilegio: 'editar_examenes', descripcion: 'Modificar exámenes' },
            { nombre_privilegio: 'eliminar_examenes', descripcion: 'Eliminar exámenes' },
            { nombre_privilegio: 'ver_examenes', descripcion: 'Visualizar exámenes' },
            { nombre_privilegio: 'calificar_examenes', descripcion: 'Calificar y evaluar exámenes' }
        ]
    }
];

const main = async () => {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('   INICIALIZACIÓN DEL SISTEMA DE AUTENTICACIÓN');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log(' Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB\n');
        
        console.log('  Limpiando colecciones existentes...');
        await Privilegio.deleteMany({});
        await Rol.deleteMany({});
        console.log('Colecciones limpiadas\n');
        
        console.log(' [1/3] Creando privilegios...');
        await Privilegio.insertMany(privilegiosData);
        console.log(` ${privilegiosData.length} privilegios creados:\n`);

        const porCategoria = {};
        privilegiosData.forEach(p => {
            if (!porCategoria[p.categoria]) porCategoria[p.categoria] = [];
            porCategoria[p.categoria].push(p.nombre_privilegio);
        });
        
        Object.entries(porCategoria).forEach(([cat, privs]) => {
            console.log(`    ${cat}:`);
            privs.forEach(p => console.log(`     • ${p}`));
        });
        console.log('');  

        console.log(' [2/3] Creando roles personalizados...');
        const rolesCreados = await Rol.insertMany(rolesData);
        console.log(` ${rolesCreados.length} roles creados:\n`);
        
        rolesCreados.forEach(rol => {
            console.log(`    ${rol.nombre_rol}`);
            console.log(`      ${rol.descripcion}`);
            console.log(`      Privilegios: ${rol.privilegios.length}`);
            console.log('');
        });

        console.log(' [3/3] Verificando usuario administrador...');
        let adminUser = await Usuario.findOne({ email: 'admin@cuestionario.com' });
        
        if (adminUser) {
            console.log('  Ya existe un usuario administrador\n');
        } else {

            const adminRol = rolesCreados.find(r => r.nombre_rol === 'Administrador');
            
            adminUser = await Usuario.create({
                nombre: 'Administrador',
                apellido: 'Sistema',
                email: 'admin@cuestionario.com',
                password: 'admin123',  
                roles: [adminRol._id],
                estado: 'activo'
            });
            
            console.log(' Usuario administrador creado\n');
        }
        
        await adminUser.populate('roles', 'nombre_rol privilegios');
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('   INICIALIZACIÓN COMPLETADA EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log(' Resumen:');
        console.log(`    Privilegios: ${privilegiosData.length}`);
        console.log(`    Roles: ${rolesCreados.length}`);
        console.log(`    Usuario administrador: 1\n`);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('   ROLES CREADOS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('1️  ADMINISTRADOR (16 privilegios)');
        console.log('   → Control total del sistema\n');
        
        console.log('2️ EDITOR DE PREGUNTAS (6 privilegios)');
        console.log('   → Crear, editar, eliminar preguntas');
        console.log('   → Revisar y publicar preguntas');
        console.log('   → Gestionar categorías\n');
        
        console.log('3️  GESTOR DE EXÁMENES (5 privilegios)');
        console.log('   → Crear, editar, eliminar exámenes');
        console.log('   → Ver y calificar exámenes\n');
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('   CREDENCIALES DE ADMINISTRADOR');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('    Email: admin@cuestionario.com');
        console.log('    Password: admin123');
        console.log('     IMPORTANTE: Cambia esta contraseña en producción\n');
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('   PRÓXIMOS PASOS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('1. Generar token JWT para el admin:');
        console.log('   node src/scripts/generateToken.js admin@cuestionario.com\n');
        
        console.log('2. Usar el token en tus peticiones:');
        console.log('   Authorization: Bearer [TU_TOKEN]\n');
        
        console.log('3. Crear más usuarios:');
        console.log('   POST /api/usuarios con el token del admin\n');
        
        console.log('═══════════════════════════════════════════════════════\n');
        

        await mongoose.connection.close();
        console.log(' Conexión cerrada\n');
        
    } catch (error) {
        console.error(' Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

main();