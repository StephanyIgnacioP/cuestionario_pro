// src/controllers/usuarioController.js
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find({ estado: { $ne: 'inactivo' } })
            .populate('roles', 'nombre_rol')
            .select('-password')
            .sort({ fecha_registro: -1 });
        
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
            .populate('roles', 'nombre_rol privilegios')
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
        
        const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }
        
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            email,
            password,
            roles: roles || []
        });
        
        const usuarioCreado = await Usuario.findById(nuevoUsuario._id)
            .populate('roles', 'nombre_rol')
            .select('-password');
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: usuarioCreado
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
            const emailExiste = await Usuario.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: id }
            });
            if (emailExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso'
                });
            }
            usuario.email = email;
        }
        
        if (nombre) usuario.nombre = nombre;
        if (apellido) usuario.apellido = apellido;
        if (estado) usuario.estado = estado;
        
        await usuario.save();
        
        const usuarioActualizado = await Usuario.findById(id)
            .populate('roles', 'nombre_rol')
            .select('-password');
        
        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: usuarioActualizado
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
        
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        usuario.estado = 'inactivo';
        await usuario.save();
        
        res.status(200).json({
            success: true,
            message: 'Usuario desactivado exitosamente'
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
        
        if (usuario.roles.includes(rolId)) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya tiene este rol'
            });
        }
        
        usuario.roles.push(rolId);
        await usuario.save();
        
        const usuarioActualizado = await Usuario.findById(id)
            .populate('roles', 'nombre_rol')
            .select('-password');
        
        res.status(200).json({
            success: true,
            message: 'Rol asignado exitosamente',
            data: usuarioActualizado
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
        
        usuario.roles = usuario.roles.filter(r => r.toString() !== rolId);
        await usuario.save();
        
        const usuarioActualizado = await Usuario.findById(id)
            .populate('roles', 'nombre_rol')
            .select('-password');
        
        res.status(200).json({
            success: true,
            message: 'Rol removido exitosamente',
            data: usuarioActualizado
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
        
        const usuario = await Usuario.findById(id)
            .populate('roles', 'nombre_rol privilegios');
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const privilegios = usuario.obtenerTodosPrivilegios();
        
        res.status(200).json({
            success: true,
            data: privilegios
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
        const { password } = req.body;
        
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        usuario.password = password;
        await usuario.save();
        
        res.status(200).json({
            success: true,
            message: 'Password actualizado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar password',
            error: error.message
        });
    }
};