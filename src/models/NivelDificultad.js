// src/models/NivelDificultad.js
const mongoose = require('mongoose');

const nivelDificultadSchema = new mongoose.Schema({
    nivel: {
        type: String,
        required: [true, 'El nivel es requerido'],
        enum: {
            values: ['Fácil', 'Medio', 'Difícil'],
            message: '{VALUE} no es un nivel válido'
        },
        unique: true  
    },
    descripcion: {
        type: String,
        maxlength: [255, 'La descripción no puede exceder 255 caracteres'],
        trim: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'niveles_dificultad'
});

nivelDificultadSchema.index({ activo: 1 });

module.exports = mongoose.model('NivelDificultad', nivelDificultadSchema);