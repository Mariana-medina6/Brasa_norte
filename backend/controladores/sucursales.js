
const Sucursal = require('../esquemas/sucursal');


async function listarSucursales(req, res) {
  try {
    const sucursales = await Sucursal.find({}).sort({ region: 1 }).lean();
    return res.json({
      total: sucursales.length,
      sucursales,
    });
  } catch (error) {
    console.error('Error al listar sucursales:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarSucursales };