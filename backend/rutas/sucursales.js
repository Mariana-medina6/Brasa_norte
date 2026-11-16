
const express = require('express');
const { listarSucursales } = require('../controladores/sucursales');

const enrutador = express.Router();


enrutador.get('/', listarSucursales);

module.exports = enrutador;