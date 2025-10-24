const jwt = require('jsonwebtoken');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // token válido 7 días
  });
};

module.exports = generarToken;
