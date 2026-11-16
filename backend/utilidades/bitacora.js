
const mongoose = require('mongoose');

async function registrarBitacora({
  usuario_id,
  usuario_tipo = 'sistema',
  accion,
  detalles = {},
  ip = null,
  sucursal_id = null,
}) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('  Bitácora: Mongoose no conectado');
      return;
    }

    const db = mongoose.connection.db;
    if (!db) {
      console.warn('  Bitácora: db no disponible');
      return;
    }

  
    let usuarioObjectId = null;
    if (usuario_id && mongoose.Types.ObjectId.isValid(usuario_id)) {
      usuarioObjectId = new mongoose.Types.ObjectId(usuario_id.toString());
    }

  
    let sucursalObjectId = null;
    if (sucursal_id && mongoose.Types.ObjectId.isValid(sucursal_id)) {
      sucursalObjectId = new mongoose.Types.ObjectId(sucursal_id.toString());
    }

    let detallesObj = detalles;
    if (typeof detalles === 'string') {
      detallesObj = { mensaje: detalles };
    } else if (!detalles || typeof detalles !== 'object') {
      detallesObj = {};
    }

    const doc = {
      usuario_id: usuarioObjectId,
      usuario_tipo,
      accion,
      detalles: detallesObj,
      fecha: new Date(),
      ip: ip || null,
      sucursal_id: sucursalObjectId,
    };

    const resultado = await db.collection('bitacora').insertOne(doc);
    console.log(' Bitácora insertada:', accion, '->', resultado.insertedId.toString());
  } catch (error) {
    console.warn('  No se pudo escribir en bitácora:', error.message);
  }
}

function obtenerIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
}

module.exports = { registrarBitacora, obtenerIp };