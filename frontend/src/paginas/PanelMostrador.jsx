import { useState, useEffect } from 'react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useConfirm } from '../contextos/ConfirmProvider';
import api from '../servicios/api';
import './PanelMostrador.css';

const ETIQUETAS_ESTADO = {
  listo_para_recoger: 'Listo para recoger',
  entregado: 'Entregado',
};

function IconoRefrescar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconoReloj({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconoBillete({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconoBarChart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function IconoBolsa({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconoCheckCirculo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconoTicket({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PanelMostrador() {
  const { empleado, cerrarSesion } = useAutenticacion();
  const [tabActiva, setTabActiva] = useState('entregar');

  return (
    <div className="panel-mostrador">
      <header className="panel-header">
        <div>
          <h1>Mostrador</h1>
          <p className="panel-subtitulo">
            {empleado?.nombre} · {empleado?.puesto}
          </p>
        </div>
        <div className="panel-header-acciones">
          
        </div>
      </header>

      <nav className="panel-tabs">
        <button
          className={`tab ${tabActiva === 'entregar' ? 'tab-activa' : ''}`}
          onClick={() => setTabActiva('entregar')}
        >
          Pedidos para entregar
        </button>
        <button
          className={`tab ${tabActiva === 'cobros' ? 'tab-activa' : ''}`}
          onClick={() => setTabActiva('cobros')}
        >
          Mis cobros
        </button>
      </nav>

      {tabActiva === 'entregar' && <TabEntregar empleado={empleado} />}
      {tabActiva === 'cobros' && <TabCobros />}
    </div>
  );
}

function TabEntregar({ empleado }) {
  const { confirmar, toast } = useConfirm();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cambiando, setCambiando] = useState(null);

  async function cargarPedidos() {
    if (!empleado?.sucursal_id) return;
    setCargando(true);
    setError('');
    try {
      const resp = await api.get(
        `/pedidos/sucursal/${empleado.sucursal_id}?estado=listo_para_recoger`
      );
      const lista = resp.data.pedidos
        .filter((p) => p.tipo === 'establecimiento')
        .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
      setPedidos(lista);
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

  async function cobrarYEntregar(pedido) {
    const ok = await confirmar({
      titulo: 'Cobrar y entregar',
      mensaje: `¿Confirmas el cobro de $${pedido.total} del pedido #${pedido._id.slice(-6).toUpperCase()}?`,
      textoConfirmar: 'Cobrar',
      textoCancelar: 'Cancelar',
      peligro: false,
    });
    if (!ok) return;

    setCambiando(pedido._id);
    try {
      await api.post(`/pedidos/${pedido._id}/pago`, {
        metodo_pago: 'efectivo',
      });
      toast(
        `Pedido #${pedido._id.slice(-6).toUpperCase()} cobrado y entregado`,
        'success'
      );
      window.location.reload();
    } catch (err) {
      console.error('Error al cobrar:', err);
      toast(err.response?.data?.error || 'No se pudo registrar el pago.', 'error');
      setCambiando(null);
    }
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

  return (
    <div>
      {error && <div className="panel-error">{error}</div>}

      <div className="mostrador-acciones">
        <button onClick={cargarPedidos} className="panel-boton-refrescar">
          <IconoRefrescar size={13} />
          Refrescar
        </button>
      </div>

      {pedidos.length === 0 && (
        <div className="mostrador-vacio">
          <span className="mostrador-vacio-icono">
            <IconoCheckCirculo size={40} />
          </span>
          <p>No hay pedidos listos para entregar.</p>
          <small>Los pedidos aparecerán aquí cuando cocina los marque como listos.</small>
        </div>
      )}

      {pedidos.length > 0 && (
        <div className="mostrador-grid">
          {pedidos.map((pedido) => (
            <article key={pedido._id} className="mostrador-card">
              <header className="mostrador-card-header">
                <div>
                  <span className="mostrador-card-id">
                    #{pedido._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="mostrador-card-hora">
                    {new Date(pedido.fecha_creacion).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <span className="mostrador-card-tiempo">
                  <IconoReloj size={11} />
                  {tiempoTranscurrido(pedido.fecha_creacion)}
                </span>
              </header>

              <div className="mostrador-card-tipo">Recoger en establecimiento</div>

              <div className="mostrador-card-productos">
                {pedido.productos.map((p, idx) => (
                  <div key={idx} className="mostrador-card-item">
                    <span className="cantidad">{p.cantidad}×</span>
                    <span className="nombre">{p.nombre}</span>
                    <span className="subtotal">${p.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="mostrador-card-total">
                <span>Total a cobrar:</span>
                <strong>${pedido.total}</strong>
              </div>

              <footer className="mostrador-card-footer">
                <button
                  onClick={() => cobrarYEntregar(pedido)}
                  disabled={cambiando === pedido._id}
                  className="mostrador-card-boton"
                >
                  {cambiando === pedido._id ? (
                    'Procesando...'
                  ) : (
                    <>
                      <IconoBillete size={16} />
                      Cobrar ${pedido.total} y entregar
                    </>
                  )}
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function TabCobros() {
  const [pedidos, setPedidos] = useState([]);
  const [totalCobrado, setTotalCobrado] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');

  async function cargarCobros() {
    setCargando(true);
    setError('');
    try {
      const resp = await api.get('/pedidos/mis-cobros');
      setPedidos(resp.data.pedidos || []);
      setTotalCobrado(resp.data.total_cobrado || 0);
    } catch (err) {
      console.error('Error al cargar cobros:', err);
      setError('No se pudieron cargar tus cobros.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCobros();
    const intervalo = setInterval(cargarCobros, 30000);
    return () => clearInterval(intervalo);
  }, []);

  function filtrarPedidos() {
    const ahora = new Date();
    if (filtro === 'hoy') {
      return pedidos.filter((p) => {
        const fecha = new Date(p.fecha_actualizacion);
        return (
          fecha.getDate() === ahora.getDate() &&
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      });
    }
    if (filtro === 'semana') {
      const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      return pedidos.filter((p) => new Date(p.fecha_actualizacion) >= hace7Dias);
    }
    return pedidos;
  }

  function horaCobro(fecha) {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (cargando) return <p className="panel-estado">Cargando cobros...</p>;

  const pedidosFiltrados = filtrarPedidos();
  const totalFiltrado = pedidosFiltrados.reduce((suma, p) => suma + p.total, 0);

  return (
    <div>
      {error && <div className="panel-error">{error}</div>}

      <div className="cobros-resumen">
        <div className="cobros-resumen-card cobros-resumen-total">
          <span className="cobros-resumen-icono">
            <IconoBillete size={22} />
          </span>
          <div>
            <span className="cobros-resumen-label">Total cobrado</span>
            <span className="cobros-resumen-valor">${totalCobrado}</span>
          </div>
        </div>
        <div className="cobros-resumen-card">
          <span className="cobros-resumen-icono">
            <IconoTicket size={22} />
          </span>
          <div>
            <span className="cobros-resumen-label">Pedidos cobrados</span>
            <span className="cobros-resumen-valor">{pedidos.length}</span>
          </div>
        </div>
        <div className="cobros-resumen-card">
          <span className="cobros-resumen-icono">
            <IconoBarChart size={22} />
          </span>
          <div>
            <span className="cobros-resumen-label">Promedio por pedido</span>
            <span className="cobros-resumen-valor">
              ${pedidos.length > 0 ? Math.round(totalCobrado / pedidos.length) : 0}
            </span>
          </div>
        </div>
      </div>

      <div className="cobros-controles">
        <div className="cobros-filtros">
          <button
            className={`cobros-filtro ${filtro === 'todos' ? 'cobros-filtro-activo' : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({pedidos.length})
          </button>
          <button
            className={`cobros-filtro ${filtro === 'hoy' ? 'cobros-filtro-activo' : ''}`}
            onClick={() => setFiltro('hoy')}
          >
            Hoy
          </button>
          <button
            className={`cobros-filtro ${filtro === 'semana' ? 'cobros-filtro-activo' : ''}`}
            onClick={() => setFiltro('semana')}
          >
            Esta semana
          </button>
        </div>
        <button onClick={cargarCobros} className="boton-refrescar-cobros">
          <IconoRefrescar size={13} />
          Refrescar
        </button>
      </div>

      {pedidosFiltrados.length === 0 && (
        <div className="mostrador-vacio">
          <span className="mostrador-vacio-icono">
            <IconoBolsa size={40} />
          </span>
          <p>No has cobrado pedidos con ese filtro.</p>
          <small>Los pedidos que cobres aparecerán aquí.</small>
        </div>
      )}

      {pedidosFiltrados.length > 0 && (
        <div className="cobros-lista">
          <div className="cobros-total-filtrado">
            Total en este filtro: <strong>${totalFiltrado}</strong>
          </div>
          {pedidosFiltrados.map((pedido) => (
            <article key={pedido._id} className="cobro-card">
              <header className="cobro-card-header">
                <div>
                  <span className="cobro-card-id">
                    #{pedido._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="cobro-card-fecha">
                    {horaCobro(pedido.fecha_actualizacion)}
                  </span>
                </div>
                <span className="cobro-card-badge">Cobrado</span>
              </header>

              <div className="cobro-card-productos">
                {pedido.productos.map((p, idx) => (
                  <div key={idx} className="cobro-card-item">
                    <span className="cantidad">{p.cantidad}×</span>
                    <span className="nombre">{p.nombre}</span>
                    <span className="subtotal">${p.subtotal}</span>
                  </div>
                ))}
              </div>

              <footer className="cobro-card-footer">
                <span className="cobro-card-metodo">Efectivo</span>
                <span className="cobro-card-total">${pedido.total}</span>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PanelMostrador;