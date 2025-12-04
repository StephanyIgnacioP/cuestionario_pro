// src/controllers/privilegioController.js
const Privilegio = require('../models/Privilegio');
exports.obtenerPrivilegios = async (req, res) => {
    try {
        const privilegios = await Privilegio.find({ activo: true })
            .sort({ categoria: 1, nombre_privilegio: 1 });
        
        res.status(200).json({
            success: true,
            cantidad: privilegios.length,
            data: privilegios
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener privilegios',
            error: error.message
        });
    }
};

exports.obtenerPrivilegiosAgrupados = async (req, res) => {
    try {
        const privilegiosAgrupados = await Privilegio.obtenerAgrupados();
        
        res.status(200).json({
            success: true,
            data: privilegiosAgrupados
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener privilegios agrupados',
            error: error.message
        });
    }
};

exports.obtenerPrivilegiosPorCategoria = async (req, res) => {
    try {
        const { categoria } = req.params;
        
        const categorias = ['preguntas', 'examenes', 'administracion', 'reportes'];
        if (!categorias.includes(categoria)) {
            return res.status(400).json({
                success: false,
                message: 'Categoría no válida',
                categorias_validas: categorias
            });
        }
        
        const privilegios = await Privilegio.obtenerPorCategoria(categoria);
        
        res.status(200).json({
            success: true,
            categoria: categoria,
            cantidad: privilegios.length,
            data: privilegios
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener privilegios por categoría',
            error: error.message
        });
    }
};

exports.obtenerPrivilegioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const privilegio = await Privilegio.findById(id);
        
        if (!privilegio) {
            return res.status(404).json({
                success: false,
                message: 'Privilegio no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: privilegio
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener privilegio',
            error: error.message
        });
    }
};