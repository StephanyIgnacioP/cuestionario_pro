// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('/controllers/usuarioController');
const { proteger, autorizarRoles, autorizarPrivilegios, soloUsuarioOAdmin } = require('../middleware/auth');


router.get('/', 
    proteger, 
    autorizarPrivilegios('gestionar_usuarios'),
    usuarioController.obtenerUsuarios
);


router.get('/:id', 
    proteger, 
    soloUsuarioOAdmin,
    usuarioController.obtenerUsuarioPorId
);


router.post('/', 
    proteger, 
    autorizarPrivilegios('gestionar_usuarios'),
    usuarioController.crearUsuario
);


router.put('/:id', 
    proteger, 
    soloUsuarioOAdmin,
    usuarioController.actualizarUsuario
);


router.delete('/:id', 
    proteger, 
    autorizarPrivilegios('gestionar_usuarios'),
    usuarioController.eliminarUsuario
);


router.post('/:id/roles', 
    proteger, 
    autorizarPrivilegios('gestionar_usuarios'),
    usuarioController.asignarRol
);


router.delete('/:id/roles/:rolId', 
    proteger, 
    autorizarPrivilegios('gestionar_usuarios'),
    usuarioController.removerRol
);


router.get('/:id/privilegios', 
    proteger, 
    soloUsuarioOAdmin,
    usuarioController.obtenerPrivilegiosUsuario
);


router.put('/:id/password', 
    proteger, 
    autorizarPrivilegios('gestionar_usuarios'),
    usuarioController.cambiarPassword
);

module.exports = router;