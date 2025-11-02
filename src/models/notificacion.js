// models/Notificacion.js
const mongoose = require("mongoose");

const NotificacionSchema = new mongoose.Schema(
  {
    receptor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    tipo: {
      type: String,
      enum: ["like", "comentario", "seguimiento"], 
      required: true,
    },
    leida: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notificacion", NotificacionSchema);
