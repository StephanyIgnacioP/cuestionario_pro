// src/controllers/rangoEdadController.js
const RangoEdad = require('../models/RangoEdad');

/**
 * Obtener todos los rangos de edad activos
 */
exports.obtenerRangos = async (req, res) => {
    try {
        const rangos = await RangoEdad.find({ activo: true })
            .sort({ edad_minima: 1 }); // Ordenar por edad mínima
        
        res.status(200).json({
            success: true,
            cantidad: rangos.length,
            data: rangos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener rangos de edad',
            error: error.message
        });
    }
};

/**
 * Obtener un rango de edad por ID
 */
exports.obtenerRangoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rango = await RangoEdad.findById(id);
        
        if (!rango) {
            return res.status(404).json({
                success: false,
                message: 'Rango de edad no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: rango
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener rango de edad',
            error: error.message
        });
    }
};

/**
 * Obtener rango de edad por una edad específica
 */
exports.obtenerRangoPorEdad = async (req, res) => {
    try {
        const { edad } = req.params;
        
        const edadNum = parseInt(edad);
        
        if (isNaN(edadNum) || edadNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'La edad debe ser un número válido y positivo'
            });
        }
        
        const rango = await RangoEdad.findOne({
            activo: true,
            edad_minima: { $lte: edadNum },
            edad_maxima: { $gte: edadNum }
        });
        
        if (!rango) {
            return res.status(404).json({
                success: false,
                message: `No se encontró un rango para la edad ${edadNum}`
            });
        }
        
        res.status(200).json({
            success: true,
            data: rango
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar rango de edad',
            error: error.message
        });
    }
};

/**
 * Crear nuevo rango de edad
 */
exports.crearRango = async (req, res) => {
    try {
        const { nombre_rango, edad_minima, edad_maxima } = req.body;
        
        // Validaciones
        if (!nombre_rango) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del rango es requerido'
            });
        }
        
        if (edad_minima === undefined || edad_maxima === undefined) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima y máxima son requeridas'
            });
        }
        
        if (edad_minima < 0) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima no puede ser negativa'
            });
        }
        
        if (edad_maxima < edad_minima) {
            return res.status(400).json({
                success: false,
                message: 'La edad máxima debe ser mayor o igual a la edad mínima'
            });
        }
        
        // Verificar si ya existe un rango con ese nombre
        const rangoExistente = await RangoEdad.findOne({ nombre_rango });
        if (rangoExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un rango con ese nombre'
            });
        }
        
        // Verificar si hay superposición con otros rangos
        const rangosSuperpuestos = await RangoEdad.find({
            activo: true,
            $or: [
                // El nuevo rango contiene el inicio de un rango existente
                { 
                    edad_minima: { $gte: edad_minima, $lte: edad_maxima }
                },
                // El nuevo rango contiene el final de un rango existente
                { 
                    edad_maxima: { $gte: edad_minima, $lte: edad_maxima }
                },
                // Un rango existente contiene completamente al nuevo rango
                {
                    edad_minima: { $lte: edad_minima },
                    edad_maxima: { $gte: edad_maxima }
                }
            ]
        });
        
        if (rangosSuperpuestos.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El rango de edades se superpone con rangos existentes',
                rangos_conflicto: rangosSuperpuestos.map(r => ({
                    nombre: r.nombre_rango,
                    rango: `${r.edad_minima}-${r.edad_maxima}`
                }))
            });
        }
        
        const nuevoRango = await RangoEdad.create({
            nombre_rango,
            edad_minima,
            edad_maxima,
            activo: true
        });
        
        res.status(201).json({
            success: true,
            message: 'Rango de edad creado exitosamente',
            data: nuevoRango
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear rango de edad',
            error: error.message
        });
    }
};

/**
 * Actualizar rango de edad
 */
exports.actualizarRango = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_rango, edad_minima, edad_maxima, activo } = req.body;
        
        // Validaciones si se actualizan las edades
        if (edad_minima !== undefined && edad_minima < 0) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima no puede ser negativa'
            });
        }
        
        if (edad_minima !== undefined && edad_maxima !== undefined) {
            if (edad_maxima < edad_minima) {
                return res.status(400).json({
                    success: false,
                    message: 'La edad máxima debe ser mayor o igual a la edad mínima'
                });
            }
        }
        
        // Verificar si ya existe otro rango con ese nombre
        if (nombre_rango) {
            const rangoExistente = await RangoEdad.findOne({ 
                nombre_rango,
                _id: { $ne: id }
            });
            
            if (rangoExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro rango con ese nombre'
                });
            }
        }
        
        const rangoActualizado = await RangoEdad.findByIdAndUpdate(
            id,
            { nombre_rango, edad_minima, edad_maxima, activo },
            { new: true, runValidators: true }
        );
        
        if (!rangoActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Rango de edad no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Rango de edad actualizado exitosamente',
            data: rangoActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar rango de edad',
            error: error.message
        });
    }
};

/**
 * Eliminar rango de edad (eliminación lógica)
 */
exports.eliminarRango = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rango = await RangoEdad.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );
        
        if (!rango) {
            return res.status(404).json({
                success: false,
                message: 'Rango de edad no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Rango de edad desactivado exitosamente',
            data: rango
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar rango de edad',
            error: error.message
        });
    }
};