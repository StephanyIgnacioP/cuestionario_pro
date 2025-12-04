// src/routes/privilegioRoutes.js
const express = require('express');
const router = express.Router();
const privilegioController = require('../controllers/privilegioController');
const { verificarToken } = require('../middleware/rbac');

router.get('/', 
    verificarToken,
    privilegioController.obtenerPrivilegios
);


router.get('/agrupados', 
    verificarToken,
    privilegioController.obtenerPrivilegiosAgrupados
);


router.get('/categoria/:categoria', 
    verificarToken,
    privilegioController.obtenerPrivilegiosPorCategoria
);

router.get('/:id', 
    verificarToken,
    privilegioController.obtenerPrivilegioPorId
);

module.exports = router;