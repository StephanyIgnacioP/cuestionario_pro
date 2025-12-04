// src/controllers/categoriaController.js
const Categoria = require('../models/Categoria');


exports.obtenerCategorias = async (req, res) => {
    try {
        const { incluir_subcategorias } = req.query;
        
        let query = Categoria.find({ activo: true });
        
        if (incluir_subcategorias === 'true') {
            query = query.populate('subcategorias');
        }
        
        const categorias = await query.sort({ nombre_categoria: 1 });
        
        res.status(200).json({
            success: true,
            cantidad: categorias.length,
            data: categorias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
};


exports.obtenerCategoriaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const { incluir_subcategorias } = req.query;
        
        let query = Categoria.findById(id);
        
        if (incluir_subcategorias === 'true') {
            query = query.populate('subcategorias');
        }
        
        const categoria = await query;
        
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.status(200).json({
            success: true,
            data: categoria
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener categoría',
            error: error.message
        });
    }
};


exports.crearCategoria = async (req, res) => {
    try {
        const { nombre_categoria, descripcion } = req.body;
        

        if (!nombre_categoria || nombre_categoria.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es requerido'
            });
        }
        

        if (nombre_categoria.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: 'El nombre no puede exceder 100 caracteres'
            });
        }

        if (descripcion && descripcion.trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: 'La descripción no puede exceder 255 caracteres'
            });
        }
        

        const categoriaExistente = await Categoria.findOne({ 
            nombre_categoria: nombre_categoria.trim(),
            activo: true 
        });
        
        if (categoriaExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }
        

        const nuevaCategoria = await Categoria.create({
            nombre_categoria: nombre_categoria.trim(),
            descripcion: descripcion ? descripcion.trim() : undefined
        });
        
        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: nuevaCategoria
        });
    } catch (error) {

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al crear categoría',
            error: error.message
        });
    }
};


exports.actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_categoria, descripcion, activo } = req.body;
        
        // Verificar si existe
        const categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
   
        if (nombre_categoria !== undefined) {
            if (!nombre_categoria || nombre_categoria.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la categoría no puede estar vacío'
                });
            }
            
            if (nombre_categoria.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder 100 caracteres'
                });
            }
            

            const categoriaExistente = await Categoria.findOne({ 
                nombre_categoria: nombre_categoria.trim(),
                _id: { $ne: id },
                activo: true
            });
            
            if (categoriaExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otra categoría con ese nombre'
                });
            }
            
            categoria.nombre_categoria = nombre_categoria.trim();
        }
        

        if (descripcion !== undefined) {
            if (descripcion && descripcion.trim().length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'La descripción no puede exceder 255 caracteres'
                });
            }
            categoria.descripcion = descripcion ? descripcion.trim() : '';
        }
        

        if (activo !== undefined) {
            if (typeof activo !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'El campo activo debe ser true o false'
                });
            }
            categoria.activo = activo;
        }
        
        await categoria.save();
        
        res.status(200).json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: categoria
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al actualizar categoría',
            error: error.message
        });
    }
};


exports.eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        
        const categoria = await Categoria.findById(id);
        
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        

        categoria.activo = false;
        await categoria.save();
        

        const Subcategoria = require('../models/Subcategoria');
        await Subcategoria.updateMany(
            { id_categoria: id },
            { activo: false }
        );
        
        res.status(200).json({
            success: true,
            message: 'Categoría y sus subcategorías desactivadas exitosamente',
            data: categoria
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar categoría',
            error: error.message
        });
    }
};

exports.obtenerEstadisticasCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        
        const categoria = await Categoria.findById(id);
        
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        const Subcategoria = require('../models/Subcategoria');
        const cantidadSubcategorias = await Subcategoria.countDocuments({
            id_categoria: id,
            activo: true
        });
        
        res.status(200).json({
            success: true,
            data: {
                categoria: categoria,
                estadisticas: {
                    subcategorias_activas: cantidadSubcategorias
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};
