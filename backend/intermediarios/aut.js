
const { verificarToken } = require('../utilidades/jwt');


function verificarAuth(req, res, next) {

  const headerAuth = req.headers.authorization;

  if (!headerAuth) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  
  const partes = headerAuth.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Usa: Bearer <token>' });
  }

  const token = partes[1];


  try {
    const payload = verificarToken(token);
    
    req.usuario = {
    id: payload.id,
    rol: payload.rol,
    puesto: payload.puesto || null,
    sucursal_id: payload.sucursal_id || null,
  };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    console.error('Error al verificar token:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'No tienes permiso para acceder a este recurso',
        rol_actual: req.usuario.rol,
        roles_permitidos: rolesPermitidos,
      });
    }
    return next();
  };
}
module.exports = { verificarAuth, verificarRol };