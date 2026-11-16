
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Binary } = require('mongodb'); 

const OPCIONES_CONEXION = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

function leerClaveMaestra() {
  const rutaRelativa = process.env.RUTA_CLAVE_MAESTRA_CSFLE || './claves-csfle/clave-maestra.pem';
  const rutaAbsoluta = path.resolve(rutaRelativa);

  if (!fs.existsSync(rutaAbsoluta)) {
    throw new Error(`No se encontró la clave maestra en: ${rutaAbsoluta}`);
  }

  const base64 = fs.readFileSync(rutaAbsoluta, 'utf8').trim();
  const clave = Buffer.from(base64, 'base64');

  if (clave.length !== 96) {
    throw new Error(`La clave maestra debe tener 96 bytes. Tiene ${clave.length}.`);
  }

  return clave;
}


function construirEsquemaCifrado(idDekBase64) {
  const { Binary } = require('mongodb');

 
  const idDekBuffer = Buffer.from(idDekBase64, 'base64');
  const idDek = new Binary(idDekBuffer, 4);

  const reglaDeterministica = {
    algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
    keyId: [idDek],
    bsonType: 'string',   
  };

  return {
    'brasa_norte.clientes': {
      bsonType: 'object',
      properties: {
        email: { encrypt: reglaDeterministica },
        telefono: { encrypt: reglaDeterministica },
      },
    },
    'brasa_norte.empleados': {
      bsonType: 'object',
      properties: {
        email: { encrypt: reglaDeterministica },
        telefono: { encrypt: reglaDeterministica },
      },
    },
  };
}


async function conectarBaseDatos() {

  mongoose.connection.on('connected', () => {
    console.log(' Conectado a MongoDB Atlas (CSFLE activo)');
  });

  mongoose.connection.on('error', (error) => {
    console.error(' Error de conexión a MongoDB:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('  Desconectado de MongoDB Atlas');
  });

  mongoose.connection.on('reconnected', () => {
    console.log(' Reconectado a MongoDB Atlas');
  });

  try {
    const claveMaestra = leerClaveMaestra();
    const idDekBase64 = process.env.ID_LLAVE_CIFRADO_DATOS;
    
    if (!idDekBase64) {
      throw new Error('Falta ID_LLAVE_CIFRADO_DATOS en .env');
    }

    const proveedorKms = { local: { key: claveMaestra } };
    const esquemaCifrado = construirEsquemaCifrado(idDekBase64);

    
    await mongoose.connect(process.env.CADENA_CONEXION_MONGO, {
      ...OPCIONES_CONEXION,
      autoEncryption: {
        keyVaultNamespace: 'encryption.__keyVault',
        kmsProviders: proveedorKms,
        schemaMap: esquemaCifrado,
        extraOptions: {
         
          cryptSharedLibPath: path.join(__dirname, '..', 'mongo_crypt_v1.dll'),
        },
      },
    });

    console.log(` Base de datos en uso: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(' No se pudo conectar a MongoDB Atlas:', error.message);
    throw error;
  }
}

async function conectarConCifrado() {
  const claveMaestra = leerClaveMaestra();
  const idDekBase64 = process.env.ID_LLAVE_CIFRADO_DATOS;

  if (!idDekBase64) {
    throw new Error('Falta ID_LLAVE_CIFRADO_DATOS en .env');
  }

  const proveedorKms = { local: { key: claveMaestra } };
  const esquemaCifrado = construirEsquemaCifrado(idDekBase64);

  await mongoose.connect(process.env.CADENA_CONEXION_MONGO, {
    ...OPCIONES_CONEXION,
    autoEncryption: {
      keyVaultNamespace: 'encryption.__keyVault',
      kmsProviders: proveedorKms,
      schemaMap: esquemaCifrado,
      extraOptions: {
        cryptSharedLibPath: path.join(__dirname, '..', 'mongo_crypt_v1.dll'),
      },
    },
  });
}

module.exports = { conectarBaseDatos, conectarConCifrado };