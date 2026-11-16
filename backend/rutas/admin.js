
const express = require('express');
const { verificarAuth, verificarRol } = require('../intermediarios/aut');
const {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  listarInventario,
  ajustarInventario,
  listarEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  listarBitacora,
  subirImagenProducto,
  obtenerMenuVisual,
  exportarBitacoraCSV,
} = require('../controladores/admin');

const enrutador = express.Router();


const soloAdminSucursal = (req, res, next) => {
  if (req.usuario.puesto !== 'administrador_sucursal') {
    return res.status(403).json({
      error: 'Requiere rol de administrador de sucursal',
    });
  }
  return next();
};

enrutador.use(verificarAuth, verificarRol('empleado'), soloAdminSucursal);


enrutador.get('/mi-sucursal/productos', listarProductos);
enrutador.post('/mi-sucursal/productos', crearProducto);
enrutador.put('/mi-sucursal/productos/:id', actualizarProducto);
enrutador.delete('/mi-sucursal/productos/:id', eliminarProducto);
enrutador.post('/mi-sucursal/productos/:id/imagen', subirImagenProducto);


enrutador.get('/mi-sucursal/inventario', listarInventario);
enrutador.put('/mi-sucursal/inventario/:productoId', ajustarInventario);


enrutador.get('/mi-sucursal/empleados', listarEmpleados);
enrutador.post('/mi-sucursal/empleados', crearEmpleado);
enrutador.put('/mi-sucursal/empleados/:id', actualizarEmpleado);
enrutador.delete('/mi-sucursal/empleados/:id', eliminarEmpleado);


enrutador.get('/mi-sucursal/menu-visual', obtenerMenuVisual);


enrutador.get('/bitacora', listarBitacora);
enrutador.get('/bitacora/exportar', exportarBitacoraCSV);

module.exports = enrutador;