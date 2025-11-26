// src/models/Subcategoria.js
const mongoose = require('mongoose');

const subcategoriaSchema = new mongoose.Schema({
    // Referencia a la categoría padre
    id_categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: [true, 'La categoría padre es requerida']
    },
    nombre_subcategoria: {
        type: String,
        required: [true, 'El nombre de la subcategoría es requerido'],
        maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        trim: true
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
    collection: 'subcategorias'
});


subcategoriaSchema.index({ id_categoria: 1 });
subcategoriaSchema.index({ nombre_subcategoria: 1 });
subcategoriaSchema.index({ activo: 1 });

subcategoriaSchema.index({ id_categoria: 1, nombre_subcategoria: 1 }, { unique: true });

subcategoriaSchema.statics.contarPorCategoria = function(categoriaId) {
    return this.countDocuments({ 
        id_categoria: categoriaId, 
        activo: true 
    });
};

subcategoriaSchema.statics.obtenerPorCategoria = function(categoriaId, soloActivas = true) {
    const filtro = { id_categoria: categoriaId };
    if (soloActivas) {
        filtro.activo = true;
    }
    return this.find(filtro).sort({ nombre_subcategoria: 1 });
};

module.exports = mongoose.model('Subcategoria', subcategoriaSchema);