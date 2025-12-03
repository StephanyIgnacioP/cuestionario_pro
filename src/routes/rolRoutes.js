// src/routes/rolRoutes.js
const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const { proteger, autorizarPrivilegios } = require('../middleware/auth');


router.get('/', 
    proteger, 
    autorizarPrivilegios('gestionar_roles'),
    rolController.obtenerRoles
);


router.get('/:id', 
    proteger, 
    autorizarPrivilegios('gestionar_roles'),
    rolController.obtenerRolPorId
);


router.post('/', 
    proteger, 
    autorizarPrivilegios('gestionar_roles'),
    rolController.crearRol
);


router.put('/:id', 
    proteger, 
    autorizarPrivilegios('gestionar_roles'),
    rolController.actualizarRol
);


router.delete('/:id', 
    proteger, 
    autorizarPrivilegios('gestionar_roles'),
    rolController.eliminarRol
);


router.post('/:id/privilegios', 
    proteger, 
    autorizarPrivilegios('gestionar_roles'),
    rolController.agregarPrivilegio
);


router.delete('/:id/privilegios/:nombrePrivilegio', 
    proteger, 
    autorizarPrivilegios('gestionar_roles'),
    rolController.removerPrivilegio
);


router.get('/:id/usuarios', 
    proteger, 
    autorizarPrivilegios('gestionar_roles', 'gestionar_usuarios'),
    rolController.obtenerUsuariosConRol
);

module.exports = router;