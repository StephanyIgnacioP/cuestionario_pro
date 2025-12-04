// src/routes/rolRoutes.js
const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const { verificarToken, verificarPrivilegio } = require('../middleware/rbac');


router.get('/', 
    verificarToken, 
    verificarPrivilegio('gestionar_roles'),
    rolController.obtenerRoles
);

router.get('/:id', 
    verificarToken, 
    verificarPrivilegio('gestionar_roles'),
    rolController.obtenerRolPorId
);


router.post('/', 
    verificarToken, 
    verificarPrivilegio('gestionar_roles'),
    rolController.crearRol
);

router.put('/:id', 
    verificarToken, 
    verificarPrivilegio('gestionar_roles'),
    rolController.actualizarRol
);

router.delete('/:id', 
    verificarToken, 
    verificarPrivilegio('gestionar_roles'),
    rolController.eliminarRol
);

router.post('/:id/privilegios', 
    verificarToken, 
    verificarPrivilegio('gestionar_roles'),
    rolController.agregarPrivilegio
);

router.delete('/:id/privilegios/:nombrePrivilegio', 
    verificarToken, 
    verificarPrivilegio('gestionar_roles'),
    rolController.removerPrivilegio
);

router.get('/:id/usuarios', 
    verificarToken, 
    verificarPrivilegio('gestionar_roles', 'gestionar_usuarios'),
    rolController.obtenerUsuariosConRol
);

module.exports = router;