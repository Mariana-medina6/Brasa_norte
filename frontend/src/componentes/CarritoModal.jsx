
import { useCarrito } from '../contextos/CarritoContext';
import './CarritoModal.css';

function IconoCarrito({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconoBasura({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconoCerrar({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CarritoModal({ abierto, onCerrar, onConfirmar }) {
  const { items, totalItems, totalPrecio, cambiarCantidad, quitar, vaciar } =
    useCarrito();

  if (!abierto) return null;

  return (
    <div className="carrito-overlay" onClick={onCerrar}>
      <div
        className="carrito-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <header className="carrito-header">
          <h2>
            <IconoCarrito size={20} />
            <span>Tu carrito </span>
          </h2>
          <button
            className="carrito-boton-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <IconoCerrar size={18} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="carrito-vacio">
            <div className="carrito-vacio-icono">
              <IconoCarrito size={48} />
            </div>
            <p>Tu carrito está vacío</p>
            <p className="carrito-vacio-sub">
              Agrega productos del menú para comenzar
            </p>
          </div>
        ) : (
          <>
            <div className="carrito-items">
              {items.map((item) => (
                <div key={item.producto._id} className="carrito-item">
                  <div className="carrito-item-info">
                    <h3>{item.producto.nombre}</h3>
                    <p className="carrito-item-precio">
                      ${item.producto.precio} c/u
                    </p>
                  </div>

                  <div className="carrito-item-controles">
                    <button
                      className="carrito-boton-cantidad"
                      onClick={() => cambiarCantidad(item.producto._id, -1)}
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="carrito-cantidad">{item.cantidad}</span>
                    <button
                      className="carrito-boton-cantidad"
                      onClick={() => cambiarCantidad(item.producto._id, +1)}
                      aria-label="Agregar uno"
                    >
                      +
                    </button>
                  </div>

                  <div className="carrito-item-subtotal">
                    ${item.cantidad * item.producto.precio}
                  </div>

                  <button
                    className="carrito-boton-quitar"
                    onClick={() => quitar(item.producto._id)}
                    title="Quitar"
                    aria-label="Quitar producto"
                  >
                    <IconoBasura size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="carrito-total">
              <span>Total:</span>
              <strong>${totalPrecio}</strong>
            </div>

            <div className="carrito-acciones">
              <button className="carrito-boton-vaciar" onClick={vaciar}>
                Vaciar
              </button>
              <button className="carrito-boton-confirmar" onClick={onConfirmar}>
                Confirmar pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CarritoModal;