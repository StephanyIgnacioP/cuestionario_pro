// src/controllers/subcategoriaController.js
const Subcategoria = require('../models/Subcategoria');
const Categoria = require('../models/Categoria');


exports.obtenerSubcategorias = async (req, res) => {
    try {
        const subcategorias = await Subcategoria.find({ activo: true })
            .populate('id_categoria', 'nombre_categoria')
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
        
        const subcategorias = await Subcategoria.find({
            id_categoria: categoriaId,
            activo: true
        }).sort({ nombre_subcategoria: 1 });
        
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


exports.contarSubcategoriasPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        
        const cantidad = await Subcategoria.contarPorCategoria(categoriaId);
        
        res.status(200).json({
            success: true,
            data: {
                id_categoria: categoriaId,
                cantidad_subcategorias: cantidad
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al contar subcategorías',
            error: error.message
        });
    }
};


exports.crearSubcategoria = async (req, res) => {
    try {
        const { id_categoria, nombre_subcategoria, descripcion } = req.body;
        
        if (!id_categoria || id_categoria.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El ID de la categoría es requerido'
            });
        }
        

        if (!nombre_subcategoria || nombre_subcategoria.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la subcategoría es requerido'
            });
        }
        

        if (nombre_subcategoria.trim().length > 100) {
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
        

        const categoriaExiste = await Categoria.findById(id_categoria);
        
        if (!categoriaExiste) {
            return res.status(404).json({
                success: false,
                message: 'La categoría especificada no existe'
            });
        }
        

        if (!categoriaExiste.activo) {
            return res.status(400).json({
                success: false,
                message: 'No se puede crear una subcategoría en una categoría inactiva'
            });
        }
        
        const subcategoriaExistente = await Subcategoria.findOne({
            id_categoria: id_categoria,
            nombre_subcategoria: nombre_subcategoria.trim(),
            activo: true
        });
        
        if (subcategoriaExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una subcategoría con ese nombre en esta categoría'
            });
        }
        

        const nuevaSubcategoria = await Subcategoria.create({
            id_categoria: id_categoria,
            nombre_subcategoria: nombre_subcategoria.trim(),
            descripcion: descripcion ? descripcion.trim() : undefined
        });
        

        await nuevaSubcategoria.populate('id_categoria', 'nombre_categoria');
        
        res.status(201).json({
            success: true,
            message: 'Subcategoría creada exitosamente',
            data: nuevaSubcategoria
        });
    } catch (error) {

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
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
        

        const subcategoria = await Subcategoria.findById(id);
        if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }
        
        if (id_categoria !== undefined) {
            if (!id_categoria || id_categoria.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de la categoría no puede estar vacío'
                });
            }
            

            const categoriaExiste = await Categoria.findById(id_categoria);
            
            if (!categoriaExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoría especificada no existe'
                });
            }
            

            if (!categoriaExiste.activo) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede asignar a una categoría inactiva'
                });
            }
            
            subcategoria.id_categoria = id_categoria;
        }
        

        if (nombre_subcategoria !== undefined) {
            if (!nombre_subcategoria || nombre_subcategoria.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la subcategoría no puede estar vacío'
                });
            }
            
            if (nombre_subcategoria.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder 100 caracteres'
                });
            }
            

            const subcategoriaExistente = await Subcategoria.findOne({
                id_categoria: subcategoria.id_categoria,
                nombre_subcategoria: nombre_subcategoria.trim(),
                _id: { $ne: id },
                activo: true
            });
            
            if (subcategoriaExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otra subcategoría con ese nombre en esta categoría'
                });
            }
            
            subcategoria.nombre_subcategoria = nombre_subcategoria.trim();
        }
        

        if (descripcion !== undefined) {
            if (descripcion && descripcion.trim().length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'La descripción no puede exceder 255 caracteres'
                });
            }
            subcategoria.descripcion = descripcion ? descripcion.trim() : '';
        }
        

        if (activo !== undefined) {
            if (typeof activo !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'El campo activo debe ser true o false'
                });
            }
            subcategoria.activo = activo;
        }
        
        await subcategoria.save();
        await subcategoria.populate('id_categoria', 'nombre_categoria');
        
        res.status(200).json({
            success: true,
            message: 'Subcategoría actualizada exitosamente',
            data: subcategoria
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
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
        
        const subcategoria = await Subcategoria.findById(id);
        
        if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }
        
        subcategoria.activo = false;
        await subcategoria.save();
        
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