// src/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
        maxlength: [100, 'El apellido no puede exceder 100 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email no válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rol'
    }],
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
        otorgado_por: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        fecha_otorgado: {
            type: Date,
            default: Date.now
        }
    }],
    estado: {
        type: String,
        enum: ['activo', 'inactivo', 'suspendido'],
        default: 'activo'
    },
    fecha_registro: {
        type: Date,
        default: Date.now
    },
    ultimo_acceso: {
        type: Date
    },
    intentos_fallidos: {
        type: Number,
        default: 0
    },
    bloqueado_hasta: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'usuarios'
});

// Índices
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ estado: 1 });
usuarioSchema.index({ roles: 1 });


usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


usuarioSchema.methods.compararPassword = async function(passwordIngresado) {
    return await bcrypt.compare(passwordIngresado, this.password);
};


usuarioSchema.methods.obtenerTodosPrivilegios = async function() {
    await this.populate('roles');
    
    const privilegiosSet = new Set();
    
    this.roles.forEach(rol => {
        rol.privilegios.forEach(priv => {
            privilegiosSet.add(priv.nombre_privilegio);
        });
    });
    
    this.privilegios.forEach(priv => {
        privilegiosSet.add(priv.nombre_privilegio);
    });
    
    return Array.from(privilegiosSet);
};


usuarioSchema.methods.tienePrivilegio = async function(nombrePrivilegio) {
    const privilegios = await this.obtenerTodosPrivilegios();
    return privilegios.includes(nombrePrivilegio);
};


usuarioSchema.methods.tieneRol = function(nombreRol) {
    return this.roles.some(rol => rol.nombre_rol === nombreRol);
};


usuarioSchema.methods.registrarIntentoFallido = async function() {
    this.intentos_fallidos += 1;
    
    if (this.intentos_fallidos >= 5) {
        this.bloqueado_hasta = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await this.save();
};


usuarioSchema.methods.resetearIntentosFallidos = async function() {
    this.intentos_fallidos = 0;
    this.bloqueado_hasta = null;
    this.ultimo_acceso = Date.now();
    await this.save();
};


usuarioSchema.methods.estaBloqueado = function() {
    return this.bloqueado_hasta && this.bloqueado_hasta > Date.now();
};


usuarioSchema.methods.agregarRol = async function(rolId) {
    if (!this.roles.includes(rolId)) {
        this.roles.push(rolId);
        await this.save();
    }
};


usuarioSchema.methods.removerRol = async function(rolId) {
    this.roles = this.roles.filter(id => !id.equals(rolId));
    await this.save();
};


usuarioSchema.statics.buscarPorEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};


usuarioSchema.virtual('nombre_completo').get(function() {
    return `${this.nombre} ${this.apellido}`;
});


usuarioSchema.methods.toJSON = function() {
    const usuario = this.toObject();
    delete usuario.password;
    delete usuario.__v;
    return usuario;
};

module.exports = mongoose.model('Usuario', usuarioSchema);