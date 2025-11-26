// src/routes/subcategoriaRoutes.js
const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoriaController');

// Rutas básicas CRUD
router.get('/', subcategoriaController.obtenerSubcategorias);
router.get('/:id', subcategoriaController.obtenerSubcategoriaPorId);
router.post('/', subcategoriaController.crearSubcategoria);
router.put('/:id', subcategoriaController.actualizarSubcategoria);
router.delete('/:id', subcategoriaController.eliminarSubcategoria);

// Rutas específicas por categoría
router.get('/categoria/:categoriaId', subcategoriaController.obtenerSubcategoriasPorCategoria);
router.get('/categoria/:categoriaId/contar', subcategoriaController.contarSubcategoriasPorCategoria);

module.exports = router;