const express = require('express');
const router = express.Router();
const User = require('../models/user');
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const generarToken = require('../config/generarToken');
const { protegerRuta } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

//Rutas
// Seguir y dejar de seguir
router.post('/:id/seguir', userController.seguirUsuario);
router.post('/:id/dejar-de-seguir', userController.dejarDeSeguirUsuario);

// Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, contraseña } = req.body;

    // Validar si ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ msg: 'Email ya registrado' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashContraseña = await bcrypt.hash(contraseña, salt);

    const nuevoUsuario = new User({ nombre, email, contraseña: hashContraseña });
    await nuevoUsuario.save();

    res.status(201).json({ msg: 'Usuario registrado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    const token = generarToken(usuario._id);

    res.json({
      msg: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');  
    }
  });
  
module.exports = router;

// Ruta protegida: perfil
router.get('/perfil', protegerRuta, (req, res) => {
  res.json({
    msg: 'Ruta protegida, usuario logueado:',
    usuario: req.usuario
  });
});

// Ruta temporal para listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await user.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
});


