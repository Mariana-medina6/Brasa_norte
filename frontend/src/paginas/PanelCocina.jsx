import { useState, useEffect } from 'react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import api from '../servicios/api';
import { useConfirm } from '../contextos/ConfirmProvider';
import './PanelCocina.css';

const ETIQUETAS_ESTADO = {
  enviado: 'Enviado',
  en_proceso_preparacion: 'En preparación',
  en_camino: 'En camino',
  listo_para_recoger: 'Listo para recoger',
  entregado: 'Entregado',
};

function IconoRefrescar({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function PanelCocina() {
  const { empleado } = useAutenticacion();
  const [tabActiva, setTabActiva] = useState('activos');

  return (
    <div className="panel-cocina">
      <header className="cocina-header">
        <div>
          <h1 className="cocina-titulo">Cocina</h1>
          <p className="cocina-subtitulo">
            {empleado?.nombre} · {empleado?.puesto}
          </p>
        </div>
      </header>

      <nav className="panel-tabs">
        <button
          className={`tab ${tabActiva === 'activos' ? 'tab-activa' : ''}`}
          onClick={() => setTabActiva('activos')}
        >
          Pedidos activos
        </button>
        <button
          className={`tab ${tabActiva === 'historial' ? 'tab-activa' : ''}`}
          onClick={() => setTabActiva('historial')}
        >
          Mis preparados
        </button>
      </nav>

      {tabActiva === 'activos' && <TabActivos empleado={empleado} />}
      {tabActiva === 'historial' && <TabHistorial empleado={empleado} />}
    </div>
  );
}

function TabActivos({ empleado }) {
  const { confirmar, toast } = useConfirm();
  const [nuevos, setNuevos] = useState([]);
  const [enPreparacion, setEnPreparacion] = useState([]);
  const [enPreparacionAjenos, setEnPreparacionAjenos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cambiando, setCambiando] = useState(null);
  const [pedidoActivoId, setPedidoActivoId] = useState(null);

  const idEmpleadoActual = empleado?._id ? String(empleado._id) : null;

  function idPreparador(p) {
    const raw = p.empleado_preparando;
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    if (raw._id) return String(raw._id);
    return String(raw);
  }

  async function cargarPedidos() {
    if (!empleado?.sucursal_id) return;
    setCargando(true);
    setError('');
    try {
      const [respEnviado, respPrep] = await Promise.all([
        api.get(`/pedidos/sucursal/${empleado.sucursal_id}?estado=enviado`),
        api.get(`/pedidos/sucursal/${empleado.sucursal_id}?estado=en_proceso_preparacion`),
      ]);

      const listaEnviados = respEnviado.data.pedidos.sort(
        (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
      );

      const todosPrep = respPrep.data.pedidos.sort(
        (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
      );

      const mios = todosPrep.filter((p) => idPreparador(p) === idEmpleadoActual);

      const ajenos = todosPrep.filter((p) => {
        const idPrep = idPreparador(p);
        return idPrep !== null && idPrep !== idEmpleadoActual;
      });

      setNuevos(listaEnviados);
      setEnPreparacion(mios);
      setEnPreparacionAjenos(ajenos);

      setPedidoActivoId((prev) => {
        const sigueSiendoMio = mios.some((p) => p._id === prev);
        if (sigueSiendoMio) return prev;
        return mios[0]?._id || null;
      });
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 30000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleado?.sucursal_id]);

  async function avanzarEstado(pedido) {
    let siguiente = null;
    if (pedido.estado === 'enviado') {
      siguiente = 'en_proceso_preparacion';
    } else if (pedido.estado === 'en_proceso_preparacion') {
      siguiente = pedido.tipo === 'domicilio' ? 'en_camino' : 'listo_para_recoger';
    }
    if (!siguiente) return;

    const idPrep = idPreparador(pedido);
    if (idPrep && idPrep !== idEmpleadoActual) {
      toast('Este pedido lo está preparando otro compañero.', 'error');
      return;
    }

    if (pedido.estado === 'en_proceso_preparacion') {
      const esDomicilio = pedido.tipo === 'domicilio';
      const ok = await confirmar({
        titulo: esDomicilio ? 'Marcar en camino' : 'Marcar listo para recoger',
        mensaje: esDomicilio
          ? `El pedido #${pedido._id.slice(-6).toUpperCase()} pasará a "En camino". Un repartidor podrá tomarlo.`
          : `El pedido #${pedido._id.slice(-6).toUpperCase()} pasará a "Listo para recoger". Mostrador podrá cobrarlo.`,
        textoConfirmar: esDomicilio ? 'En camino' : 'Listo',
        textoCancelar: 'Cancelar',
        peligro: false,
      });
      if (!ok) return;
    }

    setCambiando(pedido._id);
    try {
      await api.patch(`/pedidos/${pedido._id}/estado`, {
        nuevo_estado: siguiente,
        nota: `Cocina (${empleado.nombre}): ${siguiente}`,
      });
      await cargarPedidos();
      toast(
        pedido.estado === 'enviado'
          ? 'Pedido tomado en preparación'
          : pedido.tipo === 'domicilio'
          ? 'Pedido marcado en camino'
          : 'Pedido marcado listo para recoger',
        'success'
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast(err.response?.data?.error || 'No se pudo cambiar el estado.', 'error');
    } finally {
      setCambiando(null);
    }
  }

  function textoBotonAvanzar(pedido) {
    if (pedido.estado === 'enviado') return 'A preparación';
    if (pedido.estado === 'en_proceso_preparacion') {
      return pedido.tipo === 'domicilio' ? 'En camino' : 'Listo para recoger';
    }
    return '';
  }

  function tiempoTranscurrido(fecha) {
    const ms = Date.now() - new Date(fecha).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 1) return 'menos de 1 min';
    if (min === 1) return '1 min';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    return `${h}h ${min % 60}min`;
  }

  if (cargando) return <p className="panel-estado">Cargando pedidos...</p>;

  const pedidoActivo = enPreparacion.find((p) => p._id === pedidoActivoId) || null;

  return (
    <div>
      {error && <div className="panel-error">{error}</div>}

      <div className="cocina-acciones">
        <button onClick={cargarPedidos} className="boton-refrescar">
          <IconoRefrescar size={14} />
          Refrescar
        </button>
      </div>

      <div className="cocina-grid">
        <div className="lista-nuevos">
          <div className="lista-nuevos-header">
            <h2>Nuevos</h2>
            <span className="lista-nuevos-contador">{nuevos.length}</span>
          </div>

          {nuevos.length === 0 ? (
            <p className="lista-nuevos-vacio">No hay pedidos nuevos.</p>
          ) : (
            <div className="lista-nuevos-items">
              {nuevos.map((pedido) => (
                <article key={pedido._id} className="nuevo-item">
                  <div className="nuevo-item-info">
                    <div className="nuevo-item-cabecera">
                      <span className="nuevo-item-id">
                        #{pedido._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="nuevo-item-hora">
                        {new Date(pedido.fecha_creacion).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="nuevo-item-meta">
                      <span className={`nuevo-item-tipo tipo-${pedido.tipo}`}>
                        {pedido.tipo === 'domicilio' ? 'Domicilio' : 'Recoger'}
                      </span>
                    </div>
                    <ul className="nuevo-item-productos">
                      {pedido.productos.map((p, idx) => (
                        <li key={idx} className="nuevo-item-producto">
                          <span className="nuevo-item-cantidad">{p.cantidad}×</span>
                          <span>{p.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => avanzarEstado(pedido)}
                    disabled={cambiando === pedido._id}
                    className="nuevo-item-boton"
                  >
                    {cambiando === pedido._id
                      ? 'Cambiando...'
                      : textoBotonAvanzar(pedido)}
                  </button>
                </article>
              ))}
            </div>
          )}

          
        </div>

        <div className="cuadrado-preparacion">
          <div className="cuadrado-preparacion-header">
            <h2>En preparación</h2>
            <span className="cuadrado-preparacion-contador">
              {enPreparacion.length}
            </span>
          </div>

          {enPreparacion.length === 0 ? (
            <p className="cuadrado-preparacion-vacio">
              No tienes pedidos en preparación.
            </p>
          ) : (
            <>
              <div className="cuadrado-preparacion-selector">
                {enPreparacion.map((pedido) => (
                  <button
                    key={pedido._id}
                    className={`selector-tab ${
                      pedidoActivoId === pedido._id ? 'selector-tab-activo' : ''
                    }`}
                    onClick={() => setPedidoActivoId(pedido._id)}
                  >
                    #{pedido._id.slice(-6).toUpperCase()}
                  </button>
                ))}
              </div>

              {pedidoActivo && (
                <div className="cuadrado-preparacion-detalle">
                  <div className="detalle-cabecera">
                    <div>
                      <span className="detalle-id">
                        #{pedidoActivo._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="detalle-tiempo">
                        {tiempoTranscurrido(pedidoActivo.fecha_creacion)}
                      </span>
                    </div>
                    <span className={`detalle-tipo tipo-${pedidoActivo.tipo}`}>
                      {pedidoActivo.tipo === 'domicilio' ? 'Domicilio' : 'Recoger'}
                    </span>
                  </div>

                  {pedidoActivo.empleado_preparando?.nombre && (
                    <p className="detalle-preparando-por">
                      Preparando: <strong>{pedidoActivo.empleado_preparando.nombre}</strong>
                    </p>
                  )}

                  {pedidoActivo.direccion_entrega && (
                    <p className="detalle-direccion">
                      {pedidoActivo.direccion_entrega}
                    </p>
                  )}

                  <div className="detalle-productos">
                    <h3 className="detalle-productos-titulo">Productos</h3>
                    <ul className="detalle-lista">
                      {pedidoActivo.productos.map((p, idx) => (
                        <li key={idx} className="detalle-producto">
                          <span className="detalle-cantidad">{p.cantidad}×</span>
                          <span className="detalle-nombre">{p.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => avanzarEstado(pedidoActivo)}
                    disabled={cambiando === pedidoActivo._id}
                    className="detalle-boton"
                  >
                    {cambiando === pedidoActivo._id
                      ? 'Cambiando...'
                      : textoBotonAvanzar(pedidoActivo)}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TabHistorial() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');

  async function cargarHistorial() {
    setCargando(true);
    setError('');
    try {
      const resp = await api.get('/pedidos/mis-preparados');
      setPedidos(resp.data.pedidos || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarHistorial();
    const intervalo = setInterval(cargarHistorial, 30000);
    return () => clearInterval(intervalo);
  }, []);

  function filtrarPedidos() {
    if (filtro === 'todos') return pedidos;
    if (filtro === 'listo') return pedidos.filter((p) => p.estado === 'listo_para_recoger');
    if (filtro === 'camino') return pedidos.filter((p) => p.estado === 'en_camino');
    return pedidos;
  }

  function horaSalida(fecha) {
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (cargando) return <p className="panel-estado">Cargando historial...</p>;

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div>
      {error && <div className="panel-error">{error}</div>}

      <div className="historial-controles">
        <div className="historial-filtros">
          <button
            className={`historial-filtro ${filtro === 'todos' ? 'historial-filtro-activo' : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({pedidos.length})
          </button>
          <button
            className={`historial-filtro ${filtro === 'listo' ? 'historial-filtro-activo' : ''}`}
            onClick={() => setFiltro('listo')}
          >
            Listos ({pedidos.filter((p) => p.estado === 'listo_para_recoger').length})
          </button>
          <button
            className={`historial-filtro ${filtro === 'camino' ? 'historial-filtro-activo' : ''}`}
            onClick={() => setFiltro('camino')}
          >
            En camino ({pedidos.filter((p) => p.estado === 'en_camino').length})
          </button>
        </div>

        <button onClick={cargarHistorial} className="boton-refrescar">
          <IconoRefrescar size={14} />
          Refrescar
        </button>
      </div>

      {pedidosFiltrados.length === 0 && (
        <div className="cocina-vacio">
          <p>No has preparado pedidos con ese filtro todavía.</p>
        </div>
      )}

      {pedidosFiltrados.length > 0 && (
        <div className="registro-panel">
          <div className="registro-header">
            <span className="registro-header-celda registro-col-pedido">Pedido</span>
            <span className="registro-header-celda registro-col-productos">Productos</span>
            <span className="registro-header-celda registro-col-total">Total</span>
            <span className="registro-header-celda registro-col-estado">Estado</span>
          </div>

          {pedidosFiltrados.map((pedido) => (
            <article key={pedido._id} className="registro-fila">
              <div className="registro-col-pedido">
                <span className="registro-id">
                  #{pedido._id.slice(-6).toUpperCase()}
                </span>
                <span className="registro-tipo">
                  {pedido.tipo === 'domicilio' ? 'Domicilio' : 'Recoger'}
                </span>
                <span className="registro-hora">
                  {horaSalida(pedido.fecha_actualizacion)}
                </span>
              </div>

              <div className="registro-col-productos">
                {pedido.productos.map((p, idx) => (
                  <span key={idx} className="registro-producto">
                    <strong>{p.cantidad}×</strong> {p.nombre}
                  </span>
                ))}
              </div>

              <div className="registro-col-total">${pedido.total}</div>

              <div className="registro-col-estado">
                <span className={`registro-badge estado-${pedido.estado}`}>
                  {ETIQUETAS_ESTADO[pedido.estado]}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PanelCocina;