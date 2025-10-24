const user = require('../models/user');

// Seguir a un usuario
exports.seguirUsuario = async (req, res) => {
  try {
    const { id } = req.params; // usuario a seguir
    const { userId } = req.body; // usuario que sigue

    if (id === userId) {
      return res.status(400).json({ mensaje: 'No puedes seguirte a ti mismo' });
    }

    const usuarioASeguir = await user.findById(id);
    const usuarioQueSigue = await user.findById(userId);

    if (!usuarioASeguir || !usuarioQueSigue) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (usuarioASeguir.seguidores.includes(userId)) {
      return res.status(400).json({ mensaje: 'Ya sigues a este usuario' });
    }

    usuarioASeguir.seguidores.push(userId);
    usuarioQueSigue.seguidos.push(id);

    await usuarioASeguir.save();
    await usuarioQueSigue.save();

    // Emitir notificación en tiempo real
    const io = req.app.get('io');
    io.emit(`notificacion-${id}`, {
      tipo: 'nuevo-seguidor',
      mensaje: `${usuarioQueSigue.nombre} te está siguiendo`
    });

    res.json({ mensaje: 'Usuario seguido correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al seguir usuario', error: error.message });
  }
};

// Dejar de seguir a un usuario
exports.dejarDeSeguirUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const usuarioASeguir = await user.findById(id);
    const usuarioQueSigue = await user.findById(userId);

    if (!usuarioASeguir || !usuarioQueSigue) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    usuarioASeguir.seguidores = usuarioASeguir.seguidores.filter(
      seguidor => seguidor.toString() !== userId
    );
    usuarioQueSigue.seguidos = usuarioQueSigue.seguidos.filter(
      seguido => seguido.toString() !== id
    );

    await usuarioASeguir.save();
    await usuarioQueSigue.save();

    res.json({ mensaje: 'Has dejado de seguir a este usuario' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al dejar de seguir usuario', error: error.message });
  }
};
