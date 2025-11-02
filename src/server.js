const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
// Habilitar CORS (ajustar origin en producción)
const cors = require('cors');
app.use(cors({
  origin: '*'
}));
// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static('uploads'));

// Rutas
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

const notificacionRoutes = require('./routes/notificacionRoutes');
app.use('/api/notificacion', notificacionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor corriendo');
});

// Crear servidor HTTP y configurar Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // temporalmente para pruebas, luego restringir a tu front
    methods: ["GET", "POST"]
  }
});

// Guardamos io en app para usarlo en los controladores
app.set('io', io);

// Mapa de usuarios conectados: userId -> socketId
const usuariosConectados = new Map();

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Escuchamos cuando el cliente nos envía su userId
  socket.on('registrarUsuario', (userId) => {
    if (userId) {
      usuariosConectados.set(userId, socket.id);
      console.log(`Usuario ${userId} registrado con socket ${socket.id}`);
    }
  });

  // Cuando el usuario se desconecta, lo quitamos del mapa
  socket.on('disconnect', () => {
    for (const [userId, id] of usuariosConectados.entries()) {
      if (id === socket.id) {
        usuariosConectados.delete(userId);
        console.log(`Usuario ${userId} desconectado`);
        break;
      }
    }
    console.log('Cliente desconectado:', socket.id);
  });
});

// Guardar referencias globales
app.set('io', io);
app.set('usuariosConectados', usuariosConectados);


// Levantar servidor y manejar la conexión a la base de datos antes
(async () => {
  try {
    console.log('Iniciando intento de conexión a MongoDB...');
    const connected = await connectDB();
    if (!connected) {
      console.warn('ATENCIÓN: MongoDB no está disponible. El servidor seguirá corriendo en modo degradado.');
    }
  } catch (err) {
    console.error('Error inesperado al conectar a la DB:', err && err.message ? err.message : err);
  }

  server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
})();

// Manejo de excepciones globales para diagnosticar cierres
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
