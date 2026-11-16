const jsonwebtoken = require('jsonwebtoken');

function generarToken(payload) {
  return jsonwebtoken.sign(payload, process.env.CLAVE_SECRETA_JWT, {
    expiresIn: process.env.TIEMPO_EXPIRACION_JWT || '7d',
  });
}

function verificarToken(token) {
  return jsonwebtoken.verify(token, process.env.CLAVE_SECRETA_JWT);
}

module.exports = { generarToken, verificarToken };