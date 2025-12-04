// src/controllers/nivelDificultadController.js
const NivelDificultad = require('../models/NivelDificultad');


exports.obtenerNiveles = async (req, res) => {
    try {
        const niveles = await NivelDificultad.find({ activo: true })
            .sort({ nivel: 1 });
        
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


exports.crearNivel = async (req, res) => {
    try {
        const { nivel, descripcion } = req.body;
        

        if (!nivel || nivel.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nivel es requerido'
            });
        }
        

        const nivelesPermitidos = ['Fácil', 'Medio', 'Difícil'];
        if (!nivelesPermitidos.includes(nivel.trim())) {
            return res.status(400).json({
                success: false,
                message: 'El nivel debe ser uno de: Fácil, Medio, Difícil',
                valores_permitidos: nivelesPermitidos
            });
        }
        

        if (descripcion && descripcion.trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: 'La descripción no puede exceder 255 caracteres'
            });
        }
        
  
        const nivelExistente = await NivelDificultad.findOne({ 
            nivel: nivel.trim(),
            activo: true 
        });
        
        if (nivelExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un nivel de dificultad con ese valor'
            });
        }
        
        
        const nuevoNivel = await NivelDificultad.create({
            nivel: nivel.trim(),
            descripcion: descripcion ? descripcion.trim() : undefined
        });
        
        res.status(201).json({
            success: true,
            message: 'Nivel de dificultad creado exitosamente',
            data: nuevoNivel
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
            message: 'Error al crear nivel de dificultad',
            error: error.message
        });
    }
};


exports.actualizarNivel = async (req, res) => {
    try {
        const { id } = req.params;
        const { nivel, descripcion, activo } = req.body;
        

        const nivelDificultad = await NivelDificultad.findById(id);
        if (!nivelDificultad) {
            return res.status(404).json({
                success: false,
                message: 'Nivel de dificultad no encontrado'
            });
        }
   
        if (nivel !== undefined) {
            if (!nivel || nivel.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nivel no puede estar vacío'
                });
            }
           
            const nivelesPermitidos = ['Fácil', 'Medio', 'Difícil'];
            if (!nivelesPermitidos.includes(nivel.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'El nivel debe ser uno de: Fácil, Medio, Difícil',
                    valores_permitidos: nivelesPermitidos
                });
            }
            

            const nivelExistente = await NivelDificultad.findOne({ 
                nivel: nivel.trim(),
                _id: { $ne: id },
                activo: true
            });
            
            if (nivelExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro nivel de dificultad con ese valor'
                });
            }
            
            nivelDificultad.nivel = nivel.trim();
        }
        

        if (descripcion !== undefined) {
            if (descripcion && descripcion.trim().length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'La descripción no puede exceder 255 caracteres'
                });
            }
            nivelDificultad.descripcion = descripcion ? descripcion.trim() : '';
        }

        if (activo !== undefined) {
            if (typeof activo !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'El campo activo debe ser true o false'
                });
            }
            nivelDificultad.activo = activo;
        }
        
        await nivelDificultad.save();
        
        res.status(200).json({
            success: true,
            message: 'Nivel de dificultad actualizado exitosamente',
            data: nivelDificultad
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
            message: 'Error al actualizar nivel de dificultad',
            error: error.message
        });
    }
};

exports.eliminarNivel = async (req, res) => {
    try {
        const { id } = req.params;
        
        const nivel = await NivelDificultad.findById(id);
        
        if (!nivel) {
            return res.status(404).json({
                success: false,
                message: 'Nivel de dificultad no encontrado'
            });
        }
        

        nivel.activo = false;
        await nivel.save();
        
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
