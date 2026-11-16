
const mongoose = require('mongoose');

const inventarioEsquema = new mongoose.Schema(
  {
    sucursal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sucursal',
      required: [true, 'La sucursal es obligatoria'],
      index: true,
    },
    producto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: [true, 'El producto es obligatorio'],
      index: true,
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    stock_minimo: {
      type: Number,
      default: 5,
      min: [0, 'El stock mínimo no puede ser negativo'],
    },
    version: {
      type: Number,
      default: 0,
    },
    ultima_actualizacion: {
      type: Date,
      default: Date.now,
    },
    actualizado_por: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente', 
      default: null,
    },
  },
  {
    collection: 'inventarios',
    versionKey: false,
  }
);


inventarioEsquema.pre('save', async function () {
  this.ultima_actualizacion = new Date();
});

module.exports = mongoose.model('Inventario', inventarioEsquema);