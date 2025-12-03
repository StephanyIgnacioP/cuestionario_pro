// src/controllers/usuarioController.js
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');


exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find({ estado: { $ne: 'inactivo' } })
            .populate('roles', 'nombre_rol descripcion')
            .select('-password')
            .sort({ nombre: 1 });
        
        res.status(200).json({
            success: true,
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


exports.obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const usuario = await Usuario.findById(id)
            .populate('roles', 'nombre_rol descripcion privilegios')
            .select('-password');
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: usuario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: error.message
        });
    }
};


exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, apellido, email, password, roles } = req.body;
        

        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido, email y contraseña son requeridos'
            });
        }
        

        const usuarioExistente = await Usuario.buscarPorEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con ese email'
            });
        }
        

        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            email,
            password,
            roles: roles || []
        });
        
       
        await nuevoUsuario.populate('roles', 'nombre_rol descripcion');
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: nuevoUsuario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }
};


exports.actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, estado } = req.body;
        
       
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        
        if (email && email !== usuario.email) {
            const emailExiste = await Usuario.buscarPorEmail(email);
            if (emailExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro usuario con ese email'
                });
            }
        }
        
        // Actualizar campos
        if (nombre) usuario.nombre = nombre;
        if (apellido) usuario.apellido = apellido;
        if (email) usuario.email = email;
        if (estado) usuario.estado = estado;
        
        await usuario.save();
        await usuario.populate('roles', 'nombre_rol descripcion');
        
        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: usuario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: error.message
        });
    }
};


exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const usuario = await Usuario.findByIdAndUpdate(
            id,
            { estado: 'inactivo' },
            { new: true }
        ).select('-password');
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Usuario desactivado exitosamente',
            data: usuario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
            error: error.message
        });
    }
};


exports.asignarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { rolId } = req.body;
        
        if (!rolId) {
            return res.status(400).json({
                success: false,
                message: 'El ID del rol es requerido'
            });
        }
        
        
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        
        const rol = await Rol.findById(rolId);
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }
        
        
        await usuario.agregarRol(rolId);
        await usuario.populate('roles', 'nombre_rol descripcion');
        
        res.status(200).json({
            success: true,
            message: 'Rol asignado exitosamente',
            data: usuario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al asignar rol',
            error: error.message
        });
    }
};


exports.removerRol = async (req, res) => {
    try {
        const { id, rolId } = req.params;
        
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        await usuario.removerRol(rolId);
        await usuario.populate('roles', 'nombre_rol descripcion');
        
        res.status(200).json({
            success: true,
            message: 'Rol removido exitosamente',
            data: usuario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al remover rol',
            error: error.message
        });
    }
};

exports.obtenerPrivilegiosUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const usuario = await Usuario.findById(id).populate('roles');
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const privilegios = await usuario.obtenerTodosPrivilegios();
        
        res.status(200).json({
            success: true,
            data: {
                usuario: {
                    id: usuario._id,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email
                },
                privilegios: privilegios
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener privilegios',
            error: error.message
        });
    }
};

exports.cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { passwordActual, passwordNuevo } = req.body;
        
        if (!passwordActual || !passwordNuevo) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva son requeridas'
            });
        }
        
        const usuario = await Usuario.findById(id).select('+password');
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const passwordValido = await usuario.compararPassword(passwordActual);
        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }
        
        
        usuario.password = passwordNuevo;
        await usuario.save();
        
        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};