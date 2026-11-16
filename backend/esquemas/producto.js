
const mongoose = require('mongoose');

const CATEGORIAS_VALIDAS = [
  'Entradas',
  'Platos fuertes',
  'Postres',
  'Bebidas',
];

const productoEsquema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: CATEGORIAS_VALIDAS,
        message: 'Categoría inválida',
      },
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [300, 'La descripción no puede exceder 300 caracteres'],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    imagen_base64: {
      type: String,
      default: null,
    },
  },
  {
    collection: 'productos',
    versionKey: false,
  }
);

module.exports = mongoose.model('Producto', productoEsquema);