
const mongoose = require('mongoose');
const Menu = require('../esquemas/menu');
const Inventario = require('../esquemas/inventario');
const Producto = require('../esquemas/producto');
const Sucursal = require('../esquemas/sucursal');


async function obtenerMenuPorSucursal(req, res) {
  try {
    const { sucursalId } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(sucursalId)) {
      return res.status(400).json({ error: 'ID de sucursal inválido' });
    }

    
    const sucursal = await Sucursal.findById(sucursalId);
    if (!sucursal) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

   
    const menu = await Menu.findOne({ sucursal_id: sucursalId });
    if (!menu || menu.productos_ids.length === 0) {
      return res.json({
        sucursal: { _id: sucursal._id, nombre: sucursal.nombre, region: sucursal.region },
        total_productos: 0,
        productos: [],
        mensaje: 'La sucursal no tiene productos en su menú',
      });
    }


    const inventarios = await Inventario.find({
      sucursal_id: sucursalId,
      producto_id: { $in: menu.productos_ids },
      stock: { $gt: 0 },
    }).lean();

    
    const idsConStock = new Set(inventarios.map((inv) => inv.producto_id.toString()));

   
    const productos = await Producto.find({
      _id: { $in: menu.productos_ids },
      disponible: true,
    }).lean();

    
    const stockPorProducto = new Map(
      inventarios.map((inv) => [inv.producto_id.toString(), inv.stock])
    );

    const productosFiltrados = productos
      .filter((prod) => idsConStock.has(prod._id.toString()))
      .map((prod) => ({
        ...prod,
        stock_disponible: stockPorProducto.get(prod._id.toString()) || 0,
      }));

    return res.json({
      sucursal: { _id: sucursal._id, nombre: sucursal.nombre, region: sucursal.region },
      total_productos: productosFiltrados.length,
      productos: productosFiltrados,
    });
  } catch (error) {
    console.error('Error al obtener menú:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { obtenerMenuPorSucursal };