// src/models/Categoria.js
const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
    nombre_categoria: {
        type: String,
        required: [true, 'El nombre de la categoría es requerido'],
        maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        trim: true,
        unique: true
    },
    descripcion: {
        type: String,
        maxlength: [255, 'La descripción no puede exceder 255 caracteres'],
        trim: true
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'categorias',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

categoriaSchema.index({ nombre_categoria: 1 });
categoriaSchema.index({ activo: 1 });

categoriaSchema.virtual('subcategorias', {
    ref: 'Subcategoria',
    localField: '_id',
    foreignField: 'id_categoria',
    match: { activo: true }
});

module.exports = mongoose.model('Categoria', categoriaSchema);