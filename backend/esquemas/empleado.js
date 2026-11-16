
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const COSTO_HASH = 10;

const PUESTOS_VALIDOS = [
  'mostrador',
  'cocina',
  'repartidor',
  'administrador_sucursal',
];

const empleadoEsquema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
    },
    password_hash: {
      type: String,
      required: [true, 'El password es obligatorio'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
    },
    sucursal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sucursal',
      required: [true, 'La sucursal es obligatoria'],
      index: true,
    },
    puesto: {
      type: String,
      required: [true, 'El puesto es obligatorio'],
      enum: {
        values: PUESTOS_VALIDOS,
        message: 'Puesto inválido',
      },
    },
    fecha_ingreso: {
      type: Date,
      default: Date.now,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'empleados',
    versionKey: false,
  }
);


empleadoEsquema.pre('save', async function () {
  if (!this.isModified('password_hash')) return;

  const sal = await bcrypt.genSalt(COSTO_HASH);
  this.password_hash = await bcrypt.hash(this.password_hash, sal);
});


empleadoEsquema.methods.compararPass = async function (passPlano) {
  return bcrypt.compare(passPlano, this.password_hash);
};


empleadoEsquema.set('toJSON', {
  transform: (doc, obj) => {
    delete obj.password_hash;
    return obj;
  },
});

module.exports = mongoose.model('Empleado', empleadoEsquema);