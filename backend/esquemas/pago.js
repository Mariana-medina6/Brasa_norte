
const mongoose = require('mongoose');

const METODOS_PAGO = ['efectivo'];

const pagoEsquema = new mongoose.Schema(
  {
    pedido_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pedido',
      required: [true, 'El pedido es obligatorio'],
      unique: true,
      index: true,
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0, 'El monto no puede ser negativo'],
    },
    metodo_pago: {
      type: String,
      required: [true, 'El método de pago es obligatorio'],
      enum: {
        values: METODOS_PAGO,
        message: 'Método de pago inválido',
      },
    },
    fecha_pago: {
      type: Date,
      default: Date.now,
    },
    cobrado_por: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      default: null,
    },
  },
  {
    collection: 'pagos',
    versionKey: false,
  }
);

module.exports = mongoose.model('Pago', pagoEsquema);