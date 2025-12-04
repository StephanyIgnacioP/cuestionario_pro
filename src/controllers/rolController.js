// src/controllers/rangoEdadController.js
const RangoEdad = require('../models/RangoEdad');


exports.obtenerRangos = async (req, res) => {
    try {
        const rangos = await RangoEdad.find({ activo: true })
            .sort({ edad_minima: 1 });
        
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


exports.buscarRangoPorEdad = async (req, res) => {
    try {
        const { edad } = req.params;
        

        const edadNum = parseInt(edad);
        if (isNaN(edadNum)) {
            return res.status(400).json({
                success: false,
                message: 'La edad debe ser un número válido'
            });
        }
        
        const rango = await RangoEdad.findOne({
            edad_minima: { $lte: edadNum },
            edad_maxima: { $gte: edadNum },
            activo: true
        });
        
        if (!rango) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró un rango de edad para la edad especificada'
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


exports.crearRango = async (req, res) => {
    try {
        const { nombre_rango, edad_minima, edad_maxima } = req.body;
        

        if (!nombre_rango || nombre_rango.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre del rango es requerido'
            });
        }
        

        if (nombre_rango.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: 'El nombre no puede exceder 50 caracteres'
            });
        }
        

        if (edad_minima === undefined || edad_minima === null || edad_minima === '') {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima es requerida'
            });
        }
        

        const edadMin = Number(edad_minima);
        if (isNaN(edadMin)) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima debe ser un número válido'
            });
        }
        

        if (edadMin < 0) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima no puede ser negativa'
            });
        }
        

        if (edad_maxima === undefined || edad_maxima === null || edad_maxima === '') {
            return res.status(400).json({
                success: false,
                message: 'La edad máxima es requerida'
            });
        }
        

        const edadMax = Number(edad_maxima);
        if (isNaN(edadMax)) {
            return res.status(400).json({
                success: false,
                message: 'La edad máxima debe ser un número válido'
            });
        }
        

        if (edadMin >= edadMax) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima debe ser menor que la edad máxima',
                datos_enviados: {
                    edad_minima: edadMin,
                    edad_maxima: edadMax
                }
            });
        }
        

        if (edadMax > 150) {
            return res.status(400).json({
                success: false,
                message: 'La edad máxima no puede ser mayor a 150 años'
            });
        }
        

        const rangoExistente = await RangoEdad.findOne({ 
            nombre_rango: nombre_rango.trim(),
            activo: true 
        });
        
        if (rangoExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un rango de edad con ese nombre'
            });
        }
        

        const rangosSolapados = await RangoEdad.find({
            activo: true,
            $or: [

                { edad_minima: { $lte: edadMin }, edad_maxima: { $gte: edadMin } },
                { edad_minima: { $lte: edadMax }, edad_maxima: { $gte: edadMax } },
                { edad_minima: { $gte: edadMin }, edad_maxima: { $lte: edadMax } }
            ]
        });
        
        if (rangosSolapados.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El rango de edad se solapa con rangos existentes',
                rangos_solapados: rangosSolapados.map(r => ({
                    nombre: r.nombre_rango,
                    rango: `${r.edad_minima} - ${r.edad_maxima}`
                }))
            });
        }
        

        const nuevoRango = await RangoEdad.create({
            nombre_rango: nombre_rango.trim(),
            edad_minima: edadMin,
            edad_maxima: edadMax
        });
        
        res.status(201).json({
            success: true,
            message: 'Rango de edad creado exitosamente',
            data: nuevoRango
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
            message: 'Error al crear rango de edad',
            error: error.message
        });
    }
};


exports.actualizarRango = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_rango, edad_minima, edad_maxima, activo } = req.body;
        
       
        const rango = await RangoEdad.findById(id);
        if (!rango) {
            return res.status(404).json({
                success: false,
                message: 'Rango de edad no encontrado'
            });
        }
        

        let edadMin = rango.edad_minima;
        let edadMax = rango.edad_maxima;
        

        if (nombre_rango !== undefined) {
            if (!nombre_rango || nombre_rango.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del rango no puede estar vacío'
                });
            }
            
            if (nombre_rango.trim().length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder 50 caracteres'
                });
            }
            

            const rangoExistente = await RangoEdad.findOne({ 
                nombre_rango: nombre_rango.trim(),
                _id: { $ne: id },
                activo: true
            });
            
            if (rangoExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro rango de edad con ese nombre'
                });
            }
            
            rango.nombre_rango = nombre_rango.trim();
        }
        

        if (edad_minima !== undefined) {
            const edadMinNum = Number(edad_minima);
            if (isNaN(edadMinNum)) {
                return res.status(400).json({
                    success: false,
                    message: 'La edad mínima debe ser un número válido'
                });
            }
            
            if (edadMinNum < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La edad mínima no puede ser negativa'
                });
            }
            
            edadMin = edadMinNum;
            rango.edad_minima = edadMinNum;
        }
        

        if (edad_maxima !== undefined) {
            const edadMaxNum = Number(edad_maxima);
            if (isNaN(edadMaxNum)) {
                return res.status(400).json({
                    success: false,
                    message: 'La edad máxima debe ser un número válido'
                });
            }
            
            if (edadMaxNum > 150) {
                return res.status(400).json({
                    success: false,
                    message: 'La edad máxima no puede ser mayor a 150 años'
                });
            }
            
            edadMax = edadMaxNum;
            rango.edad_maxima = edadMaxNum;
        }
        

        if (edadMin >= edadMax) {
            return res.status(400).json({
                success: false,
                message: 'La edad mínima debe ser menor que la edad máxima',
                valores_actuales: {
                    edad_minima: edadMin,
                    edad_maxima: edadMax
                }
            });
        }
        

        if (activo !== undefined) {
            if (typeof activo !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'El campo activo debe ser true o false'
                });
            }
            rango.activo = activo;
        }
        
        await rango.save();
        
        res.status(200).json({
            success: true,
            message: 'Rango de edad actualizado exitosamente',
            data: rango
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
            message: 'Error al actualizar rango de edad',
            error: error.message
        });
    }
};


exports.eliminarRango = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rango = await RangoEdad.findById(id);
        
        if (!rango) {
            return res.status(404).json({
                success: false,
                message: 'Rango de edad no encontrado'
            });
        }
        

        rango.activo = false;
        await rango.save();
        
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