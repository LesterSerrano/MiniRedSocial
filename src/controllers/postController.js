const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');

// Crear un nuevo post
exports.crearPost = async (req, res) => {
  try {
    const { autor, texto } = req.body;
    let imagenUrl = '';

    if(!texto){
      return  res.status(400).json({ mensaje: 'El texto del post no puede estar vacío' });
    }

    if(!mongoose.Types.ObjectId.isValid(autor)){
      return res.status(400).json({ mensaje: 'Autor inválido' });
    }

    if (req.file) {
      // Guardamos la ruta relativa de la imagen
      imagenUrl = `/uploads/${req.file.filename}`;
    }

    const post = new Post({
      autor: autor,
      texto,
      imagen: imagenUrl,
      likes: 0,
      fechaCreacion: new Date()
    });

    await post.save();

    await post.populate('autor', 'nombre email'); // asegura que autor venga con nombre/email
    res.json({ mensaje: 'Post creado exitosamente', post });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el post', error: error.message });
  }
};

// Obtener todos los posts
exports.obtenerPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('autor', 'nombre email');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los posts', error: error.message });
  }
};

// Editar un post existente
exports.actualizarPost = async (req, res) => {
  try {
    const { id } = req.params;
    const postActualizado = await Post.findByIdAndUpdate(id, req.body, { new: true });
    if (!postActualizado) return res.status(404).json({ mensaje: 'Post no encontrado' });

    res.json({ mensaje: 'Post actualizado', post: postActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el post', error: error.message });
  }
};

// Eliminar un post
exports.eliminarPost = async (req, res) => {
  try {
    const { id } = req.params;
    const postEliminado = await Post.findByIdAndDelete(id);
    if (!postEliminado) return res.status(404).json({ mensaje: 'Post no encontrado' });

    res.json({ mensaje: 'Post eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el post', error: error.message });
  }
};

// Dar like a un post
exports.darLikePost = async (req, res) => {
  try {
    const { id } = req.params; // id del post
    const { userId } = req.body; // id del usuario que da like

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ mensaje: 'Post no encontrado' });
    }

    // Incrementa likes
    post.likes += 1;
    await post.save();

    // Emitir notificación en tiempo real al autor del post
    const io = req.app.get('io');
    if(io){
      const usuario = await User.findById(userId); // buscamos el usuario que dio like
      io.emit(`notificacion-${post.autor}`, {
      tipo: 'like',
      mensaje: `Tu post recibió un like de ${usuario.nombre}`, // ahora muestra el nombre
      postId: post._id,
      fromUserId: userId
    });

  } else{
    console.log('Socket.io no está disponible, no se puede enviar notificación');
    }

    res.json({
      mensaje: 'Like agregado', likes: post.likes});
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al dar like', error: error.message });
  }
};

// Obtener posts de los usuarios que sigo
exports.obtenerPostsSeguidos = async (req, res) => {
  try {
    const { userId } = req.params; // ID del usuario logueado

    const usuario = await User.findById(userId);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Obtenemos los posts de los usuarios que sigue
    const posts = await Post.find({ autor: { $in: usuario.seguidos } })
      .populate('autor', 'nombre') // Solo traemos el nombre del autor
      .sort({ fechaCreacion: -1 }); // Más recientes primero

    res.json(posts);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener posts de seguidos', error: error.message });
  }
};

