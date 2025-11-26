// src/models/RangoEdad.js
const mongoose = require('mongoose');

const rangoEdadSchema = new mongoose.Schema({
    nombre_rango: {
        type: String,
        required: [true, 'El nombre del rango es requerido'],
        maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
        trim: true,
        unique: true
    },
    edad_minima: {
        type: Number,
        required: [true, 'La edad mínima es requerida'],
        min: [0, 'La edad mínima no puede ser negativa']
    },
    edad_maxima: {
        type: Number,
        required: [true, 'La edad máxima es requerida'],
        validate: {
            validator: function(value) {
                return value >= this.edad_minima;
            },
            message: 'La edad máxima debe ser mayor o igual a la edad mínima'
        }
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'rangos_edad'
});

rangoEdadSchema.index({ nombre_rango: 1 });
rangoEdadSchema.index({ edad_minima: 1, edad_maxima: 1 });
rangoEdadSchema.index({ activo: 1 });

// Método para verificar si una edad está en el rango
rangoEdadSchema.methods.incluyeEdad = function(edad) {
    return edad >= this.edad_minima && edad <= this.edad_maxima;
};

module.exports = mongoose.model('RangoEdad', rangoEdadSchema);