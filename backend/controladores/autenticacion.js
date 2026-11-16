const Cliente = require('../esquemas/cliente.esquema');
const Empleado = require('../esquemas/empleado');
const { generarToken } = require('../utilidades/jwt');
const { correoVal, passVal, telVal } = require('../utilidades/validaciones');
const { registrarBitacora, obtenerIp } = require('../utilidades/bitacora');

async function registrarCliente(req, res) {
  try {
    const { nombre, email, password: pass, telefono, direccion } = req.body;

    const nombreVal = nombre && typeof nombre === 'string' && nombre.trim().length >= 2;
    if (!nombreVal) {
      return res.status(400).json({ error: 'El nombre es obligatorio (mínimo 2 caracteres)' });
    }

    const correoOk = correoVal(email);
    if (!correoOk) {
      return res.status(400).json({ error: 'El email no tiene un formato válido' });
    }

    const passOk = passVal(pass);
    if (!passOk) {
      return res.status(400).json({
        error: 'El pass debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
      });
    }

    const telOk = telefono && telVal(telefono);
    if (!telOk) {
      return res.status(400).json({ error: 'El teléfono es obligatorio y debe tener 10 dígitos' });
    }

    const emailNorm = email.toLowerCase().trim();
    const clienteExistente = await Cliente.findOne({ email: emailNorm });
    if (clienteExistente) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese email' });
    }

    const cliente = new Cliente({
      nombre: nombre.trim(),
      email: emailNorm,
      password_hash: pass,
      telefono: telefono.trim(),
      direccion: direccion ? direccion.trim() : undefined,
    });

    await cliente.save();

    const token = generarToken({ id: cliente._id.toString(), rol: 'cliente' });

    await registrarBitacora({
      usuario_id: cliente._id,
      usuario_tipo: 'cliente',
      accion: 'registro_cliente',
      detalles: { email: emailNorm },
      ip: obtenerIp(req),
      sucursal_id: null,
    });

    return res.status(201).json({
      mensaje: 'Cliente registrado correctamente',
      token,
      cliente: cliente.toJSON(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese email' });
    }
    console.error('Error en registro de cliente:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function iniciarSesionUnificada(req, res) {
  try {
    const { email, password: pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({ error: 'Email y pass son obligatorios' });
    }

    const emailNorm = email.toLowerCase().trim();

    const cliente = await Cliente.findOne({ email: emailNorm });
    if (cliente) {
      if (!cliente.activo) {
        await registrarBitacora({
          usuario_id: cliente._id,
          usuario_tipo: 'cliente',
          accion: 'login_cliente_fallido',
          detalles: { email: emailNorm, motivo: 'cuenta_desactivada' },
          ip: obtenerIp(req),
          sucursal_id: null,
        });
        return res.status(403).json({ error: 'La cuenta está desactivada' });
      }

      const passOk = await cliente.compararPass(pass);
      if (!passOk) {
        await registrarBitacora({
          usuario_id: cliente._id,
          usuario_tipo: 'cliente',
          accion: 'login_cliente_fallido',
          detalles: { email: emailNorm, motivo: 'password_incorrecto' },
          ip: obtenerIp(req),
          sucursal_id: null,
        });
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = generarToken({ id: cliente._id.toString(), rol: 'cliente' });

      await registrarBitacora({
        usuario_id: cliente._id,
        usuario_tipo: 'cliente',
        accion: 'login_cliente_exitoso',
        detalles: { email: emailNorm },
        ip: obtenerIp(req),
        sucursal_id: null,
      });

      return res.json({
        tipo: 'cliente',
        mensaje: 'Sesión iniciada correctamente',
        token,
        cliente: cliente.toJSON(),
      });
    }

    const empleado = await Empleado.findOne({ email: emailNorm });
    if (empleado) {
      if (!empleado.activo) {
        await registrarBitacora({
          usuario_id: empleado._id,
          usuario_tipo: 'empleado',
          accion: 'login_empleado_fallido',
          detalles: { email: emailNorm, motivo: 'cuenta_desactivada' },
          ip: obtenerIp(req),
          sucursal_id: empleado.sucursal_id,
        });
        return res.status(403).json({ error: 'La cuenta está desactivada' });
      }

      const passOk = await empleado.compararPass(pass);
      if (!passOk) {
        await registrarBitacora({
          usuario_id: empleado._id,
          usuario_tipo: 'empleado',
          accion: 'login_empleado_fallido',
          detalles: { email: emailNorm, motivo: 'password_incorrecto' },
          ip: obtenerIp(req),
          sucursal_id: empleado.sucursal_id,
        });
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = generarToken({
        id: empleado._id.toString(),
        rol: 'empleado',
        puesto: empleado.puesto,
        sucursal_id: empleado.sucursal_id.toString(),
      });

      await registrarBitacora({
        usuario_id: empleado._id,
        usuario_tipo: 'empleado',
        accion: 'login_empleado_exitoso',
        detalles: { email: emailNorm, puesto: empleado.puesto },
        ip: obtenerIp(req),
        sucursal_id: empleado.sucursal_id,
      });

      return res.json({
        tipo: 'empleado',
        mensaje: 'Sesión iniciada correctamente',
        token,
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
    }

    await registrarBitacora({
      usuario_id: null,
      usuario_tipo: 'sistema',
      accion: 'login_fallido',
      detalles: { email: emailNorm, motivo: 'usuario_no_existe' },
      ip: obtenerIp(req),
      sucursal_id: null,
    });

    return res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (error) {
    console.error('Error en login unificado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerPerfil(req, res) {
  try {
    const cliente = await Cliente.findById(req.usuario.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    return res.json({ cliente: cliente.toJSON() });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function iniciarSesionEmpleado(req, res) {
  try {
    const { email, password: pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({ error: 'Email y pass son obligatorios' });
    }

    const emailNorm = email.toLowerCase().trim();
    const empleado = await Empleado.findOne({ email: emailNorm });

    if (!empleado) {
      await registrarBitacora({
        usuario_id: null,
        usuario_tipo: 'empleado',
        accion: 'login_empleado_fallido',
        detalles: { email: emailNorm, motivo: 'usuario_no_existe' },
        ip: obtenerIp(req),
        sucursal_id: null,
      });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!empleado.activo) {
      await registrarBitacora({
        usuario_id: empleado._id,
        usuario_tipo: 'empleado',
        accion: 'login_empleado_fallido',
        detalles: { email: emailNorm, motivo: 'cuenta_desactivada' },
        ip: obtenerIp(req),
        sucursal_id: empleado.sucursal_id,
      });
      return res.status(403).json({ error: 'La cuenta está desactivada' });
    }

    const passOk = await empleado.compararPass(pass);
    if (!passOk) {
      await registrarBitacora({
        usuario_id: empleado._id,
        usuario_tipo: 'empleado',
        accion: 'login_empleado_fallido',
        detalles: { email: emailNorm, motivo: 'password_incorrecto' },
        ip: obtenerIp(req),
        sucursal_id: empleado.sucursal_id,
      });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken({
      id: empleado._id.toString(),
      rol: 'empleado',
      puesto: empleado.puesto,
      sucursal_id: empleado.sucursal_id.toString(),
    });

    await registrarBitacora({
      usuario_id: empleado._id,
      usuario_tipo: 'empleado',
      accion: 'login_empleado_exitoso',
      detalles: { email: emailNorm, puesto: empleado.puesto },
      ip: obtenerIp(req),
      sucursal_id: empleado.sucursal_id,
    });

    return res.json({
      mensaje: 'Sesión iniciada correctamente',
      token,
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
    console.error('Error en login de empleado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  registrarCliente,
  iniciarSesionCliente: iniciarSesionUnificada,
  iniciarSesionUnificada,
  obtenerPerfil,
  iniciarSesionEmpleado,
};