// src/models/Privilegio.js
const mongoose = require('mongoose');

const privilegioSchema = new mongoose.Schema({
    nombre_privilegio: {
        type: String,
        required: [true, 'El nombre del privilegio es requerido'],
        unique: true,
        trim: true,
        enum: [
            'crear_preguntas',
            'editar_preguntas',
            'eliminar_preguntas',
            'publicar_preguntas',
            'revisar_preguntas',
            'crear_examenes',
            'editar_examenes',
            'eliminar_examenes',
            'ver_examenes',
            'responder_examenes',
            'calificar_examenes',
            'gestionar_usuarios',
            'gestionar_roles',
            'gestionar_categorias',
            'ver_reportes',
            'exportar_datos'
        ]
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        maxlength: [255, 'La descripción no puede exceder 255 caracteres'],
        trim: true
    },
    categoria: {
        type: String,
        enum: ['preguntas', 'examenes', 'administracion', 'reportes'],
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'privilegios'
});

privilegioSchema.index({ categoria: 1 });

privilegioSchema.statics.obtenerPorCategoria = function(categoria) {
    return this.find({ categoria: categoria, activo: true }).sort({ nombre_privilegio: 1 });
};

privilegioSchema.statics.obtenerAgrupados = async function() {
    const privilegios = await this.find({ activo: true }).sort({ categoria: 1, nombre_privilegio: 1 });
    
    const agrupados = {
        preguntas: [],
        examenes: [],
        administracion: [],
        reportes: []
    };
    
    privilegios.forEach(priv => {
        agrupados[priv.categoria].push(priv);
    });
    
    return agrupados;
};

module.exports = mongoose.model('Privilegio', privilegioSchema);