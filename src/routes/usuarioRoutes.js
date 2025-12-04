// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarPrivilegio } = require('../middleware/rbac');


router.get('/', 
    verificarToken, 
    verificarPrivilegio('gestionar_usuarios'),
    usuarioController.obtenerUsuarios
);

router.get('/:id', 
    verificarToken,
    usuarioController.obtenerUsuarioPorId
);


router.post('/', 
    verificarToken, 
    verificarPrivilegio('gestionar_usuarios'),
    usuarioController.crearUsuario
);

router.put('/:id', 
    verificarToken,
    usuarioController.actualizarUsuario
);


router.delete('/:id', 
    verificarToken, 
    verificarPrivilegio('gestionar_usuarios'),
    usuarioController.eliminarUsuario
);

router.post('/:id/roles', 
    verificarToken, 
    verificarPrivilegio('gestionar_usuarios'),
    usuarioController.asignarRol
);

router.delete('/:id/roles/:rolId', 
    verificarToken, 
    verificarPrivilegio('gestionar_usuarios'),
    usuarioController.removerRol
);

router.get('/:id/privilegios', 
    verificarToken,
    usuarioController.obtenerPrivilegiosUsuario
);

router.put('/:id/password', 
    verificarToken, 
    verificarPrivilegio('gestionar_usuarios'),
    usuarioController.cambiarPassword
);

module.exports = router;