const express = require("express");
const notificacion = require("../models/notificacion");
const router = express.Router();
const notificacionController = require("../controllers/notificacionController");

router.get("/:userId", notificacionController.obtenerPorUsuario);
router.put("/:id/leida", notificacionController.marcarLeida);

module.exports = router;
