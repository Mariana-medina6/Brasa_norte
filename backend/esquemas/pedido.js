
const mongoose = require('mongoose');

const REGIONES = ['Norte', 'Centro-Bajío', 'Sur-Sureste'];
const TIPOS = ['domicilio', 'establecimiento'];
const ESTADOS = [
  'enviado',
  'en_proceso_preparacion',
  'en_camino',
  'listo_para_recoger',
  'entregado',
];
const METODOS_PAGO = ['efectivo'];

const productoPedidoEsquema = new mongoose.Schema(
  {
    producto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true,
    },
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precio_unitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);


const historialEstadoEsquema = new mongoose.Schema(
  {
    estado: { type: String, enum: ESTADOS, required: true },
    fecha: { type: Date, default: Date.now },
    empleado_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      default: null,
    },
    nota: { type: String, default: '' },
  },
  { _id: false }
);

const pedidoEsquema = new mongoose.Schema(
  {
    cliente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true,
      index: true,
    },
    sucursal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sucursal',
      required: true,
      index: true,
    },
    region: { type: String, enum: REGIONES, required: true },
    tipo: { type: String, enum: TIPOS, required: true },
    estado: { type: String, enum: ESTADOS, default: 'enviado', index: true },
    productos: {
      type: [productoPedidoEsquema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'El pedido debe tener al menos un producto',
      },
    },
    total: { type: Number, required: true, min: 0 },
    metodo_pago: { type: String, enum: METODOS_PAGO, default: 'efectivo' },
    telefono_contacto: { type: String, required: true },
    direccion_entrega: { type: String, default: null },

    
    empleado_preparando: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      default: null,
    },
    fecha_inicio_preparacion: { type: Date, default: null },

   
    repartidor_asignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      default: null,
    },

    fecha_creacion: { type: Date, default: Date.now },
    fecha_actualizacion: { type: Date, default: Date.now },
    historial_estados: { type: [historialEstadoEsquema], default: [] },
  },
  {
    collection: 'pedidos',
    versionKey: false,
  }
);


pedidoEsquema.index({ sucursal_id: 1, estado: 1, empleado_preparando: 1 });
pedidoEsquema.index({ sucursal_id: 1, estado: 1, repartidor_asignado: 1 });

module.exports = mongoose.model('Pedido', pedidoEsquema);