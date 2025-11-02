const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const Notificacion = require('../models/notificacion');

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
    const { id } = req.params; // ID del post
    const userId = req.body.userId;
    
    if (!req.body || !req.body.userId) {
      return res.status(400).json({ mensaje: 'Se requiere el userId para eliminar el post' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ mensaje: 'Post no encontrado' });
    }

    // Verificar si el usuario es el autor del post
    if (post.autor.toString() !== userId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este post' });
    }

    await Post.findByIdAndDelete(id);

    res.json({ mensaje: 'Post eliminado correctamente' });

  } catch (error) {
    console.error('Error al eliminar el post:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el post', error: error.message });
  }
};


// Dar like a un post
exports.darLikePost = async (req, res) => {
  try {
    const { id } = req.params; // id del post
    const { userId } = req.body; // id del usuario que da like

    if (!userId) {
      return res.status(400).json({ mensaje: 'Se requiere el userId para dar like' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ mensaje: 'Post no encontrado' });
    }

    const io = req.app.get('io');

    // Si el usuario ya dio like → quitarlo
    if (post.usuariosLike.includes(userId)) {
      post.likes -= 1;
      post.usuariosLike = post.usuariosLike.filter(uid => uid.toString() !== userId);
      await post.save();

      // Eliminar la notificación relacionada (si existe)
      await Notificacion.findOneAndDelete({
        emisor: userId,
        receptor: post.autor,
        post: post._id,
        tipo: 'like'
      });

      if (io) {
        io.to(post.autor.toString()).emit("notificacion", {
          tipo: "like",
          accion: "unlike",
          postId: post._id,
          fromUserId: userId,
        });
      }

      return res.json({ mensaje: "Like removido", likes: post.likes });
    }

    // Si el usuario NO ha dado like → agregarlo
    post.likes += 1;
    post.usuariosLike.push(userId);
    await post.save();

    // Crear la notificación persistente
    if (post.autor.toString() !== userId.toString()) {
      await Notificacion.create({
        receptor: post.autor,
        emisor: userId,
        post: post._id,
        tipo: "like",
      });

      // Emitir evento de notificación al autor del post
      if (io) {
        io.to(post.autor.toString()).emit("notificacion", {
          tipo: "like",
          accion: "like",
          postId: post._id,
          fromUserId: userId,
        });
      }
    }

    return res.json({ mensaje: "Like agregado", likes: post.likes });

  } catch (error) {
    console.error("Error al dar like:", error);
    res.status(500).json({ mensaje: "Error al dar like al post" });
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

