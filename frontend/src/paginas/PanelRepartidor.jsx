import { useState, useEffect } from 'react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useConfirm } from '../contextos/ConfirmProvider';
import api from '../servicios/api';
import './PanelRepartidor.css';

function IconoRefrescar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconoMoto({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="17" r="3" />
      <circle cx="19" cy="17" r="3" />
      <path d="M5 17h9l3-6h2l-2-3h-4" />
      <path d="M14 11l-2-3" />
    </svg>
  );
}

function IconoCheck({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
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

function IconoReloj({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconoUbicacion({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconoTelefono({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconoBilleteGrande({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconoManoIzquierda({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function PanelRepartidor() {
  const { empleado, cerrarSesion } = useAutenticacion();
  const { confirmar, toast } = useConfirm();
  const [pedidos, setPedidos] = useState([]);
  const [pedidosAjenos, setPedidosAjenos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cambiando, setCambiando] = useState(null);
  const [tomando, setTomando] = useState(null);

  async function cargarPedidos() {
    if (!empleado?.sucursal_id) return;
    setCargando(true);
    setError('');
    try {
      const resp = await api.get(
        `/pedidos/sucursal/${empleado.sucursal_id}?estado=en_camino`
      );
      const todos = resp.data.pedidos
        .filter((p) => p.tipo === 'domicilio')
        .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));

      const mios = todos.filter((p) => {
        const idAsignado = p.repartidor_asignado?._id || p.repartidor_asignado;
        return !idAsignado || idAsignado === empleado._id;
      });

      const ajenos = todos.filter((p) => {
        const idAsignado = p.repartidor_asignado?._id || p.repartidor_asignado;
        return idAsignado && idAsignado !== empleado._id;
      });

      setPedidos(mios);
      setPedidosAjenos(ajenos);

      setPedidoSeleccionado((prev) => {
        if (prev && mios.some((p) => p._id === prev._id)) {
          return mios.find((p) => p._id === prev._id);
        }
        return mios[0] || null;
      });
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }

  async function cargarEntregas() {
    try {
      const resp = await api.get('/pedidos/mis-cobros');
      setEntregas(resp.data.pedidos || []);
    } catch (err) {
      console.error('Error al cargar entregas:', err);
    }
  }

  useEffect(() => {
    cargarPedidos();
    cargarEntregas();
    const intervalo = setInterval(() => {
      cargarPedidos();
      cargarEntregas();
    }, 30000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleado?.sucursal_id]);

  async function tomarPedido(pedido, e) {
    if (e) e.stopPropagation();
    setTomando(pedido._id);
    try {
      await api.post(`/pedidos/${pedido._id}/tomar`);
      await cargarPedidos();
      toast('Pedido tomado correctamente', 'success');
    } catch (err) {
      console.error('Error al tomar pedido:', err);
      toast(err.response?.data?.error || 'No se pudo tomar el pedido.', 'error');
    } finally {
      setTomando(null);
    }
  }

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

  function horaCorta(fecha) {
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const totalEntregado = entregas.reduce((suma, p) => suma + p.total, 0);

  return (
    <div className="panel-repartidor">
      <header className="panel-header">
        <div>
          <h1>Repartidor</h1>
          <p className="panel-subtitulo">
            {empleado?.nombre} · {empleado?.puesto}
          </p>
        </div>
        <div className="panel-header-acciones">
          <button
            onClick={() => {
              cargarPedidos();
              cargarEntregas();
            }}
            className="panel-boton-refrescar"
          >
            <IconoRefrescar size={13} />
            Refrescar
          </button>
        </div>
      </header>

      {error && <div className="panel-error">{error}</div>}
      {cargando && <p className="panel-estado">Cargando pedidos...</p>}

      {!cargando && (
        <>
          <div className="repartidor-stats">
            <div className="repartidor-stat">
              <span className="repartidor-stat-icono">
                <IconoMoto size={22} />
              </span>
              <div>
                <span className="repartidor-stat-label">Mis pedidos</span>
                <span className="repartidor-stat-valor">{pedidos.length}</span>
              </div>
            </div>
            <div className="repartidor-stat">
              <span className="repartidor-stat-icono">
                <IconoCheck size={22} />
              </span>
              <div>
                <span className="repartidor-stat-label">Entregados</span>
                <span className="repartidor-stat-valor">{entregas.length}</span>
              </div>
            </div>
            <div className="repartidor-stat repartidor-stat-destacado">
              <span className="repartidor-stat-icono">
                <IconoBillete size={22} />
              </span>
              <div>
                <span className="repartidor-stat-label">Total entregado</span>
                <span className="repartidor-stat-valor">${totalEntregado}</span>
              </div>
            </div>
          </div>

          {pedidos.length === 0 && pedidosAjenos.length === 0 && (
            <div className="repartidor-vacio">
              <span className="repartidor-vacio-icono">
                <IconoMoto size={40} />
              </span>
              <p>No hay pedidos en camino.</p>
              <small>
                Cuando cocina marque un pedido como "en camino", aparecerá aquí.
              </small>
            </div>
          )}

          {(pedidos.length > 0 || pedidosAjenos.length > 0) && (
            <div className="repartidor-layout">
              <aside className="repartidor-lista">
                <h2 className="repartidor-lista-titulo">
                  Mis pedidos ({pedidos.length})
                </h2>

                {pedidos.length === 0 && (
                  <p className="repartidor-lista-vacio">
                    No tienes pedidos asignados.
                  </p>
                )}

                {pedidos.map((pedido) => {
                  const sinAsignar = !pedido.repartidor_asignado;
                  const esActivo = pedidoSeleccionado?._id === pedido._id;
                  return (
                    <div
                      key={pedido._id}
                      className={`repartidor-pedido-wrapper ${
                        esActivo ? 'repartidor-pedido-wrapper-activo' : ''
                      }`}
                    >
                      <button
                        className="repartidor-pedido-item"
                        onClick={() => setPedidoSeleccionado(pedido)}
                      >
                        <div className="repartidor-pedido-item-header">
                          <span className="repartidor-pedido-item-id">
                            #{pedido._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="repartidor-pedido-item-tiempo">
                            <IconoReloj size={11} />
                            {tiempoTranscurrido(pedido.fecha_creacion)}
                          </span>
                        </div>
                        <div className="repartidor-pedido-item-productos">
                          {pedido.productos.slice(0, 2).map((p, idx) => (
                            <span key={idx} className="repartidor-pedido-item-producto">
                              {p.cantidad}× {p.nombre}
                            </span>
                          ))}
                          {pedido.productos.length > 2 && (
                            <span className="repartidor-pedido-item-mas">
                              +{pedido.productos.length - 2} más
                            </span>
                          )}
                        </div>
                        <div className="repartidor-pedido-item-footer">
                          {sinAsignar && (
                            <span className="repartidor-pedido-item-pendiente">
                              Sin asignar
                            </span>
                          )}
                          <span className="repartidor-pedido-item-total">
                            ${pedido.total}
                          </span>
                        </div>
                      </button>

                      {sinAsignar && (
                        <button
                          className="repartidor-pedido-item-tomar"
                          onClick={(e) => tomarPedido(pedido, e)}
                          disabled={tomando === pedido._id}
                        >
                          {tomando === pedido._id ? 'Tomando...' : 'Tomar pedido'}
                        </button>
                      )}
                    </div>
                  );
                })}

                
              </aside>

              <section className="repartidor-detalle">
                {pedidoSeleccionado ? (
                  <>
                    <header className="repartidor-detalle-header">
                      <div>
                        <span className="repartidor-detalle-id">
                          #{pedidoSeleccionado._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="repartidor-detalle-estado">En camino</span>
                      </div>
                      <span className="repartidor-detalle-tiempo">
                        <IconoReloj size={13} />
                        {tiempoTranscurrido(pedidoSeleccionado.fecha_creacion)}
                      </span>
                    </header>

                    <div className="repartidor-detalle-direccion">
                      <span className="repartidor-detalle-icono">
                        <IconoUbicacion size={22} />
                      </span>
                      <div>
                        <span className="repartidor-detalle-label">Entregar en</span>
                        <span className="repartidor-detalle-texto">
                          {pedidoSeleccionado.direccion_entrega || 'Sin dirección'}
                        </span>
                      </div>
                    </div>

                    <div className="repartidor-detalle-telefono">
                      <span className="repartidor-detalle-icono">
                        <IconoTelefono size={22} />
                      </span>
                      <div>
                        <span className="repartidor-detalle-label">
                          Teléfono del cliente
                        </span>
                        <a
                          href={`tel:${pedidoSeleccionado.telefono_contacto}`}
                          className="repartidor-detalle-telefono-texto"
                        >
                          {pedidoSeleccionado.telefono_contacto}
                        </a>
                      </div>
                    </div>

                    <div className="repartidor-detalle-productos">
                      <h3>Productos</h3>
                      {pedidoSeleccionado.productos.map((p, idx) => (
                        <div key={idx} className="repartidor-detalle-item">
                          <span className="cantidad">{p.cantidad}×</span>
                          <span className="nombre">{p.nombre}</span>
                          <span className="subtotal">${p.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    <div className="repartidor-detalle-total">
                      <span>Total a cobrar:</span>
                      <strong>${pedidoSeleccionado.total}</strong>
                    </div>

                    {!pedidoSeleccionado.repartidor_asignado ? (
                      <p className="repartidor-detalle-aviso">
                        Toma este pedido desde la lista para poder cobrarlo.
                      </p>
                    ) : (
                      <button
                        onClick={() => cobrarYEntregar(pedidoSeleccionado)}
                        disabled={cambiando === pedidoSeleccionado._id}
                        className="repartidor-detalle-boton"
                      >
                        {cambiando === pedidoSeleccionado._id ? (
                          'Procesando...'
                        ) : (
                          <>
                            <IconoBilleteGrande size={18} />
                            Cobrar ${pedidoSeleccionado.total} y entregar
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="repartidor-detalle-vacio">
                    <span className="repartidor-detalle-vacio-icono">
                      <IconoManoIzquierda size={40} />
                    </span>
                    <p>Selecciona un pedido de la lista para ver los detalles</p>
                  </div>
                )}
              </section>
            </div>
          )}

          <section className="repartidor-entregas">
            <header className="repartidor-entregas-header">
              <h2>Mis entregas ({entregas.length})</h2>
              <span className="repartidor-entregas-sub">
                Total: ${totalEntregado}
              </span>
            </header>

            {entregas.length === 0 && (
              <p className="repartidor-entregas-vacio">
                Aún no has entregado pedidos.
              </p>
            )}

            {entregas.length > 0 && (
              <div className="repartidor-entregas-lista">
                {entregas.map((pedido) => (
                  <div key={pedido._id} className="repartidor-entrega-item">
                    <div className="repartidor-entregas-item-info">
                      <span className="repartidor-entrega-item-id">
                        #{pedido._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="repartidor-entrega-item-hora">
                        {horaCorta(pedido.fecha_actualizacion)}
                      </span>
                    </div>
                    <div className="repartidor-entrega-item-detalle">
                      {pedido.productos.map((p, idx) => (
                        <span key={idx} className="repartidor-entrega-item-producto">
                          {p.cantidad}× {p.nombre}
                        </span>
                      ))}
                    </div>
                    <span className="repartidor-entrega-item-total">
                      ${pedido.total}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default PanelRepartidor;