
const { MongoClient } = require('mongodb');

let clienteBitacora = null;
let coleccionBitacora = null;


async function conectarBitacora() {
  if (coleccionBitacora) {
    return coleccionBitacora;
  }

  const cadena = process.env.CADENA_CONEXION_BITACORA;
  if (!cadena) {
    throw new Error('Falta CADENA_CONEXION_BITACORA en .env');
  }

  clienteBitacora = new MongoClient(cadena);
  await clienteBitacora.connect();
  coleccionBitacora = clienteBitacora.db('brasa_norte').collection('bitacora');

  console.log(' Conectado a bitácora (us_bitacora, solo lectura)');
  return coleccionBitacora;
}


async function obtenerColeccionBitacora() {
  if (coleccionBitacora) return coleccionBitacora;
  return conectarBitacora();
}


async function cerrarBitacora() {
  if (clienteBitacora) {
    await clienteBitacora.close();
    clienteBitacora = null;
    coleccionBitacora = null;
  }
}

module.exports = { obtenerColeccionBitacora, conectarBitacora, cerrarBitacora };