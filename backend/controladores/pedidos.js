const mongoose = require('mongoose');
const Pedido = require('../esquemas/pedido');
const Producto = require('../esquemas/producto');
const Sucursal = require('../esquemas/sucursal');
const Menu = require('../esquemas/menu');
const Inventario = require('../esquemas/inventario');
const Pago = require('../esquemas/pago');
const { registrarBitacora, obtenerIp } = require('../utilidades/bitacora');

async function crearPedido(req, res) {
  const { sucursal_id, tipo, productos, telefono_contacto, direccion_entrega } = req.body;

  if (!mongoose.Types.ObjectId.isValid(sucursal_id)) {
    return res.status(400).json({ error: 'ID de sucursal inválido' });
  }

  if (!['domicilio', 'establecimiento'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de pedido inválido' });
  }

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
  }

  if (tipo === 'domicilio' && !direccion_entrega) {
    return res.status(400).json({ error: 'Para envío a domicilio se requiere dirección' });
  }

  if (!telefono_contacto) {
    return res.status(400).json({ error: 'El teléfono de contacto es obligatorio' });
  }

  for (const p of productos) {
    if (!mongoose.Types.ObjectId.isValid(p.producto_id)) {
      return res.status(400).json({ error: `Producto con ID inválido: ${p.producto_id}` });
    }
    if (!Number.isInteger(p.cantidad) || p.cantidad < 1) {
      return res.status(400).json({ error: 'Cada cantidad debe ser un entero ≥ 1' });
    }
  }

  const sucursal = await Sucursal.findById(sucursal_id);
  if (!sucursal) {
    return res.status(404).json({ error: 'Sucursal no encontrada' });
  }

  const menu = await Menu.findOne({ sucursal_id });
  if (!menu) {
    return res.status(400).json({ error: 'La sucursal no tiene menú configurado' });
  }

  const idsEnMenu = new Set(menu.productos_ids.map((id) => id.toString()));
  for (const p of productos) {
    if (!idsEnMenu.has(p.producto_id)) {
      return res.status(400).json({
        error: `El producto ${p.producto_id} no está disponible en esta sucursal`,
      });
    }
  }

  const idsProductos = productos.map((p) => p.producto_id);
  const productosDb = await Producto.find({ _id: { $in: idsProductos } }).lean();
  const mapaProductos = new Map(productosDb.map((prod) => [prod._id.toString(), prod]));

  let total = 0;
  const lineasPedido = [];

  for (const p of productos) {
    const prod = mapaProductos.get(p.producto_id);
    if (!prod) {
      return res.status(400).json({ error: `Producto no encontrado: ${p.producto_id}` });
    }
    if (!prod.disponible) {
      return res.status(400).json({ error: `El producto "${prod.nombre}" no está disponible` });
    }
    const subtotal = prod.precio * p.cantidad;
    total += subtotal;
    lineasPedido.push({
      producto_id: prod._id,
      nombre: prod.nombre,
      cantidad: p.cantidad,
      precio_unitario: prod.precio,
      subtotal,
    });
  }

  const sesion = await mongoose.startSession();

  try {
    let pedidoCreado = null;

    await sesion.withTransaction(async () => {
      for (const p of productos) {
        const resultado = await Inventario.findOneAndUpdate(
          {
            sucursal_id,
            producto_id: p.producto_id,
            stock: { $gte: p.cantidad },
          },
          {
            $inc: { stock: -p.cantidad, version: 1 },
            $set: { ultima_actualizacion: new Date(), actualizado_por: req.usuario.id },
          },
          { returnDocument: 'after', session: sesion }
        );

        if (!resultado) {
          throw new Error(`STOCK_INSUFICIENTE:${p.producto_id}`);
        }
      }

      const [pedido] = await Pedido.create(
        [
          {
            cliente_id: req.usuario.id,
            sucursal_id,
            region: sucursal.region,
            tipo,
            estado: 'enviado',
            productos: lineasPedido,
            total,
            metodo_pago: 'efectivo',
            telefono_contacto,
            direccion_entrega: direccion_entrega || null,
            empleado_preparando: null,
            fecha_inicio_preparacion: null,
            repartidor_asignado: null,
            historial_estados: [
              { estado: 'enviado', fecha: new Date(), nota: 'Pedido creado por el cliente' },
            ],
          },
        ],
        { session: sesion }
      );

      pedidoCreado = pedido;
    });

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'cliente',
      accion: 'crear_pedido',
      detalles: {
        pedido_id: pedidoCreado._id.toString(),
        total: pedidoCreado.total,
        sucursal_id: pedidoCreado.sucursal_id.toString(),
        tipo: pedidoCreado.tipo,
        productos: pedidoCreado.productos.map((p) => ({ nombre: p.nombre, cantidad: p.cantidad })),
      },
      ip: obtenerIp(req),
      sucursal_id: pedidoCreado.sucursal_id,
    });

    return res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido: pedidoCreado,
    });
  } catch (error) {
    if (error.message && error.message.startsWith('STOCK_INSUFICIENTE:')) {
      const productoId = error.message.split(':')[1];
      return res.status(409).json({
        error: 'Stock insuficiente para uno o más productos',
        producto_id: productoId,
      });
    }
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    await sesion.endSession();
  }
}

async function cambiarEstadoPedido(req, res) {
  try {
    const { id } = req.params;
    const { nuevo_estado, nota } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    if (!nuevo_estado) {
      return res.status(400).json({ error: 'Falta el campo nuevo_estado' });
    }

    const TRANSICIONES_VALIDAS = {
      enviado: ['en_proceso_preparacion'],
      en_proceso_preparacion: ['en_camino', 'listo_para_recoger'],
      en_camino: ['entregado'],
      listo_para_recoger: ['entregado'],
      entregado: [],
    };

    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedido.sucursal_id.toString() !== req.usuario.sucursal_id) {
      return res.status(403).json({ error: 'No puedes modificar pedidos de otra sucursal' });
    }

    const transicionesPermitidas = TRANSICIONES_VALIDAS[pedido.estado] || [];
    if (!transicionesPermitidas.includes(nuevo_estado)) {
      return res.status(409).json({
        error: `Transición inválida: no se puede pasar de "${pedido.estado}" a "${nuevo_estado}"`,
        transiciones_permitidas: transicionesPermitidas,
      });
    }

    if (pedido.estado === 'en_proceso_preparacion') {
      if (
        pedido.empleado_preparando &&
        pedido.empleado_preparando.toString() !== req.usuario.id
      ) {
        return res.status(409).json({
          error: 'Este pedido lo está preparando otro compañero.',
        });
      }
    }

    const estadoAnterior = pedido.estado;

    if (nuevo_estado === 'en_proceso_preparacion') {
      if (
        pedido.empleado_preparando &&
        pedido.empleado_preparando.toString() !== req.usuario.id
      ) {
        return res.status(409).json({
          error: 'Este pedido ya lo tomó otro compañero.',
        });
      }
      pedido.empleado_preparando = req.usuario.id;
      pedido.fecha_inicio_preparacion = new Date();
    }

    if (nuevo_estado === 'en_camino') {
      pedido.repartidor_asignado = null;
    }

    pedido.estado = nuevo_estado;
    pedido.fecha_actualizacion = new Date();
    pedido.historial_estados.push({
      estado: nuevo_estado,
      fecha: new Date(),
      empleado_id: req.usuario.id,
      nota: nota || '',
    });

    await pedido.save();

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'cambiar_estado_pedido',
      detalles: {
        pedido_id: pedido._id.toString(),
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevo_estado,
        puesto: req.usuario.puesto,
        nota: nota || '',
      },
      ip: obtenerIp(req),
      sucursal_id: pedido.sucursal_id,
    });

    const pedidoActualizado = await Pedido.findById(pedido._id)
      .populate('empleado_preparando', 'nombre puesto')
      .populate('repartidor_asignado', 'nombre puesto')
      .lean();

    return res.json({
      mensaje: 'Estado actualizado correctamente',
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function tomarPedidoRepartidor(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    if (req.usuario.puesto !== 'repartidor') {
      return res.status(403).json({ error: 'Solo los repartidores pueden tomar pedidos.' });
    }

    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedido.sucursal_id.toString() !== req.usuario.sucursal_id) {
      return res.status(403).json({ error: 'No puedes tomar pedidos de otra sucursal' });
    }

    if (pedido.estado !== 'en_camino') {
      return res.status(409).json({ error: 'Solo se pueden tomar pedidos en camino.' });
    }

    if (
      pedido.repartidor_asignado &&
      pedido.repartidor_asignado.toString() !== req.usuario.id
    ) {
      return res.status(409).json({
        error: 'Este pedido ya lo tomó otro repartidor.',
      });
    }

    if (
      pedido.repartidor_asignado &&
      pedido.repartidor_asignado.toString() === req.usuario.id
    ) {
      return res.json({ mensaje: 'Ya tienes este pedido.', pedido });
    }

    pedido.repartidor_asignado = req.usuario.id;
    pedido.fecha_actualizacion = new Date();
    pedido.historial_estados.push({
      estado: 'en_camino',
      fecha: new Date(),
      empleado_id: req.usuario.id,
      nota: `Repartidor tomó el pedido`,
    });
    await pedido.save();

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'tomar_pedido_repartidor',
      detalles: {
        pedido_id: pedido._id.toString(),
        puesto: req.usuario.puesto,
      },
      ip: obtenerIp(req),
      sucursal_id: pedido.sucursal_id,
    });

    const pedidoActualizado = await Pedido.findById(pedido._id)
      .populate('empleado_preparando', 'nombre puesto')
      .populate('repartidor_asignado', 'nombre puesto')
      .lean();

    return res.json({ mensaje: 'Pedido asignado.', pedido: pedidoActualizado });
  } catch (error) {
    console.error('Error al tomar pedido:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function listarMisPedidos(req, res) {
  try {
    const pedidos = await Pedido.find({ cliente_id: req.usuario.id })
      .sort({ fecha_creacion: -1 })
      .lean();
    return res.json({ total: pedidos.length, pedidos });
  } catch (error) {
    console.error('Error al listar mis pedidos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function listarPedidosPorSucursal(req, res) {
  try {
    const { sucursalId } = req.params;
    const { estado, limite } = req.query;

    if (!mongoose.Types.ObjectId.isValid(sucursalId)) {
      return res.status(400).json({ error: 'ID de sucursal inválido' });
    }

    if (sucursalId !== req.usuario.sucursal_id) {
      return res.status(403).json({ error: 'No puedes ver pedidos de otra sucursal' });
    }

    const filtro = { sucursal_id: sucursalId };
    if (estado) {
      const estadosValidos = [
        'enviado',
        'en_proceso_preparacion',
        'en_camino',
        'listo_para_recoger',
        'entregado',
      ];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido en el filtro' });
      }
      filtro.estado = estado;
    }

    const limiteNum = Math.min(parseInt(limite, 10) || 50, 200);

    const pedidos = await Pedido.find(filtro)
      .populate('empleado_preparando', 'nombre puesto')
      .populate('repartidor_asignado', 'nombre puesto')
      .sort({ fecha_creacion: -1 })
      .limit(limiteNum)
      .lean();

    return res.json({
      sucursal_id: sucursalId,
      filtro_estado: estado || 'todos',
      total: pedidos.length,
      pedidos,
    });
  } catch (error) {
    console.error('Error al listar pedidos de sucursal:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function registrarPagoYEntregar(req, res) {
  const { id } = req.params;
  const { metodo_pago = 'efectivo' } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de pedido inválido' });
  }

  if (!['efectivo'].includes(metodo_pago)) {
    return res.status(400).json({ error: 'Método de pago inválido' });
  }

  const sesion = await mongoose.startSession();

  try {
    let pagoCreado = null;
    let pedidoActualizado = null;

    await sesion.withTransaction(async () => {
      const pedido = await Pedido.findById(id).session(sesion);
      if (!pedido) {
        throw new Error('PEDIDO_NO_ENCONTRADO');
      }

      if (pedido.sucursal_id.toString() !== req.usuario.sucursal_id) {
        throw new Error('SUCURSAL_INCORRECTA');
      }

      if (!['listo_para_recoger', 'en_camino'].includes(pedido.estado)) {
        throw new Error('ESTADO_INVALIDO');
      }

      const pagoExistente = await Pago.findOne({ pedido_id: id }).session(sesion);
      if (pagoExistente) {
        throw new Error('YA_PAGADO');
      }

      const [pago] = await Pago.create(
        [
          {
            pedido_id: pedido._id,
            monto: pedido.total,
            metodo_pago,
            fecha_pago: new Date(),
            cobrado_por: req.usuario.id,
          },
        ],
        { session: sesion }
      );
      pagoCreado = pago;

      pedido.estado = 'entregado';
      pedido.fecha_actualizacion = new Date();
      pedido.repartidor_asignado = null;
      pedido.historial_estados.push({
        estado: 'entregado',
        fecha: new Date(),
        empleado_id: req.usuario.id,
        nota: `Pagado en efectivo y entregado por ${req.usuario.puesto}`,
      });
      await pedido.save({ session: sesion });
      pedidoActualizado = pedido;
    });

    await registrarBitacora({
      usuario_id: req.usuario.id,
      usuario_tipo: 'empleado',
      accion: 'registrar_pago',
      detalles: {
        pedido_id: pedidoActualizado._id.toString(),
        monto: pedidoActualizado.total,
        metodo_pago: 'efectivo',
        puesto: req.usuario.puesto,
        tipo_pedido: pedidoActualizado.tipo,
      },
      ip: obtenerIp(req),
      sucursal_id: pedidoActualizado.sucursal_id,
    });

    return res.json({
      mensaje: 'Pago registrado y pedido entregado',
      pago: pagoCreado,
      pedido: pedidoActualizado,
    });
  } catch (error) {
    const mapaErrores = {
      PEDIDO_NO_ENCONTRADO: { status: 404, error: 'Pedido no encontrado' },
      SUCURSAL_INCORRECTA: { status: 403, error: 'No puedes cobrar pedidos de otra sucursal' },
      ESTADO_INVALIDO: {
        status: 409,
        error: 'El pedido no está en un estado cobrable (listo_para_recoger o en_camino)',
      },
      YA_PAGADO: { status: 409, error: 'Este pedido ya fue pagado' },
    };

    if (mapaErrores[error.message]) {
      return res
        .status(mapaErrores[error.message].status)
        .json({ error: mapaErrores[error.message].error });
    }

    if (error.code === 11000) {
      return res.status(409).json({ error: 'Este pedido ya fue pagado' });
    }

    console.error('Error al registrar pago:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    await sesion.endSession();
  }
}

async function listarMisPreparados(req, res) {
  try {
    const empleadoIdStr = req.usuario.id;

    if (!mongoose.Types.ObjectId.isValid(empleadoIdStr)) {
      return res.status(400).json({ error: 'ID de empleado inválido' });
    }
    const empleadoId = new mongoose.Types.ObjectId(empleadoIdStr);

    const { limite } = req.query;
    const limiteNum = Math.min(parseInt(limite, 10) || 50, 200);

    const pedidos = await Pedido.find({
      sucursal_id: req.usuario.sucursal_id,
      'historial_estados.empleado_id': empleadoId,
    })
      .populate('empleado_preparando', 'nombre puesto')
      .populate('repartidor_asignado', 'nombre puesto')
      .sort({ fecha_actualizacion: -1 })
      .limit(limiteNum)
      .lean();

    const preparados = pedidos.filter((pedido) => {
      return pedido.historial_estados.some(
        (h) =>
          h.empleado_id &&
          h.empleado_id.toString() === empleadoIdStr &&
          ['en_proceso_preparacion', 'listo_para_recoger', 'en_camino'].includes(h.estado)
      );
    });

    return res.json({
      total: preparados.length,
      empleado_id: empleadoIdStr,
      pedidos: preparados,
    });
  } catch (error) {
    console.error('Error al listar mis preparados:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function listarMisCobros(req, res) {
  try {
    const empleadoIdStr = req.usuario.id;

    if (!mongoose.Types.ObjectId.isValid(empleadoIdStr)) {
      return res.status(400).json({ error: 'ID de empleado inválido' });
    }
    const empleadoId = new mongoose.Types.ObjectId(empleadoIdStr);

    const { limite } = req.query;
    const limiteNum = Math.min(parseInt(limite, 10) || 50, 200);

    const pedidos = await Pedido.find({
      sucursal_id: req.usuario.sucursal_id,
      estado: 'entregado',
      'historial_estados.empleado_id': empleadoId,
    })
      .sort({ fecha_actualizacion: -1 })
      .limit(limiteNum)
      .lean();

    const cobrados = pedidos.filter((pedido) => {
      return pedido.historial_estados.some(
        (h) =>
          h.empleado_id &&
          h.empleado_id.toString() === empleadoIdStr &&
          h.estado === 'entregado'
      );
    });

    const totalCobrado = cobrados.reduce((suma, p) => suma + p.total, 0);

    return res.json({
      total: cobrados.length,
      total_cobrado: totalCobrado,
      empleado_id: empleadoIdStr,
      pedidos: cobrados,
    });
  } catch (error) {
    console.error('Error al listar mis cobros:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  crearPedido,
  cambiarEstadoPedido,
  tomarPedidoRepartidor,
  listarMisPedidos,
  listarPedidosPorSucursal,
  registrarPagoYEntregar,
  listarMisPreparados,
  listarMisCobros,
};