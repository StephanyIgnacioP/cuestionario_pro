// src/controllers/nivelDificultadController.js
const NivelDificultad = require('../models/NivelDificultad');

/**
 * Obtener todos los niveles de dificultad activos
 */
exports.obtenerNiveles = async (req, res) => {
    try {
        const niveles = await NivelDificultad.find({ activo: true });
        
        res.status(200).json({
            success: true,
            cantidad: niveles.length,
            data: niveles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener niveles de dificultad',
            error: error.message
        });
    }
};

/**
 * Obtener un nivel de dificultad por ID
 */
exports.obtenerNivelPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const nivel = await NivelDificultad.findById(id);
        
        if (!nivel) {
            return res.status(404).json({
                success: false,
                message: 'Nivel de dificultad no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: nivel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener nivel de dificultad',
            error: error.message
        });
    }
};

/**
 * Crear nuevo nivel de dificultad
 */
exports.crearNivel = async (req, res) => {
    try {
        const { nivel, descripcion } = req.body;
        
        // Validación
        if (!nivel) {
            return res.status(400).json({
                success: false,
                message: 'El nivel es requerido'
            });
        }
        
        // Validar que el nivel sea uno de los valores permitidos
        const nivelesPermitidos = ['Fácil', 'Medio', 'Difícil'];
        if (!nivelesPermitidos.includes(nivel)) {
            return res.status(400).json({
                success: false,
                message: `El nivel debe ser uno de: ${nivelesPermitidos.join(', ')}`
            });
        }
        
        // Verificar si ya existe
        const nivelExistente = await NivelDificultad.findOne({ nivel });
        if (nivelExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un nivel con ese nombre'
            });
        }
        
        const nuevoNivel = await NivelDificultad.create({
            nivel,
            descripcion,
            activo: true
        });
        
        res.status(201).json({
            success: true,
            message: 'Nivel de dificultad creado exitosamente',
            data: nuevoNivel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear nivel de dificultad',
            error: error.message
        });
    }
};

/**
 * Actualizar nivel de dificultad
 */
exports.actualizarNivel = async (req, res) => {
    try {
        const { id } = req.params;
        const { nivel, descripcion, activo } = req.body;
        
        // Si se está actualizando el nivel, validar
        if (nivel) {
            const nivelesPermitidos = ['Fácil', 'Medio', 'Difícil'];
            if (!nivelesPermitidos.includes(nivel)) {
                return res.status(400).json({
                    success: false,
                    message: `El nivel debe ser uno de: ${nivelesPermitidos.join(', ')}`
                });
            }
            
            // Verificar si ya existe otro con ese nombre
            const nivelExistente = await NivelDificultad.findOne({ 
                nivel,
                _id: { $ne: id }
            });
            
            if (nivelExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro nivel con ese nombre'
                });
            }
        }
        
        const nivelActualizado = await NivelDificultad.findByIdAndUpdate(
            id,
            { nivel, descripcion, activo },
            { new: true, runValidators: true }
        );
        
        if (!nivelActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Nivel de dificultad no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Nivel de dificultad actualizado exitosamente',
            data: nivelActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar nivel de dificultad',
            error: error.message
        });
    }
};

/**
 * Eliminar nivel de dificultad (eliminación lógica)
 */
exports.eliminarNivel = async (req, res) => {
    try {
        const { id } = req.params;
        
        const nivel = await NivelDificultad.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );
        
        if (!nivel) {
            return res.status(404).json({
                success: false,
                message: 'Nivel de dificultad no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Nivel de dificultad desactivado exitosamente',
            data: nivel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar nivel de dificultad',
            error: error.message
        });
    }
};