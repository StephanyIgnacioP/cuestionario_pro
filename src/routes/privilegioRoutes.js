// src/routes/privilegioRoutes.js
const express = require('express');
const router = express.Router();
const privilegioController = require('../controllers/privilegioController');
const { proteger } = require('../middleware/auth');


router.get('/', 
    proteger,
    privilegioController.obtenerPrivilegios
);


router.get('/agrupados', 
    proteger,
    privilegioController.obtenerPrivilegiosAgrupados
);


router.get('/categoria/:categoria', 
    proteger,
    privilegioController.obtenerPrivilegiosPorCategoria
);


router.get('/:id', 
    proteger,
    privilegioController.obtenerPrivilegioPorId
);

module.exports = router;