// src/controllers/categoriaController.js
const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');

exports.obtenerCategorias = async (req, res) => {
    try {
        const { incluir_subcategorias } = req.query;
        
        let query = Categoria.find({ activo: true });
        
        if (incluir_subcategorias === 'true') {
            query = query.populate('subcategorias');
        }
        
        const categorias = await query;
        
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
        
        if (!nombre_categoria) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es requerido'
            });
        }
        
        const categoriaExistente = await Categoria.findOne({ nombre_categoria });
        if (categoriaExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }
        
        const nuevaCategoria = await Categoria.create({
            nombre_categoria,
            descripcion,
            activo: true
        });
        
        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: nuevaCategoria
        });
    } catch (error) {
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
        
        if (nombre_categoria) {
            const categoriaExistente = await Categoria.findOne({ 
                nombre_categoria,
                _id: { $ne: id }
            });
            
            if (categoriaExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otra categoría con ese nombre'
                });
            }
        }
        
        const categoriaActualizada = await Categoria.findByIdAndUpdate(
            id,
            { nombre_categoria, descripcion, activo },
            { new: true, runValidators: true }
        );
        
        if (!categoriaActualizada) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: categoriaActualizada
        });
    } catch (error) {
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
        
        const categoria = await Categoria.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );
        
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        // Desactivar todas las subcategorías de esta categoría
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
        
        const cantidadSubcategorias = await Subcategoria.contarPorCategoria(id);
        
        res.status(200).json({
            success: true,
            data: {
                categoria: {
                    id: categoria._id,
                    nombre: categoria.nombre_categoria,
                    descripcion: categoria.descripcion,
                    activo: categoria.activo
                },
                estadisticas: {
                    total_subcategorias: cantidadSubcategorias
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