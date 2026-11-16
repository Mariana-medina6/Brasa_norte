
const mongoose = require('mongoose');

const REGIONES_VALIDAS = ['Norte', 'Centro-Bajío', 'Sur-Sureste'];

const sucursalEsquema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
      maxlength: [300, 'La dirección no puede exceder 300 caracteres'],
    },
    region: {
      type: String,
      required: [true, 'La región es obligatoria'],
      enum: {
        values: REGIONES_VALIDAS,
        message: 'La región debe ser: Norte, Centro-Bajío o Sur-Sureste',
      },
    },
  },
  {
    collection: 'sucursales',
    versionKey: false,
  }
);

module.exports = mongoose.model('Sucursal', sucursalEsquema);