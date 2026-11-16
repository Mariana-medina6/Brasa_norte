
const express = require('express');
const {
  crearPedido,
  cambiarEstadoPedido,
  tomarPedidoRepartidor,
  listarMisPedidos,
  listarPedidosPorSucursal,
  registrarPagoYEntregar,
  listarMisPreparados,
  listarMisCobros,
} = require('../controladores/pedidos');
const { verificarAuth, verificarRol } = require('../intermediarios/aut');

const enrutador = express.Router();

enrutador.post('/', verificarAuth, crearPedido);


enrutador.get('/mis-pedidos', verificarAuth, listarMisPedidos);


enrutador.get(
  '/sucursal/:sucursalId',
  verificarAuth,
  verificarRol('empleado'),
  listarPedidosPorSucursal
);

enrutador.get('/mis-cobros', verificarAuth, verificarRol('empleado'), listarMisCobros);


enrutador.patch(
  '/:id/estado',
  verificarAuth,
  verificarRol('empleado'),
  cambiarEstadoPedido
);


enrutador.post(
  '/:id/tomar',
  verificarAuth,
  verificarRol('empleado'),
  tomarPedidoRepartidor
);

enrutador.post(
  '/:id/pago',
  verificarAuth,
  verificarRol('empleado'),
  registrarPagoYEntregar
);

enrutador.get(
  '/mis-preparados',
  verificarAuth,
  verificarRol('empleado'),
  listarMisPreparados
);

module.exports = enrutador;