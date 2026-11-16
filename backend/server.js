require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { conectarBaseDatos } = require('./configuracion/baseDatos');
const rutasAutenticacion = require('./rutas/aut');
const rutasMenus = require('./rutas/menus');
const rutasPedidos = require('./rutas/pedidos');
const rutasSucursales = require('./rutas/sucursales');
const rutasAdmin = require('./rutas/admin');
const aplicacion = express();

const origenesPermitidos = (process.env.ORIGENES_PERMITIDOS || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

aplicacion.use(cors({ origin: origenesPermitidos }));
aplicacion.use(express.json({ limit: '5mb' }));

aplicacion.get('/api/salud', (req, res) => {
  res.json({
    estado: 'ok',
    mensaje: 'Servidor de Brasa Norte funcionando correctamente',
    entorno: process.env.ENTORNO || 'desarrollo',
    fecha: new Date().toISOString(),
  });
});

aplicacion.use('/api/autenticacion', rutasAutenticacion);
aplicacion.use('/api/menus', rutasMenus);
aplicacion.use('/api/pedidos', rutasPedidos);
aplicacion.use('/api/sucursales', rutasSucursales);
aplicacion.use('/api/admin', rutasAdmin);
async function iniciarServidor() {
  try {
    await conectarBaseDatos();

    
    const { conectarBitacora } = require('./configuracion/bitacora');
    await conectarBitacora().catch((err) => {
      console.warn('  No se pudo conectar a bitácora:', err.message);
      
    });

    const PUERTO = process.env.PUERTO || 4000;
    aplicacion.listen(PUERTO, () => {
      console.log(` Servidor Brasa Norte escuchando en el puerto ${PUERTO}`);
      console.log(` Entorno: ${process.env.ENTORNO || 'desarrollo'}`);
    });
  } catch (error) {
    console.error(' El servidor no pudo arrancar:', error.message);
    process.exit(1);
  }
}

iniciarServidor();