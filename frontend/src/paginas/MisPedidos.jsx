import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { obtenerMisPedidos } from '../servicios/pedidos';
import './MisPedidos.css';

const ETIQUETAS_ESTADO = {
  enviado: 'Enviado',
  en_proceso_preparacion: 'En preparación',
  en_camino: 'En camino',
  listo_para_recoger: 'Listo para recoger',
  entregado: 'Entregado',
};

const ETIQUETAS_TIPO = {
  domicilio: 'A domicilio',
  establecimiento: 'Para recoger',
};

function IconoBuscar({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconoX({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconoUbicacion({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconoTelefono({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconoReloj({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconoBillete({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconoPlato({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
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

function MisPedidos() {
  const { cliente, cargando: cargandoAuth } = useAutenticacion();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('todos');

  useEffect(() => {
    if (cargandoAuth) return;
    if (!cliente) {
      navigate('/login');
      return;
    }
    obtenerMisPedidos()
      .then((data) => setPedidos(data))
      .catch((err) => {
        console.error('Error al cargar pedidos:', err);
        setError('No se pudieron cargar tus pedidos.');
      })
      .finally(() => setCargando(false));
  }, [cliente, cargandoAuth, navigate]);

  const pedidosFiltrados = useMemo(() => {
    const ahora = new Date();

    return pedidos.filter((p) => {
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
      if (filtroTipo !== 'todos' && p.tipo !== filtroTipo) return false;

      if (filtroFecha !== 'todos') {
        const fecha = new Date(p.fecha_creacion);
        if (filtroFecha === 'hoy') {
          if (
            fecha.getDate() !== ahora.getDate() ||
            fecha.getMonth() !== ahora.getMonth() ||
            fecha.getFullYear() !== ahora.getFullYear()
          ) {
            return false;
          }
        } else if (filtroFecha === 'semana') {
          const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (fecha < hace7Dias) return false;
        } else if (filtroFecha === 'mes') {
          const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (fecha < hace30Dias) return false;
        }
      }

      if (busqueda.trim()) {
        const q = busqueda.trim().toLowerCase();
        const idCorto = p._id.slice(-6).toLowerCase();
        const matchId = idCorto.includes(q) || p._id.toLowerCase().includes(q);
        const matchProducto = p.productos.some((prod) =>
          prod.nombre.toLowerCase().includes(q)
        );
        if (!matchId && !matchProducto) return false;
      }

      return true;
    });
  }, [pedidos, busqueda, filtroEstado, filtroTipo, filtroFecha]);

  function limpiarFiltros() {
    setBusqueda('');
    setFiltroEstado('todos');
    setFiltroTipo('todos');
    setFiltroFecha('todos');
  }

  const hayFiltrosActivos =
    busqueda.trim() !== '' ||
    filtroEstado !== 'todos' ||
    filtroTipo !== 'todos' ||
    filtroFecha !== 'todos';

  if (cargandoAuth || cargando) {
    return (
      <div className="mis-pedidos-pagina">
        <p className="mis-pedidos-estado">Cargando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="mis-pedidos-pagina">
      <div className="mis-pedidos-header">
        <div>
          <h1 className="mis-pedidos-titulo">Mis Pedidos</h1>
          <p className="mis-pedidos-subtitulo">
            {pedidos.length === 0
              ? 'Aún no tienes pedidos'
              : `${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'} en total`}
          </p>
        </div>
      </div>

      {error && <div className="mis-pedidos-error">{error}</div>}

      {pedidos.length === 0 && !error && (
        <div className="mis-pedidos-vacio">
          <div className="mis-pedidos-vacio-icono">
            <IconoTicket size={48} />
          </div>
          <p className="mis-pedidos-vacio-titulo">Aún no tienes pedidos</p>
          <p className="mis-pedidos-vacio-texto">
            Cuando hagas tu primer pedido, aparecerá aquí con su estado en tiempo real.
          </p>
          <Link to="/menu" className="mis-pedidos-boton-menu">
            Explorar el menú
          </Link>
        </div>
      )}

      {pedidos.length > 0 && (
        <>
          <div className="mis-pedidos-filtros">
            <div className="mis-pedidos-buscador">
              <span className="mis-pedidos-buscador-icono">
                <IconoBuscar size={15} />
              </span>
              <input
                type="text"
                placeholder="Buscar por ID o producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="mis-pedidos-buscador-input"
              />
              {busqueda && (
                <button
                  className="mis-pedidos-buscador-limpiar"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                >
                  <IconoX size={12} />
                </button>
              )}
            </div>

            <div className="mis-pedidos-filtros-grupos">
              <div className="mis-pedidos-filtro-grupo">
                <span className="mis-pedidos-filtro-label">Estado</span>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="mis-pedidos-filtro-select"
                >
                  <option value="todos">Todos</option>
                  <option value="enviado">Enviado</option>
                  <option value="en_proceso_preparacion">En preparación</option>
                  <option value="en_camino">En camino</option>
                  <option value="listo_para_recoger">Listo para recoger</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>

              <div className="mis-pedidos-filtro-grupo">
                <span className="mis-pedidos-filtro-label">Tipo</span>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="mis-pedidos-filtro-select"
                >
                  <option value="todos">Todos</option>
                  <option value="domicilio">A domicilio</option>
                  <option value="establecimiento">Para recoger</option>
                </select>
              </div>

              <div className="mis-pedidos-filtro-grupo">
                <span className="mis-pedidos-filtro-label">Fecha</span>
                <select
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="mis-pedidos-filtro-select"
                >
                  <option value="todos">Todas</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Última semana</option>
                  <option value="mes">Último mes</option>
                </select>
              </div>

              {hayFiltrosActivos && (
                <button className="mis-pedidos-limpiar" onClick={limpiarFiltros}>
                  <IconoX size={12} />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          <div className="mis-pedidos-resumen">
            <span>
              {pedidosFiltrados.length === 0
                ? 'Sin resultados'
                : `${pedidosFiltrados.length} ${pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'} encontrados`}
            </span>
          </div>

          {pedidosFiltrados.length === 0 && (
            <div className="mis-pedidos-sin-resultados">
              <p>No hay pedidos que coincidan con los filtros.</p>
              <button className="mis-pedidos-boton-secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          )}

          {pedidosFiltrados.length > 0 && (
            <div className="mis-pedidos-lista">
              {pedidosFiltrados.map((pedido) => {
                const totalItems = pedido.productos.reduce(
                  (suma, p) => suma + p.cantidad,
                  0
                );
                return (
                  <article
                    key={pedido._id}
                    className="pedido-tarjeta"
                    onClick={() => setPedidoDetalle(pedido)}
                  >
                    <header className="pedido-header">
                      <div className="pedido-header-info">
                        <span className="pedido-id">
                          #{pedido._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="pedido-fecha">
                          {new Date(pedido.fecha_creacion).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span className={`pedido-estado estado-${pedido.estado}`}>
                        {ETIQUETAS_ESTADO[pedido.estado] || pedido.estado}
                      </span>
                    </header>

                    <div className="pedido-resumen">
                      <span className="pedido-resumen-items">
                        {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                      </span>
                      <span className="pedido-resumen-productos">
                        {pedido.productos
                          .slice(0, 3)
                          .map((p) => `${p.cantidad}× ${p.nombre}`)
                          .join(' · ')}
                        {pedido.productos.length > 3 &&
                          ` · +${pedido.productos.length - 3} más`}
                      </span>
                    </div>

                    <footer className="pedido-footer">
                      <span className={`pedido-tipo tipo-${pedido.tipo}`}>
                        {ETIQUETAS_TIPO[pedido.tipo] || pedido.tipo}
                      </span>
                      <div className="pedido-footer-derecha">
                        <span className="pedido-total">
                          <span className="pedido-total-label">Total</span>
                          <span className="pedido-total-monto">${pedido.total}</span>
                        </span>
                        <span className="pedido-ver-detalle">
                          Ver detalle
                        </span>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {pedidoDetalle && (
        <ModalDetallePedido
          pedido={pedidoDetalle}
          onCerrar={() => setPedidoDetalle(null)}
        />
      )}
    </div>
  );
}

function ModalDetallePedido({ pedido, onCerrar }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onCerrar();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onCerrar]);

  const totalItems = pedido.productos.reduce((suma, p) => suma + p.cantidad, 0);

  return (
    <div className="detalle-overlay" onClick={onCerrar}>
      <div
        className="detalle-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="detalle-modal-header">
          <div>
            <span className="detalle-modal-id">
              Pedido #{pedido._id.slice(-6).toUpperCase()}
            </span>
            <span className="detalle-modal-fecha">
              {new Date(pedido.fecha_creacion).toLocaleString('es-MX')}
            </span>
          </div>
          <button className="detalle-modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            <IconoX size={18} />
          </button>
        </header>

        <div className="detalle-modal-body">
          <div className="detalle-seccion">
            <h3 className="detalle-seccion-titulo">Estado actual</h3>
            <span className={`pedido-estado estado-${pedido.estado}`}>
              {ETIQUETAS_ESTADO[pedido.estado] || pedido.estado}
            </span>
          </div>

          <div className="detalle-seccion">
            <h3 className="detalle-seccion-titulo">
              {pedido.tipo === 'domicilio' ? 'Entrega a domicilio' : 'Recoger en sucursal'}
            </h3>
            <div className="detalle-info-fila">
              <span className="detalle-info-icono">
                <IconoUbicacion size={16} />
              </span>
              <span className="detalle-info-texto">
                {pedido.tipo === 'domicilio'
                  ? pedido.direccion_entrega || 'Sin dirección registrada'
                  : 'Recoger en la sucursal seleccionada al hacer el pedido'}
              </span>
            </div>
            <div className="detalle-info-fila">
              <span className="detalle-info-icono">
                <IconoTelefono size={16} />
              </span>
              <span className="detalle-info-texto">
                {pedido.telefono_contacto || 'Sin teléfono registrado'}
              </span>
            </div>
          </div>

          <div className="detalle-seccion">
            <h3 className="detalle-seccion-titulo">
              Productos ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
            </h3>
            <div className="detalle-productos">
              {pedido.productos.map((p, idx) => (
                <div key={idx} className="detalle-producto-item">
                  <div className="detalle-producto-imagen">
                    {p.imagen_base64 ? (
                      <img src={p.imagen_base64} alt={p.nombre} />
                    ) : (
                      <IconoPlato size={20} />
                    )}
                  </div>
                  <div className="detalle-producto-info">
                    <span className="detalle-producto-nombre">{p.nombre}</span>
                    <span className="detalle-producto-cantidad">
                      {p.cantidad}× ${p.precio_unitario || p.subtotal / p.cantidad}
                    </span>
                  </div>
                  <span className="detalle-producto-subtotal">${p.subtotal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detalle-seccion">
            <h3 className="detalle-seccion-titulo">Pago</h3>
            <div className="detalle-info-fila">
              <span className="detalle-info-icono">
                <IconoBillete size={16} />
              </span>
              <span className="detalle-info-texto">
                {pedido.metodo_pago === 'efectivo' ? 'Efectivo' : pedido.metodo_pago}
              </span>
            </div>
          </div>

          {pedido.historial_estados && pedido.historial_estados.length > 0 && (
            <div className="detalle-seccion">
              <h3 className="detalle-seccion-titulo">
                <IconoReloj size={14} /> Historial
              </h3>
              <div className="detalle-timeline">
                {pedido.historial_estados.map((h, idx) => (
                  <div key={idx} className="detalle-timeline-item">
                    <span className={`detalle-timeline-punto estado-${h.estado}`} />
                    <div className="detalle-timeline-contenido">
                      <span className="detalle-timeline-estado">
                        {ETIQUETAS_ESTADO[h.estado] || h.estado}
                      </span>
                      <span className="detalle-timeline-fecha">
                        {new Date(h.fecha).toLocaleString('es-MX')}
                      </span>
                      {h.nota && (
                        <span className="detalle-timeline-nota">{h.nota}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="detalle-modal-footer">
          <div className="detalle-modal-total">
            <span>Total</span>
            <strong>${pedido.total}</strong>
          </div>
          <button className="detalle-modal-cerrar-btn" onClick={onCerrar}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}

export default MisPedidos;