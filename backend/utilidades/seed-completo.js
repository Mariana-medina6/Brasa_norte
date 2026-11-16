const { conectarConCifrado } = require('../configuracion/baseDatos');
require('dotenv').config();
const mongoose = require('mongoose');

const Sucursal = require('../esquemas/sucursal');
const Producto = require('../esquemas/producto');
const Menu = require('../esquemas/menu');
const Inventario = require('../esquemas/inventario');
const Pedido = require('../esquemas/pedido');

(async () => {
  await conectarConCifrado();
  console.log('Conectado');

  await Pedido.deleteMany({});
  await Inventario.deleteMany({});
  await Menu.deleteMany({});
  await Producto.deleteMany({});
  console.log('Pedidos, inventarios, menús y productos limpiados');
  console.log('Sucursales, clientes y empleados conservados');

  const datosSucursales = [
    {
      nombre: 'Brasa Norte Monterrey',
      direccion: 'Av. Constitución 100, Centro, Monterrey, NL',
      region: 'Norte',
    },
    {
      nombre: 'Brasa Norte Querétaro',
      direccion: 'Av. Corregidora 200, Centro, Querétaro, QRO',
      region: 'Centro-Bajío',
    },
    {
      nombre: 'Brasa Norte Villahermosa',
      direccion: 'Av. 27 de Febrero 300, Centro, Villahermosa, TAB',
      region: 'Sur-Sureste',
    },
  ];

  const sucursales = [];
  for (const datos of datosSucursales) {
    let suc = await Sucursal.findOne({ nombre: datos.nombre });
    if (!suc) {
      suc = await Sucursal.create(datos);
      console.log(`Sucursal creada: ${suc.nombre} (${suc._id})`);
    } else {
      console.log(`Sucursal reutilizada: ${suc.nombre} (${suc._id})`);
    }
    sucursales.push(suc);
  }

  const productos = await Producto.insertMany([
    {
      nombre: 'Papas a la francesa',
      categoria: 'Entradas',
      precio: 65,
      descripcion: 'Porción individual de papas fritas crujientes con sal',
      disponible: true,
    },
    {
      nombre: 'Guacamole con totopos',
      categoria: 'Entradas',
      precio: 75,
      descripcion: 'Guacamole fresco preparado al momento, acompañado de totopos',
      disponible: true,
    },
    {
      nombre: 'Ensalada César',
      categoria: 'Entradas',
      precio: 85,
      descripcion: 'Lechuga romana, crutones, queso parmesano y aderezo César',
      disponible: true,
    },
    {
      nombre: 'Hamburguesa clásica',
      categoria: 'Platos fuertes',
      precio: 135,
      descripcion: 'Carne de res 150g, queso americano, lechuga, jitomate y cebolla',
      disponible: true,
    },
    {
      nombre: 'Hamburguesa BBQ',
      categoria: 'Platos fuertes',
      precio: 155,
      descripcion: 'Carne de res 150g, tocino, queso cheddar y salsa BBQ',
      disponible: true,
    },
    {
      nombre: 'Paquete de tacos de arrachera (3 pzas)',
      categoria: 'Platos fuertes',
      precio: 120,
      descripcion: 'Tres tacos de arrachera con cebolla, cilantro y limón',
      disponible: true,
    },
    {
      nombre: 'Paquete de tacos al pastor (3 pzas)',
      categoria: 'Platos fuertes',
      precio: 95,
      descripcion: 'Tres tacos al pastor con piña, cebolla y cilantro',
      disponible: true,
    },
    {
      nombre: 'Agua de horchata (500 ml)',
      categoria: 'Bebidas',
      precio: 35,
      descripcion: 'Vaso de 500 ml, preparada al momento',
      disponible: true,
    },
    {
      nombre: 'Agua de jamaica (500 ml)',
      categoria: 'Bebidas',
      precio: 35,
      descripcion: 'Vaso de 500 ml, preparada al momento',
      disponible: true,
    },
    {
      nombre: 'Refresco de lata (355 ml)',
      categoria: 'Bebidas',
      precio: 30,
      descripcion: 'Lata de 355 ml, bien fría',
      disponible: true,
    },
    {
      nombre: 'Flan napolitano (pieza)',
      categoria: 'Postres',
      precio: 45,
      descripcion: 'Porción individual de flan napolitano refrigerado',
      disponible: true,
    },
    {
      nombre: 'Cheesecake de fresa (pieza)',
      categoria: 'Postres',
      precio: 55,
      descripcion: 'Porción individual de cheesecake con topping de fresa, refrigerado',
      disponible: true,
    },
    {
      nombre: 'Gelatina de mosaico (pieza)',
      categoria: 'Postres',
      precio: 35,
      descripcion: 'Porción individual de gelatina de mosaico, refrigerada',
      disponible: true,
    },
  ]);
  console.log(`Productos: ${productos.length}`);

  const porNombre = (n) => productos.find((p) => p.nombre === n)._id;

  await Menu.create({
    sucursal_id: sucursales[0]._id,
    productos_ids: productos.map((p) => p._id),
  });

  await Menu.create({
    sucursal_id: sucursales[1]._id,
    productos_ids: [
      porNombre('Papas a la francesa'),
      porNombre('Guacamole con totopos'),
      porNombre('Ensalada César'),
      porNombre('Hamburguesa clásica'),
      porNombre('Hamburguesa BBQ'),
      porNombre('Paquete de tacos de arrachera (3 pzas)'),
      porNombre('Agua de horchata (500 ml)'),
      porNombre('Agua de jamaica (500 ml)'),
      porNombre('Refresco de lata (355 ml)'),
      porNombre('Flan napolitano (pieza)'),
      porNombre('Cheesecake de fresa (pieza)'),
    ],
  });

  await Menu.create({
    sucursal_id: sucursales[2]._id,
    productos_ids: [
      porNombre('Papas a la francesa'),
      porNombre('Paquete de tacos al pastor (3 pzas)'),
      porNombre('Agua de horchata (500 ml)'),
      porNombre('Agua de jamaica (500 ml)'),
      porNombre('Refresco de lata (355 ml)'),
      porNombre('Gelatina de mosaico (pieza)'),
    ],
  });
  console.log('Menús: 3 (uno por sucursal)');

  const inv = (sucursal, producto, stock, stock_minimo = 5) => ({
    sucursal_id: sucursal._id,
    producto_id: porNombre(producto),
    stock,
    stock_minimo,
  });

  const inventarios = [];

  inventarios.push(
    inv(sucursales[0], 'Papas a la francesa', 40),
    inv(sucursales[0], 'Guacamole con totopos', 30),
    inv(sucursales[0], 'Ensalada César', 20),
    inv(sucursales[0], 'Hamburguesa clásica', 25),
    inv(sucursales[0], 'Hamburguesa BBQ', 20),
    inv(sucursales[0], 'Paquete de tacos de arrachera (3 pzas)', 35),
    inv(sucursales[0], 'Paquete de tacos al pastor (3 pzas)', 40),
    inv(sucursales[0], 'Agua de horchata (500 ml)', 60),
    inv(sucursales[0], 'Agua de jamaica (500 ml)', 60),
    inv(sucursales[0], 'Refresco de lata (355 ml)', 80),
    inv(sucursales[0], 'Flan napolitano (pieza)', 15),
    inv(sucursales[0], 'Cheesecake de fresa (pieza)', 12),
    inv(sucursales[0], 'Gelatina de mosaico (pieza)', 0),
  );

  inventarios.push(
    inv(sucursales[1], 'Papas a la francesa', 25),
    inv(sucursales[1], 'Guacamole con totopos', 15),
    inv(sucursales[1], 'Ensalada César', 10),
    inv(sucursales[1], 'Hamburguesa clásica', 18),
    inv(sucursales[1], 'Hamburguesa BBQ', 12),
    inv(sucursales[1], 'Paquete de tacos de arrachera (3 pzas)', 20),
    inv(sucursales[1], 'Agua de horchata (500 ml)', 40),
    inv(sucursales[1], 'Agua de jamaica (500 ml)', 40),
    inv(sucursales[1], 'Refresco de lata (355 ml)', 50),
    inv(sucursales[1], 'Flan napolitano (pieza)', 0),
    inv(sucursales[1], 'Cheesecake de fresa (pieza)', 8),
  );

  inventarios.push(
    inv(sucursales[2], 'Papas a la francesa', 20),
    inv(sucursales[2], 'Paquete de tacos al pastor (3 pzas)', 25),
    inv(sucursales[2], 'Agua de horchata (500 ml)', 30),
    inv(sucursales[2], 'Agua de jamaica (500 ml)', 30),
    inv(sucursales[2], 'Refresco de lata (355 ml)', 40),
    inv(sucursales[2], 'Gelatina de mosaico (pieza)', 10),
  );

  await Inventario.insertMany(inventarios);
  console.log(`Inventarios: ${inventarios.length}`);

  console.log('\n========================================');
  console.log('SEED COMPLETO TERMINADO');
  console.log('========================================');
  console.log('\nSucursales (conservadas o creadas):');
  sucursales.forEach((s) => {
    console.log(`  ${s.region.padEnd(15)} ${s.nombre}`);
    console.log(`    ID: ${s._id}`);
  });
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});