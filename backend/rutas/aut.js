
const express = require('express');
const {
  registrarCliente,
  iniciarSesionCliente,   
  iniciarSesionEmpleado,  
  obtenerPerfil,
} = require('../controladores/autenticacion');

const { verificarAuth } = require('../intermediarios/aut');

const enrutador = express.Router();


enrutador.post('/registro', registrarCliente);


enrutador.post('/login', iniciarSesionCliente);


enrutador.post('/login-empleado', iniciarSesionEmpleado);


enrutador.get('/perfil', verificarAuth, obtenerPerfil);

module.exports = enrutador;