
import { useState, useEffect } from 'react';
import { useCarrito } from '../contextos/CarritoContext';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import './ModalConfirmarPedido.css';

function ModalConfirmarPedido({ abierto, onCerrar, onConfirmar, enviando, error }) {
  const { items, totalPrecio } = useCarrito();
  const { cliente } = useAutenticacion();

  const [tipo, setTipo] = useState('establecimiento');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  
  useEffect(() => {
    if (!abierto) return;

    setTelefono(cliente?.telefono || '');
    setDireccion(cliente?.direccion || '');
    setTipo('establecimiento');
  }, [abierto, cliente]);

  
  const faltaTelefono = !cliente?.telefono;
  const faltaDireccion = !cliente?.direccion;

  if (!abierto) return null;

  function manejarSubmit(e) {
    e.preventDefault();
    onConfirmar({ tipo, telefono, direccion });
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Confirmar pedido</h2>
          <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        </header>

        <div className="modal-resumen">
          <h3>Resumen</h3>
          {items.map((item) => (
            <div key={item.producto._id} className="modal-resumen-item">
              <span>{item.cantidad}× {item.producto.nombre}</span>
              <span>${item.cantidad * item.producto.precio}</span>
            </div>
          ))}
          <div className="modal-resumen-total">
            <strong>Total:</strong>
            <strong>${totalPrecio}</strong>
          </div>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={manejarSubmit} className="modal-formulario">
          <fieldset className="modal-fieldset">
            <legend>Tipo de pedido</legend>
            <label className="modal-radio">
              <input
                type="radio"
                value="establecimiento"
                checked={tipo === 'establecimiento'}
                onChange={(e) => setTipo(e.target.value)}
              />
              Recoger en establecimiento
            </label>
            <label className="modal-radio">
              <input
                type="radio"
                value="domicilio"
                checked={tipo === 'domicilio'}
                onChange={(e) => setTipo(e.target.value)}
              />
              Envío a domicilio
            </label>
          </fieldset>

          <label className="modal-label">
            Teléfono de contacto *
            {faltaTelefono && (
              <span className="modal-campo-nuevo">(no teníamos tu teléfono)</span>
            )}
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="modal-input"
              placeholder=""
            />
          </label>

          {tipo === 'domicilio' && (
            <label className="modal-label">
              Dirección de entrega *
              {faltaDireccion && (
                <span className="modal-campo-nuevo">(no teníamos tu dirección)</span>
              )}
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
                className="modal-input"
                placeholder=""
              />
            </label>
          )}

          <button
            type="submit"
            className="modal-boton-confirmar"
            disabled={enviando}
          >
            {enviando ? 'Creando pedido...' : `Confirmar ($${totalPrecio})`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalConfirmarPedido;