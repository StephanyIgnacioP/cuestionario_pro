// src/scripts/initDatabase.js
/**

 * Ejecutar con: node src/scripts/initDatabase.js
 */

const mongoose = require('mongoose');
require('dotenv').config();


const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');
const NivelDificultad = require('../models/NivelDificultad');
const RangoEdad = require('../models/RangoEdad');


const nivelesIniciales = [
    {
        nivel: 'Fácil',
        descripcion: 'Preguntas básicas y sencillas',
        activo: true
    },
    {
        nivel: 'Medio',
        descripcion: 'Preguntas de dificultad intermedia',
        activo: true
    },
    {
        nivel: 'Difícil',
        descripcion: 'Preguntas avanzadas y complejas',
        activo: true
    }
];

const rangosIniciales = [
    {
        nombre_rango: 'Infantil',
        edad_minima: 6,
        edad_maxima: 10,
        activo: true
    },
    {
        nombre_rango: 'Pre-adolescente',
        edad_minima: 11,
        edad_maxima: 13,
        activo: true
    },
    {
        nombre_rango: 'Adolescente',
        edad_minima: 14,
        edad_maxima: 17,
        activo: true
    },
    {
        nombre_rango: 'Adulto Joven',
        edad_minima: 18,
        edad_maxima: 25,
        activo: true
    },
    {
        nombre_rango: 'Adulto',
        edad_minima: 26,
        edad_maxima: 60,
        activo: true
    }
];

const categoriasIniciales = [
    {
        nombre_categoria: 'Matemáticas',
        descripcion: 'Preguntas relacionadas con matemáticas',
        activo: true
    },
    {
        nombre_categoria: 'Ciencias',
        descripcion: 'Preguntas de ciencias naturales',
        activo: true
    },
    {
        nombre_categoria: 'Historia',
        descripcion: 'Preguntas de historia y eventos históricos',
        activo: true
    },
    {
        nombre_categoria: 'Geografía',
        descripcion: 'Preguntas sobre geografía y ubicaciones',
        activo: true
    },
    {
        nombre_categoria: 'Literatura',
        descripcion: 'Preguntas sobre literatura y autores',
        activo: true
    }
];

const subcategoriasIniciales = {
    'Matemáticas': [
        { nombre_subcategoria: 'Aritmética', descripcion: 'Operaciones básicas' },
        { nombre_subcategoria: 'Álgebra', descripcion: 'Ecuaciones y expresiones algebraicas' },
        { nombre_subcategoria: 'Geometría', descripcion: 'Formas, áreas y volúmenes' }
    ],
    'Ciencias': [
        { nombre_subcategoria: 'Biología', descripcion: 'Seres vivos y ecosistemas' },
        { nombre_subcategoria: 'Química', descripcion: 'Elementos y reacciones químicas' },
        { nombre_subcategoria: 'Física', descripcion: 'Movimiento, energía y fuerzas' }
    ],
    'Historia': [
        { nombre_subcategoria: 'Historia Mundial', descripcion: 'Eventos globales' },
        { nombre_subcategoria: 'Historia Nacional', descripcion: 'Historia del país' },
        { nombre_subcategoria: 'Historia Contemporánea', descripcion: 'Siglo XX y XXI' }
    ],
    'Geografía': [
        { nombre_subcategoria: 'Geografía Física', descripcion: 'Relieve, clima, ríos' },
        { nombre_subcategoria: 'Geografía Política', descripcion: 'Países, capitales, fronteras' },
        { nombre_subcategoria: 'Geografía Económica', descripcion: 'Recursos naturales y economía' }
    ],
    'Literatura': [
        { nombre_subcategoria: 'Literatura Clásica', descripcion: 'Obras clásicas' },
        { nombre_subcategoria: 'Literatura Contemporánea', descripcion: 'Obras modernas' },
        { nombre_subcategoria: 'Poesía', descripcion: 'Poemas y poetas' }
    ]
};

async function initDatabase() {
    try {
        // Conectar a MongoDB
        console.log('Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' Conectado a MongoDB\n');

        console.log('  Limpiando colecciones existentes...');
        await Categoria.deleteMany({});
        await Subcategoria.deleteMany({});
        await NivelDificultad.deleteMany({});
        await RangoEdad.deleteMany({});
        console.log('  Colecciones limpiadas\n');


        console.log('  [TABLA 1/4] Insertando niveles de dificultad...');
        const nivelesCreados = await NivelDificultad.insertMany(nivelesIniciales);
        console.log(`  ${nivelesCreados.length} niveles de dificultad creados:`);
        nivelesCreados.forEach(nivel => {
            console.log(`   - ${nivel.nivel}`);
        });
        console.log('');

        console.log('👥 [TABLA 2/4] Insertando rangos de edad...');
        const rangosCreados = await RangoEdad.insertMany(rangosIniciales);
        console.log(`  ${rangosCreados.length} rangos de edad creados:`);
        rangosCreados.forEach(rango => {
            console.log(`   - ${rango.nombre_rango} (${rango.edad_minima}-${rango.edad_maxima} años)`);
        });
        console.log('');

      
        console.log('  [TABLA 3/4] Insertando categorías...');
        const categoriasCreadas = await Categoria.insertMany(categoriasIniciales);
        console.log(`  ${categoriasCreadas.length} categorías creadas:`);
        categoriasCreadas.forEach(cat => {
            console.log(`   - ${cat.nombre_categoria} (ID: ${cat._id})`);
        });
        console.log('');

        console.log('  [TABLA 4/4] Insertando subcategorías...');
        let totalSubcategorias = 0;
        
        for (const categoria of categoriasCreadas) {
            const subcats = subcategoriasIniciales[categoria.nombre_categoria];
            
            if (subcats) {
                console.log(`   → Creando subcategorías para: ${categoria.nombre_categoria}`);
                
                for (const subcat of subcats) {
                    await Subcategoria.create({
                        id_categoria: categoria._id,
                        nombre_subcategoria: subcat.nombre_subcategoria,
                        descripcion: subcat.descripcion,
                        activo: true
                    });
                    totalSubcategorias++;
                    console.log(`     • ${subcat.nombre_subcategoria}`);
                }
            }
        }
        
        console.log(` ${totalSubcategorias} subcategorías creadas en total\n`);


        console.log('═══════════════════════════════════════════════════════');
        console.log('    BASE DE DATOS INICIALIZADA EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  LAS 4 TABLAS BASE HAN SIDO CREADAS:');
        console.log('');
        console.log(`   1.  Niveles de Dificultad: ${nivelesCreados.length} registros`);
        console.log(`   2.  Rangos de Edad:        ${rangosCreados.length} registros`);
        console.log(`   3.  Categorías:            ${categoriasCreadas.length} registros`);
        console.log(`   4.  Subcategorías:         ${totalSubcategorias} registros`);
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  Verifica en MongoDB Atlas:');
        console.log('   - Colección: categorias');
        console.log('   - Colección: subcategorias');
        console.log('   - Colección: niveles_dificultad');
        console.log('   - Colección: rangos_edad');
        console.log('═══════════════════════════════════════════════════════\n');

        // Cerrar conexión
        await mongoose.connection.close();
        console.log(' Conexión cerrada correctamente');
        process.exit(0);

    } catch (error) {
        console.error('  ERROR:', error.message);
        console.error(error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Ejecutar
initDatabase();