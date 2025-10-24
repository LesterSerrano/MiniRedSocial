const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  contraseña: {
    type: String,
    required: true
  },
  seguidores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  seguidos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  fotoPerfil: {
    type: String,
    default: ''
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('user', UserSchema);
