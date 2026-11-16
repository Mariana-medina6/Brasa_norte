
import { useCarrito } from '../contextos/CarritoContext';
import './BotonCarritoFlotante.css';

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

function BotonCarritoFlotante({ onAbrir }) {
  const { totalItems, totalPrecio } = useCarrito();

  return (
    <button
      className="carrito-fab"
      onClick={onAbrir}
      aria-label={`Abrir carrito (${totalItems} productos, total $${totalPrecio})`}
    >
      <span className="carrito-fab-icono">
        <IconoCarrito size={22} />
      </span>

      

      {totalItems > 0 && (
        <span className="carrito-fab-badge">{totalItems}</span>
      )}
    </button>
  );
}

export default BotonCarritoFlotante;