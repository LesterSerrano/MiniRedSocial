const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const protegerRuta = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token
      req.usuario = await User.findById(decoded.id).select('-contraseña');
      next();
    } catch (error) {
        console.log(error);
        res.status(401).json({msg: 'Acceso denegado, token inválido'});
    }
  }

  if (!token) {
    res.status(401).json({msg: 'Acceso denegado, no hay token'});
  }
};

module.exports = { protegerRuta };