import { useState, useEffect } from 'react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useConfirm } from '../contextos/ConfirmProvider';
import * as adminServicio from '../servicios/admin';
import api from '../servicios/api';
import { comprimirImagen, validarTamanoImagen } from '../utilidades/comprimirImagen';
import './PanelAdminSucursal.css';

function IconoProductos({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconoEmpleados({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconoMenu({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconoBitacora({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function IconoRefrescar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconoEditar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconoEliminar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconoCamara({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconoPlato({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function IconoDescargar({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconoBuscar({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconoCheckSimple({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconoXSimple({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PanelAdminSucursal() {
  const { empleado, cerrarSesion } = useAutenticacion();
  const [tabActiva, setTabActiva] = useState('productos');

  return (
    <div className="panel-admin">
      <header className="panel-header">
        <div>
          <h1>Admin de Sucursal</h1>
          <p className="panel-subtitulo">
            {empleado?.nombre} · {empleado?.puesto}
          </p>
        </div>
        <div className="panel-header-acciones">
          <button onClick={cerrarSesion} className="panel-boton-salir">
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="panel-tabs">
        <button
          className={`tab ${tabActiva === 'productos' ? 'tab-activa' : ''}`}
          onClick={() => setTabActiva('productos')}
        >
          <IconoProductos size={15} />
          Productos e Inventario
        </button>
        <button
          className={`tab ${tabActiva === 'empleados' ? 'tab-activa' : ''}`}
          onClick={() => setTabActiva('empleados')}
        >
          <IconoEmpleados size={15} />
          Empleados
        </button>
        <button
          className={`tab ${tabActiva === 'menu' ? 'tab-activa' : ''}`}
          onClick={() => setTabActiva('menu')}
        >
          <IconoMenu size={15} />
          Menú visual
        </button>
        <button
          className={`tab ${tabActiva === 'bitacora' ? 'tab-activa' : ''}`}
          onClick={() => setTabActiva('bitacora')}
        >
          <IconoBitacora size={15} />
          Bitácora
        </button>
      </nav>

      <div className="panel-contenido">
        {tabActiva === 'productos' && <TabProductos />}
        {tabActiva === 'empleados' && <TabEmpleados />}
        {tabActiva === 'menu' && <TabMenuVisual />}
        {tabActiva === 'bitacora' && <TabBitacora />}
      </div>
    </div>
  );
}

function TabProductos() {
  const { confirmar, toast } = useConfirm();
  const [productos, setProductos] = useState([]);
  const [inventarios, setInventarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [dataProductos, dataInventarios] = await Promise.all([
        adminServicio.listarProductos(),
        adminServicio.listarInventario(),
      ]);
      setProductos(dataProductos);
      setInventarios(dataInventarios);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function obtenerStock(productoId) {
    const inv = inventarios.find((i) => i.producto_id._id === productoId);
    return inv ? inv.stock : 0;
  }

  async function manejarGuardar(datos, imagenBase64, stockNuevo) {
    try {
      let productoGuardado;
      const esEdicion = !!productoEditando;

      if (esEdicion) {
        productoGuardado = await adminServicio.actualizarProducto(productoEditando._id, datos);
      } else {
        productoGuardado = await adminServicio.crearProducto(datos);
      }

      if (imagenBase64 !== undefined) {
        if (imagenBase64 === null) {
          await api.put(`/admin/mi-sucursal/productos/${productoGuardado._id}`, { imagen_base64: null });
        } else {
          await adminServicio.subirImagenProducto(productoGuardado._id, imagenBase64);
        }
      }

      if (stockNuevo !== undefined && stockNuevo !== null) {
        const stockActual = esEdicion ? obtenerStock(productoEditando._id) : 0;
        if (Number(stockNuevo) !== Number(stockActual)) {
          await adminServicio.ajustarInventario(productoGuardado._id, {
            stock: Number(stockNuevo),
          });
        }
      }

      setModalAbierto(false);
      setProductoEditando(null);
      toast(esEdicion ? 'Producto actualizado' : 'Producto creado', 'success');
      await cargar();
    } catch (err) {
      toast(err.response?.data?.error || 'Error al guardar producto', 'error');
    }
  }

  async function manejarEliminar(id) {
    const ok = await confirmar({
      titulo: 'Eliminar producto',
      mensaje: 'Se quitará del menú de todas las sucursales. Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar',
      peligro: true,
    });
    if (!ok) return;

    try {
      await adminServicio.eliminarProducto(id);
      toast('Producto eliminado correctamente', 'success');
      await cargar();
    } catch (err) {
      toast(err.response?.data?.error || 'No se pudo eliminar', 'error');
    }
  }

  if (cargando) return <p className="panel-estado">Cargando productos...</p>;

  return (
    <div>
      <div className="tab-acciones">
        <button
          className="boton-primario"
          onClick={() => {
            setProductoEditando(null);
            setModalAbierto(true);
          }}
        >
          + Nuevo producto
        </button>
      </div>

      {error && <div className="panel-error">{error}</div>}

      <table className="tabla-productos">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Disponible</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => {
            const stock = obtenerStock(p._id);
            const stockBajo = stock > 0 && stock <= 5;
            const agotado = stock === 0;
            return (
              <tr key={p._id}>
                <td>
                  {p.imagen_base64 ? (
                    <img
                      src={p.imagen_base64}
                      alt={p.nombre}
                      className="tabla-producto-img"
                    />
                  ) : (
                    <div
                      className="tabla-producto-sin-imagen"
                      aria-hidden="true"
                    />
                  )}
                </td>
                <td>
                  <strong>{p.nombre}</strong>
                  {p.descripcion && (
                    <p className="tabla-producto-desc">{p.descripcion}</p>
                  )}
                </td>
                <td>{p.categoria}</td>
                <td>${p.precio}</td>
                <td>
                  <span
                    className={`tabla-stock ${
                      agotado
                        ? "stock-agotado"
                        : stockBajo
                          ? "stock-bajo"
                          : "stock-ok"
                    }`}
                  >
                    <span className="tabla-stock-numero">{stock}</span>
                  </span>
                </td>
                <td>{p.disponible ? "Sí" : "No"}</td>
                <td>
                  <button
                    className="boton-accion"
                    onClick={() => {
                      setProductoEditando(p);
                      setModalAbierto(true);
                    }}
                    title="Editar"
                  >
                    <IconoEditar size={13} />
                  </button>
                  <button
                    className="boton-accion boton-peligro"
                    onClick={() => manejarEliminar(p._id)}
                    title="Eliminar"
                  >
                    <IconoEliminar size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modalAbierto && (
        <ModalProducto
          producto={productoEditando}
          stockActual={productoEditando ? obtenerStock(productoEditando._id) : 0}
          onGuardar={manejarGuardar}
          onCerrar={() => {
            setModalAbierto(false);
            setProductoEditando(null);
          }}
        />
      )}
    </div>
  );
}

function TabEmpleados() {
  const { confirmar, toast } = useConfirm();
  const [empleados, setEmpleados] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const [dataEmpleados, dataSucursales] = await Promise.all([
        adminServicio.listarEmpleados(),
        adminServicio.listarSucursales(),
      ]);
      setEmpleados(dataEmpleados);
      setSucursales(dataSucursales);
    } catch (err) {
      setError('No se pudieron cargar los empleados.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function manejarGuardar(datos) {
    try {
      if (empleadoEditando) {
        await adminServicio.actualizarEmpleado(empleadoEditando._id, datos);
      } else {
        await adminServicio.crearEmpleado(datos);
      }
      setModalAbierto(false);
      setEmpleadoEditando(null);
      toast(empleadoEditando ? 'Empleado actualizado' : 'Empleado creado', 'success');
      await cargar();
    } catch (err) {
      toast(err.response?.data?.error || 'Error al guardar empleado', 'error');
    }
  }

  async function manejarEliminar(id) {
    const ok = await confirmar({
      titulo: 'Eliminar empleado',
      mensaje: 'El empleado perderá acceso al sistema. ¿Deseas continuar?',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar',
      peligro: true,
    });
    if (!ok) return;

    try {
      await adminServicio.eliminarEmpleado(id);
      toast('Empleado eliminado', 'success');
      await cargar();
    } catch (err) {
      toast(err.response?.data?.error || 'No se pudo eliminar', 'error');
    }
  }

  function nombreSucursal(sucursalId) {
    const suc = sucursales.find((s) => s._id === sucursalId);
    return suc ? suc.nombre : '—';
  }

  if (cargando) return <p className="panel-estado">Cargando empleados...</p>;

  return (
    <div>
      <div className="tab-acciones">
        <button
          className="boton-primario"
          onClick={() => {
            setEmpleadoEditando(null);
            setModalAbierto(true);
          }}
        >
          + Nuevo empleado
        </button>
      </div>

      {error && <div className="panel-error">{error}</div>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Puesto</th>
            <th>Sucursal</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((e) => (
            <tr key={e._id}>
              <td>{e.nombre}</td>
              <td>{e.email}</td>
              <td>{e.telefono}</td>
              <td>{e.puesto}</td>
              <td>{nombreSucursal(e.sucursal_id)}</td>
              <td>{e.activo ? 'Sí' : 'No'}</td>
              <td>
                <button
                  className="boton-accion"
                  onClick={() => {
                    setEmpleadoEditando(e);
                    setModalAbierto(true);
                  }}
                >
                  <IconoEditar size={13} />
                </button>
                <button
                  className="boton-accion boton-peligro"
                  onClick={() => manejarEliminar(e._id)}
                >
                  <IconoEliminar size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAbierto && (
        <ModalEmpleado
          empleado={empleadoEditando}
          sucursales={sucursales}
          onGuardar={manejarGuardar}
          onCerrar={() => {
            setModalAbierto(false);
            setEmpleadoEditando(null);
          }}
        />
      )}
    </div>
  );
}

function ModalProducto({ producto, stockActual = 0, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    categoria: producto?.categoria || 'Platos fuertes',
    precio: producto?.precio || 0,
    descripcion: producto?.descripcion || '',
    disponible: producto?.disponible ?? true,
  });

  const [stock, setStock] = useState(producto ? stockActual : 0);

  const [imagenPreview, setImagenPreview] = useState(producto?.imagen_base64 || null);
  const [imagenCambiada, setImagenCambiada] = useState(false);
  const [procesandoImagen, setProcesandoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState('');

  function manejarCambio(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function manejarImagen(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setErrorImagen('');
    setProcesandoImagen(true);

    try {
      const base64 = await comprimirImagen(archivo, 800, 800, 0.75);
      if (!validarTamanoImagen(base64)) {
        throw new Error('La imagen es demasiado grande (máx 2 MB después de comprimir).');
      }
      setImagenPreview(base64);
      setImagenCambiada(true);
    } catch (err) {
      setErrorImagen(err.message);
    } finally {
      setProcesandoImagen(false);
    }
  }

  function quitarImagen() {
    setImagenPreview(null);
    setImagenCambiada(true);
  }

  function manejarSubmit(e) {
    e.preventDefault();
    onGuardar(
      { ...form, precio: Number(form.precio) },
      imagenCambiada ? imagenPreview : undefined,
      Number(stock)
    );
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <h3>{producto ? 'Editar producto' : 'Nuevo producto'}</h3>
        <form onSubmit={manejarSubmit} className="form-campos">
          <label className="form-label">
            Nombre
            <input name="nombre" value={form.nombre} onChange={manejarCambio} required className="form-input" />
          </label>
          <label className="form-label">
            Categoría
            <select name="categoria" value={form.categoria} onChange={manejarCambio} className="form-input">
              <option>Entradas</option>
              <option>Platos fuertes</option>
              <option>Postres</option>
              <option>Bebidas</option>
            </select>
          </label>
          <label className="form-label">
            Precio
            <input type="number" name="precio" value={form.precio} onChange={manejarCambio} required min="0" className="form-input" />
          </label>
          <label className="form-label">
            Descripción
            <input name="descripcion" value={form.descripcion} onChange={manejarCambio} className="form-input" />
          </label>

          <label className="form-label">
            Stock {producto ? 'disponible' : 'inicial'}
            <input
              type="number"
              name="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              className="form-input"
              placeholder="Ej. 50"
            />
            <small className="form-ayuda-campo">
              {producto
                ? 'Cantidad actual en inventario. Se actualizará al guardar.'
                : 'Cantidad disponible al crear el producto (por defecto 0).'}
            </small>
          </label>

          <div className="modal-imagen">
            <label className="form-label">Imagen (opcional)</label>
            {imagenPreview && (
              <div className="modal-imagen-preview">
                <img src={imagenPreview} alt="Vista previa" />
                <button type="button" className="modal-imagen-quitar" onClick={quitarImagen}>
                  Quitar imagen
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={manejarImagen}
              className="form-input"
              disabled={procesandoImagen}
            />
            {procesandoImagen && <p className="modal-imagen-info">Comprimiendo imagen...</p>}
            {errorImagen && <p className="form-error">{errorImagen}</p>}
            <p className="modal-imagen-info">
              Formatos: JPG, PNG, WebP. Máx 2 MB. Se redimensiona a 800×800.
            </p>
          </div>

          <label className="form-label-checkbox">
            <input type="checkbox" name="disponible" checked={form.disponible} onChange={manejarCambio} />
            Disponible
          </label>

          <div className="modal-acciones">
            <button type="button" onClick={onCerrar} className="boton-secundario">Cancelar</button>
            <button type="submit" className="boton-primario" disabled={procesandoImagen}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalEmpleado({ empleado, sucursales, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: empleado?.nombre || '',
    email: empleado?.email || '',
    password: '',
    telefono: empleado?.telefono || '',
    puesto: empleado?.puesto || 'mostrador',
    sucursal_id: empleado?.sucursal_id || '',
    activo: empleado?.activo ?? true,
  });

  const esAdmin = form.puesto === 'administrador_sucursal';

  function manejarCambio(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  function manejarSubmit(e) {
    e.preventDefault();

    const datos = { ...form };

    if (!esAdmin || empleado) {
      delete datos.sucursal_id;
    }

    if (empleado) {
      delete datos.email;
      delete datos.password;
    }

    onGuardar(datos);
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <h3>{empleado ? 'Editar empleado' : 'Nuevo empleado'}</h3>
        <form onSubmit={manejarSubmit} className="form-campos">
          <label className="form-label">
            Nombre
            <input
              name="nombre"
              value={form.nombre}
              onChange={manejarCambio}
              required
              className="form-input"
            />
          </label>

          {!empleado && (
            <>
              <label className="form-label">
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={manejarCambio}
                  required
                  className="form-input"
                />
              </label>
              <label className="form-label">
                Password
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={manejarCambio}
                  required
                  className="form-input"
                  placeholder="Mín. 8 chars, 1 may, 1 min, 1 num"
                />
              </label>
            </>
          )}

          <label className="form-label">
            Teléfono
            <input
              name="telefono"
              value={form.telefono}
              onChange={manejarCambio}
              required
              className="form-input"
            />
          </label>

          <label className="form-label">
            Puesto
            <select
              name="puesto"
              value={form.puesto}
              onChange={manejarCambio}
              className="form-input"
            >
              <option value="mostrador">Mostrador</option>
              <option value="cocina">Cocina</option>
              <option value="repartidor">Repartidor</option>
              <option value="administrador_sucursal">Administrador de sucursal</option>
            </select>
          </label>

          {esAdmin && !empleado && (
            <label className="form-label">
              Sucursal que administrará
              <select
                name="sucursal_id"
                value={form.sucursal_id}
                onChange={manejarCambio}
                className="form-input"
                required
              >
                <option value="">— Selecciona una sucursal —</option>
                {sucursales.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.nombre} ({s.region})
                  </option>
                ))}
              </select>
            </label>
          )}

          {!esAdmin && !empleado && (
            <p className="modal-nota-sucursal">
              Este empleado se asignará automáticamente a tu sucursal.
            </p>
          )}

          <label className="form-label-checkbox">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={manejarCambio}
            />
            Activo
          </label>

          <div className="modal-acciones">
            <button type="button" onClick={onCerrar} className="boton-secundario">
              Cancelar
            </button>
            <button type="submit" className="boton-primario">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TabMenuVisual() {
  const [menu, setMenu] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const data = await adminServicio.obtenerMenuVisual();
      setMenu(data);
    } catch (err) {
      setError('No se pudo cargar el menú.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  if (cargando) return <p className="panel-estado">Cargando menú...</p>;

  return (
    <div>
      {error && <div className="panel-error">{error}</div>}

      <div className="menu-visual-header">
        <div>
          <h2>Menú de la sucursal</h2>
          <p>
            Vista previa de cómo los clientes ven el menú. Solo se muestran
            productos disponibles y con stock.
          </p>
        </div>
        <button onClick={cargar} className="boton-secundario">
          <IconoRefrescar size={13} />
          Refrescar
        </button>
      </div>

      {menu && menu.total === 0 && (
        <div className="menu-visual-vacio">
          <p>No hay productos disponibles en el menú.</p>
        </div>
      )}

      {menu &&
        menu.categorias.map((cat) => (
          <section key={cat.nombre} className="menu-categoria">
            <h3 className="menu-categoria-titulo">{cat.nombre}</h3>
            <div className="menu-categoria-grid">
              {cat.productos.map((p) => (
                <div key={p._id} className="menu-visual-card">
                  {p.imagen_base64 ? (
                    <img
                      src={p.imagen_base64}
                      alt={p.nombre}
                      className="menu-visual-img"
                    />
                  ) : (
                    <div
                      className="menu-visual-sin-imagen"
                      aria-hidden="true"
                    />
                  )}
                  <div className="menu-visual-info">
                    <h4>{p.nombre}</h4>
                    {p.descripcion && (
                      <p className="menu-visual-desc">{p.descripcion}</p>
                    )}
                    <div className="menu-visual-footer">
                      <span className="menu-visual-precio">${p.precio}</span>
                      <span className="menu-visual-stock">
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

function TabBitacora() {
  const { toast } = useConfirm();
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const filtros = { limite: 100 };
      if (filtroAccion) filtros.accion = filtroAccion;
      if (filtroTipo) filtros.usuario_tipo = filtroTipo;

      const data = await adminServicio.listarBitacora(filtros);
      setRegistros(data.registros);
    } catch (err) {
      setError('No se pudo cargar la bitácora.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function descargarCSV() {
    try {
      const blob = await adminServicio.descargarBitacoraCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitacora-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast('CSV descargado', 'success');
    } catch (err) {
      toast('No se pudo descargar el CSV', 'error');
    }
  }

  function descargarPDF() {
    try {
      const doc = adminServicio.generarBitacoraPDF(registros, 'Brasa Norte');
      doc.save(`bitacora-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast('PDF generado', 'success');
    } catch (err) {
      console.error('Error al generar PDF:', err);
      toast('No se pudo generar el PDF', 'error');
    }
  }

  function formatoFecha(fecha) {
    return new Date(fecha).toLocaleString('es-MX');
  }

  function colorAccion(accion) {
    if (accion.startsWith('login')) return 'badge-azul';
    if (accion.startsWith('crear') || accion === 'registro_cliente') return 'badge-verde';
    if (accion.startsWith('actualizar') || accion.startsWith('ajustar') || accion === 'subir_imagen_producto') return 'badge-naranja';
    if (accion.startsWith('eliminar')) return 'badge-rojo';
    if (accion === 'registrar_pago') return 'badge-morado';
    if (accion === 'cambiar_estado_pedido' || accion === 'crear_pedido') return 'badge-azul-claro';
    return 'badge-gris';
  }

  function resumirDetalles(r) {
    const d = r.detalles || {};
    if (r.accion.includes('login') || r.accion === 'registro_cliente') {
      return d.email || '—';
    }
    if (r.accion === 'crear_pedido') {
      return `Pedido #${(d.pedido_id || '').slice(-6).toUpperCase()} · $${d.total || 0} · ${d.tipo || ''}`;
    }
    if (r.accion === 'cambiar_estado_pedido') {
      return `Pedido #${(d.pedido_id || '').slice(-6).toUpperCase()} · ${d.estado_anterior} → ${d.estado_nuevo}`;
    }
    if (r.accion === 'registrar_pago') {
      return `Pedido #${(d.pedido_id || '').slice(-6).toUpperCase()} · $${d.monto || 0} · ${d.metodo_pago || ''}`;
    }
    if (r.accion.startsWith('crear_producto') || r.accion.startsWith('actualizar_producto') || r.accion === 'eliminar_producto') {
      return `${d.nombre || d.producto_id || ''}`;
    }
    if (r.accion === 'subir_imagen_producto') {
      return `Producto #${(d.producto_id || '').slice(-6).toUpperCase()} · ${Math.round((d.tamano_base64 || 0) / 1024)} KB`;
    }
    if (r.accion.startsWith('crear_empleado') || r.accion.startsWith('actualizar_empleado') || r.accion === 'eliminar_empleado') {
      return `${d.email || ''} (${d.puesto || ''})`;
    }
    if (r.accion === 'ajustar_inventario') {
      return `${d.producto_nombre || ''} · ${d.stock_anterior} → ${d.stock_nuevo}`;
    }
    return '—';
  }

  return (
    <div>
      <div className="bitacora-controles">
        <div className="bitacora-filtros">
          <label className="form-label">
            Acción
            <select value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)} className="form-input">
              <option value="">Todas</option>
              <option value="login_cliente_exitoso">Login cliente (éxito)</option>
              <option value="login_cliente_fallido">Login cliente (fallo)</option>
              <option value="login_empleado_exitoso">Login empleado (éxito)</option>
              <option value="login_empleado_fallido">Login empleado (fallo)</option>
              <option value="registro_cliente">Registro cliente</option>
              <option value="crear_pedido">Crear pedido</option>
              <option value="cambiar_estado_pedido">Cambiar estado pedido</option>
              <option value="registrar_pago">Registrar pago</option>
              <option value="crear_producto">Crear producto</option>
              <option value="actualizar_producto">Actualizar producto</option>
              <option value="eliminar_producto">Eliminar producto</option>
              <option value="subir_imagen_producto">Subir imagen producto</option>
              <option value="ajustar_inventario">Ajustar inventario</option>
              <option value="crear_empleado">Crear empleado</option>
              <option value="actualizar_empleado">Actualizar empleado</option>
              <option value="eliminar_empleado">Eliminar empleado</option>
            </select>
          </label>

          <label className="form-label">
            Tipo
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="form-input">
              <option value="">Todos</option>
              <option value="cliente">Cliente</option>
              <option value="empleado">Empleado</option>
              <option value="sistema">Sistema</option>
            </select>
          </label>
        </div>

        <div className="bitacora-botones">
          <button className="boton-primario" onClick={cargar}>
            <IconoBuscar size={13} />
            Aplicar
          </button>
          <button className="boton-secundario" onClick={() => { setFiltroAccion(''); setFiltroTipo(''); cargar(); }}>
            Limpiar
          </button>
          <button className="boton-secundario" onClick={descargarCSV}>
            <IconoDescargar size={13} />
            CSV
          </button>
          <button className="boton-primario" onClick={descargarPDF}>
            <IconoDescargar size={13} />
            PDF
          </button>
        </div>
      </div>

      {error && <div className="panel-error">{error}</div>}

      <p className="bitacora-total">Total: {registros.length} registros</p>

      <table className="tabla tabla-bitacora">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Acción</th>
            <th>Tipo</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r._id}>
              <td className="celda-fecha">{formatoFecha(r.fecha)}</td>
              <td>
                <span className={`accion ${colorAccion(r.accion)}`}>
                  {r.accion}
                </span>
              </td>
              <td>{r.usuario_tipo}</td>
              <td className="celda-detalles">{resumirDetalles(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {registros.length === 0 && !error && (
        <p className="panel-vacio">No hay registros con esos filtros.</p>
      )}
    </div>
  );
}

export default PanelAdminSucursal;