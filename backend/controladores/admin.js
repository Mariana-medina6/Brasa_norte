const mongoose = require('mongoose');
const Producto = require('../esquemas/producto');
const Inventario = require('../esquemas/inventario');
const Menu = require('../esquemas/menu');
const Empleado = require('../esquemas/empleado');
const Sucursal = require('../esquemas/sucursal');
const { obtenerColeccionBitacora } = require('../configuracion/bitacora');
const { registrarBitacora, obtenerIp } = require('../utilidades/bitacora');

async function listarProductos(req, res) {
  try {
    const productos = await Producto.find({}).sort({ categoria: 1, nombre: 1 }).lean();
    return res.json({ total: productos.length, productos });
  } catch (error) {
    console.error('Error al listar productos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function crearProducto(req, res) {
  try {
    const { nombre, categoria, precio, descripcion, disponible, stock_inicial } = req.body;

    if (!nombre || !categoria || precio == null) {
      return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios' });
    }

    const producto = await Producto.create({
      nombre,
      categoria,
      precio,
      descripcion,
      disponible: disponible !== undefined ? disponible : true,
    });

    const stockInicialNum = Number(stock_inicial) || 0;
    await Inventario.create({
      sucursal_id: req.usuario.sucursal_id,
      producto_id: producto._id,
      stock: stockInicialNum,
      stock_minimo: 5,
      actualizado_por: req.usuario.id,
    });

    await Menu.updateOne(
      { sucursal_id: req.usuario.sucursal_id },
      { $addToSet: { productos_ids: producto._id }, $set: { fecha_actualizacion: new Date() } },
      { upsert: true }
    );

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'crear_producto',
      detalles: {
        producto_id: producto._id.toString(),
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
        stock_inicial: stockInicialNum,
      },
      ip: obtenerIp(req),
      sucursal_id: req.usuario.sucursal_id,
    });

    return res.status(201).json({ mensaje: 'Producto creado', producto });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al crear producto:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }
    const producto = await Producto.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'actualizar_producto',
      detalles: {
        producto_id: producto._id.toString(),
        nombre: producto.nombre,
        cambios: req.body,
      },
      ip: obtenerIp(req),
      sucursal_id: req.usuario.sucursal_id,
    });

    return res.json({ mensaje: 'Producto actualizado', producto });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function eliminarProducto(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }
    const producto = await Producto.findByIdAndDelete(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    await Inventario.deleteMany({ producto_id: id });
    await Menu.updateMany({}, { $pull: { productos_ids: id } });

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'eliminar_producto',
      detalles: {
        producto_id: id,
        nombre: producto.nombre,
      },
      ip: obtenerIp(req),
      sucursal_id: req.usuario.sucursal_id,
    });

    return res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function listarInventario(req, res) {
  try {
    const inventarios = await Inventario.find({
      sucursal_id: req.usuario.sucursal_id,
    })
      .populate('producto_id', 'nombre categoria precio')
      .lean();
    return res.json({ total: inventarios.length, inventarios });
  } catch (error) {
    console.error('Error al listar inventario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function ajustarInventario(req, res) {
  try {
    const { productoId } = req.params;
    const { stock, stock_minimo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }
    if (stock == null || stock < 0) {
      return res.status(400).json({ error: 'Stock inválido' });
    }

    const inventarioAnterior = await Inventario.findOne({
      sucursal_id: req.usuario.sucursal_id,
      producto_id: productoId,
    }).lean();
    const stockAnterior = inventarioAnterior?.stock ?? null;

    const actualizacion = {
      stock,
      ultima_actualizacion: new Date(),
      actualizado_por: req.usuario.id,
    };
    if (stock_minimo != null) actualizacion.stock_minimo = stock_minimo;

    const inventario = await Inventario.findOneAndUpdate(
      { sucursal_id: req.usuario.sucursal_id, producto_id: productoId },
      actualizacion,
      { returnDocument: 'after', runValidators: true }
    ).populate('producto_id', 'nombre');

    if (!inventario) {
      return res.status(404).json({ error: 'Inventario no encontrado en tu sucursal' });
    }

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'ajustar_inventario',
      detalles: {
        producto_id: productoId,
        producto_nombre: inventario.producto_id?.nombre || 'desconocido',
        stock_anterior: stockAnterior,
        stock_nuevo: stock,
        sucursal_id: req.usuario.sucursal_id,
      },
      ip: obtenerIp(req),
      sucursal_id: req.usuario.sucursal_id,
    });

    return res.json({ mensaje: 'Inventario actualizado', inventario });
  } catch (error) {
    console.error('Error al ajustar inventario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function listarEmpleados(req, res) {
  try {
    const empleados = await Empleado.find({
      sucursal_id: req.usuario.sucursal_id,
    })
      .select('-password_hash')
      .sort({ puesto: 1, nombre: 1 })
      .lean();
    return res.json({ total: empleados.length, empleados });
  } catch (error) {
    console.error('Error al listar empleados:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function crearEmpleado(req, res) {
  try {
    const { nombre, email, password, telefono, puesto, sucursal_id } = req.body;

    if (!nombre || !email || !password || !telefono || !puesto) {
      return res.status(400).json({
        error: 'Nombre, email, password, teléfono y puesto son obligatorios',
      });
    }

    const PUESTOS_VALIDOS = ['mostrador', 'cocina', 'repartidor', 'administrador_sucursal'];
    if (!PUESTOS_VALIDOS.includes(puesto)) {
      return res.status(400).json({ error: 'Puesto inválido' });
    }

    let sucursalAsignada;

    if (puesto === 'administrador_sucursal') {
      if (!sucursal_id || !mongoose.Types.ObjectId.isValid(sucursal_id)) {
        return res.status(400).json({
          error: 'Para crear un administrador de sucursal debes indicar la sucursal',
        });
      }

      const sucursalExiste = await Sucursal.findById(sucursal_id);
      if (!sucursalExiste) {
        return res.status(404).json({ error: 'Sucursal no encontrada' });
      }

      sucursalAsignada = sucursal_id;
    } else {
      sucursalAsignada = req.usuario.sucursal_id;
    }

    const emailNorm = email.toLowerCase().trim();
    const existente = await Empleado.findOne({ email: emailNorm });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un empleado con ese email' });
    }

    const empleado = await Empleado.create({
      nombre: nombre.trim(),
      email: emailNorm,
      password_hash: password,
      telefono: telefono.trim(),
      sucursal_id: sucursalAsignada,
      puesto,
      activo: true,
    });

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'crear_empleado',
      detalles: {
        empleado_id: empleado._id.toString(),
        email: empleado.email,
        puesto: empleado.puesto,
        sucursal_id: empleado.sucursal_id.toString(),
        creado_por_admin_de: req.usuario.sucursal_id,
      },
      ip: obtenerIp(req),
      sucursal_id: req.usuario.sucursal_id,
    });

    return res.status(201).json({
      mensaje: 'Empleado creado',
      empleado: {
        _id: empleado._id,
        nombre: empleado.nombre,
        email: empleado.email,
        telefono: empleado.telefono,
        puesto: empleado.puesto,
        sucursal_id: empleado.sucursal_id,
        activo: empleado.activo,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al crear empleado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizarEmpleado(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de empleado inválido' });
    }

    const { nombre, telefono, puesto, activo } = req.body;
    const actualizacion = {};
    if (nombre) actualizacion.nombre = nombre.trim();
    if (telefono) actualizacion.telefono = telefono.trim();
    if (puesto) {
      const PUESTOS_VALIDOS = ['mostrador', 'cocina', 'repartidor', 'administrador_sucursal'];
      if (!PUESTOS_VALIDOS.includes(puesto)) {
        return res.status(400).json({ error: 'Puesto inválido' });
      }
      actualizacion.puesto = puesto;
    }
    if (activo !== undefined) actualizacion.activo = activo;

    const empleado = await Empleado.findOneAndUpdate(
      { _id: id, sucursal_id: req.usuario.sucursal_id },
      actualizacion,
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado en tu sucursal' });
    }

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'actualizar_empleado',
      detalles: {
        empleado_id: id,
        email: empleado.email,
        cambios: req.body,
      },
      ip: obtenerIp(req),
      sucursal_id: req.usuario.sucursal_id,
    });

    return res.json({ mensaje: 'Empleado actualizado', empleado });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function eliminarEmpleado(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de empleado inválido' });
    }

    const empleado = await Empleado.findOneAndDelete({
      _id: id,
      sucursal_id: req.usuario.sucursal_id,
    });

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado en tu sucursal' });
    }

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'eliminar_empleado',
      detalles: {
        empleado_id: id,
        email: empleado.email,
        puesto: empleado.puesto,
      },
      ip: obtenerIp(req),
      sucursal_id: req.usuario.sucursal_id,
    });

    return res.json({ mensaje: 'Empleado eliminado' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function listarBitacora(req, res) {
  try {
    const coleccion = await obtenerColeccionBitacora();
    const { limite, accion, usuario_tipo, desde, hasta } = req.query;

    const filtro = {
      sucursal_id: new mongoose.Types.ObjectId(req.usuario.sucursal_id),
    };

    if (accion) filtro.accion = accion;
    if (usuario_tipo) filtro.usuario_tipo = usuario_tipo;
    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) filtro.fecha.$lte = new Date(hasta);
    }

    const limiteNum = Math.min(parseInt(limite, 10) || 50, 500);

    const registros = await coleccion
      .find(filtro)
      .sort({ fecha: -1 })
      .limit(limiteNum)
      .toArray();

    return res.json({
      total: registros.length,
      limite: limiteNum,
      sucursal_id: req.usuario.sucursal_id,
      filtros: { accion: accion || 'todos', usuario_tipo: usuario_tipo || 'todos' },
      registros,
    });
  } catch (error) {
    console.error('Error al listar bitácora:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function subirImagenProducto(req, res) {
  try {
    const { id } = req.params;
    const { imagen_base64 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    if (!imagen_base64 || typeof imagen_base64 !== 'string') {
      return res.status(400).json({ error: 'Falta la imagen (imagen_base64)' });
    }

    const regexImagen = /^data:image\/(jpeg|png|webp);base64,/i;
    if (!regexImagen.test(imagen_base64)) {
      return res.status(400).json({
        error: 'Formato de imagen inválido. Debe ser JPG, PNG o WebP en Base64.',
      });
    }

    const TAMANO_MAXIMO_BASE64 = 2.7 * 1024 * 1024;
    if (imagen_base64.length > TAMANO_MAXIMO_BASE64) {
      return res.status(400).json({
        error: 'La imagen es demasiado grande. Máximo 2 MB (después de comprimir).',
      });
    }

    const producto = await Producto.findByIdAndUpdate(
      id,
      { imagen_base64 },
      { returnDocument: 'after' }
    );

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'subir_imagen_producto',
      detalles: {
        producto_id: producto._id.toString(),
        nombre: producto.nombre,
        tamano_base64: imagen_base64.length,
      },
      ip: obtenerIp(req),
      sucursal_id: req.usuario.sucursal_id,
    });

    return res.json({
      mensaje: 'Imagen subida correctamente',
      producto,
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerMenuVisual(req, res) {
  try {
    const sucursalId = req.usuario.sucursal_id;

    const menu = await Menu.findOne({ sucursal_id: sucursalId }).lean();
    if (!menu || !menu.productos_ids || menu.productos_ids.length === 0) {
      return res.json({
        sucursal_id: sucursalId,
        total: 0,
        categorias: [],
      });
    }

    const inventarios = await Inventario.find({
      sucursal_id: sucursalId,
      producto_id: { $in: menu.productos_ids },
      stock: { $gt: 0 },
    }).lean();

    const stockPorProducto = new Map(
      inventarios.map((inv) => [inv.producto_id.toString(), inv.stock])
    );

    const productos = await Producto.find({
      _id: { $in: menu.productos_ids },
      disponible: true,
    }).lean();

    const productosFiltrados = productos.filter((p) =>
      stockPorProducto.has(p._id.toString())
    );

    const categorias = {};
    const ORDEN_CATEGORIAS = ['Entradas', 'Platos fuertes', 'Postres', 'Bebidas'];

    productosFiltrados.forEach((p) => {
      if (!categorias[p.categoria]) {
        categorias[p.categoria] = [];
      }
      categorias[p.categoria].push({
        _id: p._id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        imagen_base64: p.imagen_base64,
        stock: stockPorProducto.get(p._id.toString()),
      });
    });

    const categoriasArray = ORDEN_CATEGORIAS.filter((cat) => categorias[cat]).map(
      (cat) => ({
        nombre: cat,
        productos: categorias[cat],
      })
    );

    return res.json({
      sucursal_id: sucursalId,
      total: productosFiltrados.length,
      categorias: categoriasArray,
    });
  } catch (error) {
    console.error('Error al obtener menú visual:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function exportarBitacoraCSV(req, res) {
  try {
    const coleccion = await obtenerColeccionBitacora();

    const filtro = {
      sucursal_id: new mongoose.Types.ObjectId(req.usuario.sucursal_id),
    };

    const registros = await coleccion
      .find(filtro)
      .sort({ fecha: -1 })
      .limit(5000)
      .toArray();

    function escaparCSV(valor) {
      if (valor == null) return '';
      const str = String(valor);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const cabecera = 'fecha,accion,usuario_tipo,usuario_id,detalles,ip';

    const filas = registros.map((r) => {
      const fecha = r.fecha ? new Date(r.fecha).toISOString() : '';
      const accion = escaparCSV(r.accion);
      const usuarioTipo = escaparCSV(r.usuario_tipo);
      const usuarioId = r.usuario_id ? r.usuario_id.toString() : '';
      const detalles = escaparCSV(JSON.stringify(r.detalles || {}));
      const ip = escaparCSV(r.ip);
      return `${fecha},${accion},${usuarioTipo},${usuarioId},${detalles},${ip}`;
    });

    const csv = [cabecera, ...filas].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="bitacora-${new Date().toISOString().slice(0, 10)}.csv"`
    );

    return res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Error al exportar bitácora:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
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
};