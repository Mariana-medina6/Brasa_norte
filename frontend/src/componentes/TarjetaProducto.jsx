import './TarjetaProducto.css';

function TarjetaProducto({ producto, onAgregar }) {
  const { nombre, descripcion, precio, imagen_base64, stock } = producto;

  return (
    <article className="tarjeta-producto">
      {imagen_base64 && (
        <div className="tarjeta-producto-imagen-wrap">
          <img
            src={imagen_base64}
            alt={nombre}
            className="tarjeta-producto-imagen"
            loading="lazy"
          />
        </div>
      )}

      <div className="tarjeta-producto-info">
        <h3 className="tarjeta-producto-nombre">{nombre}</h3>

        {descripcion && (
          <p className="tarjeta-producto-descripcion">{descripcion}</p>
        )}

        <div className="tarjeta-producto-footer">
          <span className="tarjeta-producto-precio">${precio}</span>
          {typeof stock === 'number' && (
            <span className="tarjeta-producto-stock">Stock: {stock}</span>
          )}
        </div>

        <button
          className="tarjeta-producto-boton"
          onClick={() => onAgregar(producto)}
          disabled={typeof stock === 'number' && stock <= 0}
        >
          {typeof stock === 'number' && stock <= 0
            ? 'Agotado'
            : '+ Agregar al carrito'}
        </button>
      </div>
    </article>
  );
}

export default TarjetaProducto;