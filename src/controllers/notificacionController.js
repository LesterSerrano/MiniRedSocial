const moongose = require('mongoose');
const notificacion = require('../models/notificacion');

const notificacionController = {
  // Obtener todas las notificaciones de un usuario
  async obtenerPorUsuario(req, res) {
    try {
      const { userId } = req.params;

      const notificaciones = await notificacion.find({ receptor: userId })
        .populate("emisor", "nombre username")
        .populate("post", "texto imagen")
        .sort({ createdAt: -1 });

      res.json(notificaciones);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener las notificaciones" });
    }
  },

  // Marcar una notificación como leída
  async marcarLeida(req, res) {
    try {
      const { id } = req.params;
      await Notificacion.findByIdAndUpdate(id, { leida: true });
      res.json({ message: "Notificación marcada como leída" });
    } catch (err) {
      res.status(500).json({ error: "Error al actualizar la notificación" });
    }
  },
};

module.exports = notificacionController;