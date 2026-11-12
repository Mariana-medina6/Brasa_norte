// ============================================
// SERVIDOR PRINCIPAL - BRASA NORTE
// Punto de entrada de la aplicación
// ============================================

// Cargar variables de entorno desde .env
// Debe ser la PRIMERA línea ejecutable para que process.env esté disponible
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const aplicacion = express();

// --------------------------------------------
// MIDDLEWARES GLOBALES
// --------------------------------------------

// CORS: permite peticiones solo desde los orígenes listados en .env
const origenesPermitidos = (process.env.ORIGENES_PERMITIDOS || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean); // quita cadenas vacías

aplicacion.use(cors({ origin: origenesPermitidos }));

// Parsear JSON del cuerpo (límite 10kb por seguridad)
aplicacion.use(express.json({ limit: '10kb' }));

// --------------------------------------------
// RUTA DE SALUD (healthcheck)
// --------------------------------------------
aplicacion.get('/api/salud', (peticion, respuesta) => {
  respuesta.json({
    estado: 'ok',
    mensaje: 'Servidor de Brasa Norte funcionando correctamente',
    entorno: process.env.ENTORNO || 'desarrollo',
    fecha: new Date().toISOString(),
  });
});

// --------------------------------------------
// ARRANQUE DEL SERVIDOR
// --------------------------------------------
const PUERTO = process.env.PUERTO || 4000;

aplicacion.listen(PUERTO, () => {
  console.log(` Servidor Brasa Norte escuchando en el puerto ${PUERTO}`);
  console.log(` Entorno: ${process.env.ENTORNO || 'desarrollo'}`);
});