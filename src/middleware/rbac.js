
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

exports.verificarToken = async (req, res, next) => {
    try {
        let token;
        
        // Obtener token del header Authorization
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. No se proporcionó token de autenticación.'
            });
        }
        
        try {
            // Verificar y decodificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Obtener usuario de la base de datos
            const usuario = await Usuario.findById(decoded.id)
                .populate('roles', 'nombre_rol privilegios')
                .select('-password');
            
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            if (usuario.estado !== 'activo') {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo o suspendido'
                });
            }
            
            req.usuario = usuario;
            next();
            
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en la verificación del token',
            error: error.message
        });
    }
};

exports.verificarRol = (...rolesPermitidos) => {
    return async (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }
            
            const rolesUsuario = req.usuario.roles.map(rol => rol.nombre_rol);
            
            const tieneRol = rolesUsuario.some(rol => rolesPermitidos.includes(rol));
            
            if (!tieneRol) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes los permisos necesarios para realizar esta acción',
                    roles_requeridos: rolesPermitidos,
                    tus_roles: rolesUsuario
                });
            }
            
            next();
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error en la verificación de roles',
                error: error.message
            });
        }
    };
};

exports.verificarPrivilegio = (...privilegiosRequeridos) => {
    return async (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }
            
            const privilegiosUsuario = await req.usuario.obtenerTodosPrivilegios();
            
            // Verificar si tiene al menos uno de los privilegios requeridos
            const tienePrivilegio = privilegiosRequeridos.some(priv => 
                privilegiosUsuario.includes(priv)
            );
            
            if (!tienePrivilegio) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes los privilegios necesarios para realizar esta acción',
                    privilegios_requeridos: privilegiosRequeridos
                });
            }
            
            next();
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error en la verificación de privilegios',
                error: error.message
            });
        }
    };
};

exports.verificarPropietarioOAdmin = (campoUsuarioId = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }
            
            const recursoUsuarioId = req.params[campoUsuarioId] || req.body[campoUsuarioId];
            
            // Verificar si es administrador
            const rolesUsuario = req.usuario.roles.map(rol => rol.nombre_rol);
            const esAdmin = rolesUsuario.includes('Administrador');
            
            // Verificar si es el propietario
            const esPropietario = req.usuario._id.toString() === recursoUsuarioId;
            
            if (!esPropietario && !esAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a este recurso'
                });
            }
            
            next();
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error en la verificación de permisos',
                error: error.message
            });
        }
    };
};


exports.devBypass = (req, res, next) => {
    
    if (process.env.NODE_ENV !== 'development') {
        return next();
    }
    
    if (process.env.DEV_BYPASS === 'true') {
        console.log(' MODO DESARROLLO: Bypass de autenticación activado');
        req.usuario = {
            _id: 'dev_user_id',
            nombre: 'Dev',
            apellido: 'User',
            email: 'dev@example.com',
            roles: [{ nombre_rol: 'Administrador', privilegios: [] }],
            obtenerTodosPrivilegios: async () => [
                'crear_preguntas', 'editar_preguntas', 'eliminar_preguntas',
                'gestionar_usuarios', 'gestionar_roles', 'gestionar_categorias'
            ]
        };
    }
    
    next();
};