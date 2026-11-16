
const mongoose = require('mongoose');

const menuEsquema = new mongoose.Schema(
  {
    sucursal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sucursal',
      required: [true, 'La sucursal es obligatoria'],
      unique: true, 
      index: true,
    },
    productos_ids: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }],
      default: [],
    },
    fecha_actualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'menus',
    versionKey: false,
  }
);


menuEsquema.pre('save', async function () {
  this.fecha_actualizacion = new Date();
});

module.exports = mongoose.model('Menu', menuEsquema);