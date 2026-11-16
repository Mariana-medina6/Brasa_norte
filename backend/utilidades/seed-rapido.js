require('dotenv').config();
const mongoose = require('mongoose');
const Sucursal = require('../esquemas/sucursal');
const Producto = require('../esquemas/producto');
const Menu = require('../esquemas/menu');
const Inventario = require('../esquemas/inventario');

(async () => {
  await mongoose.connect(process.env.CADENA_CONEXION_MONGO);
  console.log('Conectado');

  await Sucursal.deleteMany({});
  await Producto.deleteMany({});
  await Menu.deleteMany({});
  await Inventario.deleteMany({});

  const sucursal = await Sucursal.create({
    nombre: 'Brasa Norte Monterrey',
    direccion: 'Av. Constitución 100, Monterrey, NL',
    region: 'Norte',
  });
  console.log('Sucursal:', sucursal._id.toString());

  const prod1 = await Producto.create({
    nombre: 'Taco de arrachera',
    categoria: 'Platos fuertes',
    precio: 85,
    descripcion: 'Taco con arrachera, cebolla y cilantro',
    disponible: true,
  });
  const prod2 = await Producto.create({
    nombre: 'Agua de horchata',
    categoria: 'Bebidas',
    precio: 35,
    descripcion: 'Vaso 500ml',
    disponible: true,
  });
  const prod3 = await Producto.create({
    nombre: 'Flan napolitano',
    categoria: 'Postres',
    precio: 50,
    descripcion: 'Porción individual',
    disponible: true,
  });
  console.log('Productos:', prod1._id.toString(), prod2._id.toString(), prod3._id.toString());

  await Menu.create({
    sucursal_id: sucursal._id,
    productos_ids: [prod1._id, prod2._id, prod3._id],
  });

  await Inventario.create([
    { sucursal_id: sucursal._id, producto_id: prod1._id, stock: 20, stock_minimo: 5 },
    { sucursal_id: sucursal._id, producto_id: prod2._id, stock: 50, stock_minimo: 10 },
    { sucursal_id: sucursal._id, producto_id: prod3._id, stock: 0, stock_minimo: 5 },
  ]);

  console.log('Datos insertados correctamente');
  console.log('Sucursal ID para probar:', sucursal._id.toString());

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});