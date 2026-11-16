
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const COSTO_HASH = 10;

const clienteEsquema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      
    },
    password_hash: {
      type: String,
      required: [true, 'El pass es obligatorio'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
    },
    direccion: {
      type: String,
      trim: true,
      maxlength: [300, 'La dirección no puede exceder 300 caracteres'],
    },
    fecha_registro: {
      type: Date,
      default: Date.now,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'clientes',
    versionKey: false,
  }
);


clienteEsquema.pre('save', async function () {
  if (!this.isModified('password_hash')) return;

  const sal = await bcrypt.genSalt(COSTO_HASH);
  this.password_hash = await bcrypt.hash(this.password_hash, sal);
});


clienteEsquema.methods.compararPass = async function (passPlano) {
  return bcrypt.compare(passPlano, this.password_hash);
};


clienteEsquema.set('toJSON', {
  transform: (doc, obj) => {
    delete obj.password_hash;
    return obj;
  },
});

module.exports = mongoose.model('Cliente', clienteEsquema);