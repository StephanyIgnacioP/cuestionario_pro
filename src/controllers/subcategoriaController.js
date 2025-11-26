// src/controllers/subcategoriaController.js
const Subcategoria = require('../models/Subcategoria');
const Categoria = require('../models/Categoria');

exports.obtenerSubcategorias = async (req, res) => {
    try {
        const subcategorias = await Subcategoria.find({ activo: true })
            .populate('id_categoria', 'nombre_categoria descripcion')
            .sort({ nombre_subcategoria: 1 });
        
        res.status(200).json({
            success: true,
            cantidad: subcategorias.length,
            data: subcategorias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener subcategorías',
            error: error.message
        });
    }
};

exports.obtenerSubcategoriaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const subcategoria = await Subcategoria.findById(id)
            .populate('id_categoria', 'nombre_categoria descripcion');
        
        if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }
        
        res.status(200).json({
            success: true,
            data: subcategoria
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener subcategoría',
            error: error.message
        });
    }
};

exports.obtenerSubcategoriasPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        
        const categoria = await Categoria.findById(categoriaId);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        const subcategorias = await Subcategoria.obtenerPorCategoria(categoriaId);
        
        res.status(200).json({
            success: true,
            categoria: {
                id: categoria._id,
                nombre: categoria.nombre_categoria
            },
            cantidad: subcategorias.length,
            data: subcategorias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener subcategorías por categoría',
            error: error.message
        });
    }
};

exports.crearSubcategoria = async (req, res) => {
    try {
        const { id_categoria, nombre_subcategoria, descripcion } = req.body;
        
        if (!id_categoria) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la categoría es requerido'
            });
        }
        
        if (!nombre_subcategoria) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la subcategoría es requerido'
            });
        }
        
        const categoria = await Categoria.findById(id_categoria);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'La categoría especificada no existe'
            });
        }
        
        if (!categoria.activo) {
            return res.status(400).json({
                success: false,
                message: 'No se puede agregar subcategoría a una categoría inactiva'
            });
        }
        
        const subcategoriaExistente = await Subcategoria.findOne({ 
            id_categoria,
            nombre_subcategoria 
        });
        
        if (subcategoriaExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una subcategoría con ese nombre en esta categoría'
            });
        }
        
        const nuevaSubcategoria = await Subcategoria.create({
            id_categoria,
            nombre_subcategoria,
            descripcion,
            activo: true
        });
        
        // Populate para devolver la información de la categoría
        await nuevaSubcategoria.populate('id_categoria', 'nombre_categoria');
        
        res.status(201).json({
            success: true,
            message: 'Subcategoría creada exitosamente',
            data: nuevaSubcategoria
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una subcategoría con ese nombre en esta categoría'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al crear subcategoría',
            error: error.message
        });
    }
};

exports.actualizarSubcategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_categoria, nombre_subcategoria, descripcion, activo } = req.body;
        
        if (id_categoria) {
            const categoria = await Categoria.findById(id_categoria);
            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoría especificada no existe'
                });
            }
        }
        
        if (nombre_subcategoria || id_categoria) {
            const subcategoriaActual = await Subcategoria.findById(id);
            if (!subcategoriaActual) {
                return res.status(404).json({
                    success: false,
                    message: 'Subcategoría no encontrada'
                });
            }
            
            const categoriaABuscar = id_categoria || subcategoriaActual.id_categoria;
            const nombreABuscar = nombre_subcategoria || subcategoriaActual.nombre_subcategoria;
            
            const subcategoriaExistente = await Subcategoria.findOne({ 
                id_categoria: categoriaABuscar,
                nombre_subcategoria: nombreABuscar,
                _id: { $ne: id }
            });
            
            if (subcategoriaExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otra subcategoría con ese nombre en esta categoría'
                });
            }
        }
        
        const subcategoriaActualizada = await Subcategoria.findByIdAndUpdate(
            id,
            { id_categoria, nombre_subcategoria, descripcion, activo },
            { new: true, runValidators: true }
        ).populate('id_categoria', 'nombre_categoria');
        
        if (!subcategoriaActualizada) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Subcategoría actualizada exitosamente',
            data: subcategoriaActualizada
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe otra subcategoría con ese nombre en esta categoría'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al actualizar subcategoría',
            error: error.message
        });
    }
};

exports.eliminarSubcategoria = async (req, res) => {
    try {
        const { id } = req.params;
        
        const subcategoria = await Subcategoria.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        ).populate('id_categoria', 'nombre_categoria');
        
        if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Subcategoría desactivada exitosamente',
            data: subcategoria
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar subcategoría',
            error: error.message
        });
    }
};

exports.contarSubcategoriasPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        
        const categoria = await Categoria.findById(categoriaId);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        const cantidad = await Subcategoria.contarPorCategoria(categoriaId);
        
        res.status(200).json({
            success: true,
            categoria: {
                id: categoria._id,
                nombre: categoria.nombre_categoria
            },
            cantidad_subcategorias: cantidad
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al contar subcategorías',
            error: error.message
        });
    }
};