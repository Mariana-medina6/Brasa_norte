
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { MongoClient, ClientEncryption } = require('mongodb');


const ALIAS_DEK = 'brasa_norte_dek';


const ESPACIO_NOMBRES_VAULT = 'encryption';
const COLECCION_VAULT = '__keyVault';

async function crearLlave() {

  const rutaClave = path.resolve(process.env.RUTA_CLAVE_MAESTRA_CSFLE || './claves-csfle/clave-maestra.pem');

  if (!fs.existsSync(rutaClave)) {
    throw new Error(`No se encontró la clave maestra en: ${rutaClave}`);
  }

  const claveMaestraBase64 = fs.readFileSync(rutaClave, 'utf8').trim();
  const claveMaestra = Buffer.from(claveMaestraBase64, 'base64');

  if (claveMaestra.length !== 96) {
    throw new Error(`La clave maestra debe tener 96 bytes. Tiene ${claveMaestra.length}.`);
  }


  const proveedorKms = {
    local: {
      key: claveMaestra,
    },
  };


  const cliente = new MongoClient(process.env.CADENA_CONEXION_MONGO);
  await cliente.connect();

  try {
    
    const cifradoCliente = new ClientEncryption(cliente, {
      keyVaultNamespace: `${ESPACIO_NOMBRES_VAULT}.${COLECCION_VAULT}`,
      kmsProviders: proveedorKms,
    });

    
    const dekExistente = await cifradoCliente.getKeyByAltName(ALIAS_DEK);

    if (dekExistente) {
      console.log('  Ya existe una DEK con el alias:', ALIAS_DEK);
      console.log(' Su _id (base64) es:');
      console.log(dekExistente._id.toString('base64'));
      console.log('\nCopia ese valor en .env como ID_LLAVE_CIFRADO_DATOS');
      return;
    }

  
    const idDek = await cifradoCliente.createDataKey('local', {
      keyAltNames: [ALIAS_DEK],
    });

    console.log(' DEK creada correctamente');
    console.log(' ID_LLAVE_CIFRADO_DATOS (base64):');
    console.log(idDek.toString('base64'));
    console.log('\nCopia ese valor en .env como ID_LLAVE_CIFRADO_DATOS');
  } finally {
    await cliente.close();
  }
}

crearLlave().catch((error) => {
  console.error(' Error al crear la DEK:', error.message);
  process.exit(1);
});