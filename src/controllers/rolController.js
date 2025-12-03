// src/controllers/rolController.js
const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');


exports.obtenerRoles = async (req, res) => {
    try {
        const roles = await Rol.find({ activo: true }).sort({ nombre_rol: 1 });
        
        res.status(200).json({
            success: true,
            cantidad: roles.length,
            data: roles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener roles',
            error: error.message
        });
    }
};


exports.obtenerRolPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rol = await Rol.findById(id);
        
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }
        
      
        const cantidadUsuarios = await Rol.contarUsuarios(id);
        
        res.status(200).json({
            success: true,
            data: {
                ...rol.toObject(),
                cantidad_usuarios: cantidadUsuarios
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener rol',
            error: error.message
        });
    }
};


exports.crearRol = async (req, res) => {
    try {
        const { nombre_rol, descripcion, privilegios } = req.body;
       
        if (!nombre_rol) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del rol es requerido'
            });
        }
        
    
        const rolExistente = await Rol.buscarPorNombre(nombre_rol);
        if (rolExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un rol con ese nombre'
            });
        }
        
        
        const nuevoRol = await Rol.create({
            nombre_rol,
            descripcion,
            privilegios: privilegios || []
        });
        
        res.status(201).json({
            success: true,
            message: 'Rol creado exitosamente',
            data: nuevoRol
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear rol',
            error: error.message
        });
    }
};


exports.actualizarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_rol, descripcion, privilegios, activo } = req.body;
        
        const rol = await Rol.findById(id).select('+es_sistema');
        
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }
        
        if (rol.es_sistema) {
            return res.status(403).json({
                success: false,
                message: 'No se pueden editar roles del sistema'
            });
        }
        
        
        if (nombre_rol && nombre_rol !== rol.nombre_rol) {
            const rolExistente = await Rol.buscarPorNombre(nombre_rol);
            if (rolExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro rol con ese nombre'
                });
            }
        }
        
        // Actualizar campos
        if (nombre_rol) rol.nombre_rol = nombre_rol;
        if (descripcion !== undefined) rol.descripcion = descripcion;
        if (privilegios !== undefined) rol.privilegios = privilegios;
        if (activo !== undefined) rol.activo = activo;
        
        await rol.save();
        
        res.status(200).json({
            success: true,
            message: 'Rol actualizado exitosamente',
            data: rol
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar rol',
            error: error.message
        });
    }
};


exports.eliminarRol = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rol = await Rol.findById(id).select('+es_sistema');
        
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }
        
        
        if (rol.es_sistema) {
            return res.status(403).json({
                success: false,
                message: 'No se pueden eliminar roles del sistema'
            });
        }
        
        
        const cantidadUsuarios = await Rol.contarUsuarios(id);
        if (cantidadUsuarios > 0) {
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar el rol porque tiene ${cantidadUsuarios} usuario(s) asignado(s)`
            });
        }
        
        rol.activo = false;
        await rol.save();
        
        res.status(200).json({
            success: true,
            message: 'Rol desactivado exitosamente',
            data: rol
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar rol',
            error: error.message
        });
    }
};


exports.agregarPrivilegio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_privilegio, descripcion } = req.body;
        
        if (!nombre_privilegio) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del privilegio es requerido'
            });
        }
        
        const rol = await Rol.findById(id);
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }
        
        await rol.agregarPrivilegio(nombre_privilegio, descripcion);
        
        res.status(200).json({
            success: true,
            message: 'Privilegio agregado exitosamente',
            data: rol
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al agregar privilegio',
            error: error.message
        });
    }
};


exports.removerPrivilegio = async (req, res) => {
    try {
        const { id, nombrePrivilegio } = req.params;
        
        const rol = await Rol.findById(id);
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }
        
        await rol.removerPrivilegio(nombrePrivilegio);
        
        res.status(200).json({
            success: true,
            message: 'Privilegio removido exitosamente',
            data: rol
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al remover privilegio',
            error: error.message
        });
    }
};


exports.obtenerUsuariosConRol = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rol = await Rol.findById(id);
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }
        
        const usuarios = await Usuario.find({ roles: id })
            .select('nombre apellido email estado')
            .sort({ nombre: 1 });
        
        res.status(200).json({
            success: true,
            rol: {
                id: rol._id,
                nombre: rol.nombre_rol
            },
            cantidad: usuarios.length,
            data: usuarios
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
};