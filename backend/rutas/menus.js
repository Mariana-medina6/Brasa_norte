
const express = require('express');
const { obtenerMenuPorSucursal } = require('../controladores/menus');

const enrutador = express.Router();

enrutador.get('/sucursal/:sucursalId', obtenerMenuPorSucursal);

module.exports = enrutador;