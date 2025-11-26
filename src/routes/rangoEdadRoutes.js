// src/routes/rangoEdadRoutes.js
const express = require('express');
const router = express.Router();
const rangoEdadController = require('../controllers/rangoEdadController');
router.get('/', rangoEdadController.obtenerRangos);
router.get('/:id', rangoEdadController.obtenerRangoPorId);
router.get('/edad/:edad', rangoEdadController.obtenerRangoPorEdad);
router.post('/', rangoEdadController.crearRango);
router.put('/:id', rangoEdadController.actualizarRango);
router.delete('/:id', rangoEdadController.eliminarRango);

module.exports = router;