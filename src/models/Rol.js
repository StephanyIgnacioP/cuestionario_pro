// src/models/Rol.js
const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
    nombre_rol: {
        type: String,
        required: [true, 'El nombre del rol es requerido'],
        unique: true,
        trim: true,
        maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    descripcion: {
        type: String,
        maxlength: [255, 'La descripción no puede exceder 255 caracteres'],
        trim: true
    },
    privilegios: [{
        nombre_privilegio: {
            type: String,
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
            ],
            required: true
        },
        descripcion: {
            type: String,
            maxlength: [200, 'La descripción no puede exceder 200 caracteres']
        }
    }],
    es_sistema: {
        type: Boolean,
        default: false,
        select: false
    },
    activo: {
        type: Boolean,
        default: true
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'roles'
});

rolSchema.index({ activo: 1 });

rolSchema.methods.tienePrivilegio = function(nombrePrivilegio) {
    return this.privilegios.some(p => p.nombre_privilegio === nombrePrivilegio);
};

rolSchema.methods.agregarPrivilegio = async function(nombrePrivilegio, descripcion = '') {
    const existe = this.privilegios.some(p => p.nombre_privilegio === nombrePrivilegio);
    
    if (!existe) {
        this.privilegios.push({
            nombre_privilegio: nombrePrivilegio,
            descripcion: descripcion
        });
        await this.save();
    }
};

rolSchema.methods.removerPrivilegio = async function(nombrePrivilegio) {
    this.privilegios = this.privilegios.filter(p => p.nombre_privilegio !== nombrePrivilegio);
    await this.save();
};

rolSchema.methods.obtenerNombresPrivilegios = function() {
    return this.privilegios.map(p => p.nombre_privilegio);
};

rolSchema.statics.buscarPorNombre = function(nombreRol) {
    return this.findOne({ nombre_rol: nombreRol });
};

rolSchema.statics.obtenerActivos = function() {
    return this.find({ activo: true }).sort({ nombre_rol: 1 });
};

rolSchema.statics.contarUsuarios = async function(rolId) {
    const Usuario = mongoose.model('Usuario');
    return await Usuario.countDocuments({ roles: rolId });
};

module.exports = mongoose.model('Rol', rolSchema);