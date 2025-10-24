const express = require('express');
const Post = require('../models/post');
const router = express.Router();
const upload = require('../middleware/upload'); // importamos Multer
const path = require('path');
const postController = require('../controllers/postController');

// ⚠️ Ruta temporal para eliminar todos los posts
router.delete('/limpiar', async (req, res) => {
  try {
    await Post.deleteMany({});
    res.json({ mensaje: 'Todos los posts fueron eliminados correctamente' });
  } catch (error) {
    console.error('Error al limpiar posts:', error);
    res.status(500).json({ mensaje: 'Error al limpiar posts', error });
  }
});

// Crear un nuevo post con imagen
router.post('/', upload.single('imagen'), postController.crearPost);
// Ruta para obtener todos los posts
router.get('/', postController.obtenerPosts);
// Ruta para actualizar un post existente
router.put('/:id', postController.actualizarPost);
// Ruta para eliminar un post
router.delete('/:id', postController.eliminarPost);
//Dar like a un post
router.post('/:id/like', postController.darLikePost);
// Obtener feed de usuarios que sigo
router.get('/feed/:userId', postController.obtenerPostsSeguidos);



module.exports = router;
