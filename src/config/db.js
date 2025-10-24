// src/config/db.js
const mongoose = require('mongoose');

// Evitar que Mongoose guarde operaciones en buffer durante reconexiones prolongadas
mongoose.set('bufferCommands', false);

/**
 * Conecta a MongoDB con reintentos básicos.
 * No llama a process.exit(1) para permitir que el servidor siga arriba
 * incluso si la base de datos no está disponible (útil en desarrollo).
 */
const connectDB = async (opts = {}) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI no está definida en las variables de entorno');
    return false;
  }

  const maxRetries = opts.retries ?? 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt += 1;
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return true;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
      if (attempt < maxRetries) {
        const delay = 500 * attempt; // backoff simple
        console.log(`Reintentando en ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        console.error('No se pudo conectar a MongoDB tras varios intentos. Seguiré sin cerrarme.');
        // No hacemos process.exit para que el servidor pueda levantarse y mostrar rutas
        return false;
      }
    }
  }
};

module.exports = connectDB;
