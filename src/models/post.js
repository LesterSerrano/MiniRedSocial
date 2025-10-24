const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  texto: { type: String, required: true },
  imagen: { type: String },
  likes: { type: Number, default: 0 },
  fecha: { type: Date, default: Date.now },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('post', postSchema);
