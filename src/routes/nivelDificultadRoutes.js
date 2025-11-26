// src/routes/nivelDificultadRoutes.js
const express = require('express');
const router = express.Router();
const nivelDificultadController = require('../controllers/nivelDificultadController');

router.get('/', nivelDificultadController.obtenerNiveles);
router.get('/:id', nivelDificultadController.obtenerNivelPorId);
router.post('/', nivelDificultadController.crearNivel);
router.put('/:id', nivelDificultadController.actualizarNivel);
router.delete('/:id', nivelDificultadController.eliminarNivel);

module.exports = router;