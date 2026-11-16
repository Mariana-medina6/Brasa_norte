
import { useEffect } from 'react';
import './ConfirmDialog.css';

function IconoAlerta({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function ConfirmDialog({
  abierto,
  titulo = '¿Estás seguro?',
  mensaje = '',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligro = true,
  onConfirmar,
  onCancelar,
}) {
  useEffect(() => {
    if (!abierto) return;

    function onKey(e) {
      if (e.key === 'Escape') onCancelar?.();
      if (e.key === 'Enter') onConfirmar?.();
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [abierto, onConfirmar, onCancelar]);

  if (!abierto) return null;

  return (
    <div className="confirm-overlay" onClick={onCancelar}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`confirm-icono ${peligro ? 'confirm-icono-peligro' : ''}`}>
          <IconoAlerta size={28} />
        </div>

        <h3 className="confirm-titulo">{titulo}</h3>
        {mensaje && <p className="confirm-mensaje">{mensaje}</p>}

        <div className="confirm-acciones">
          <button className="confirm-boton confirm-boton-cancelar" onClick={onCancelar}>
            {textoCancelar}
          </button>
          <button
            className={`confirm-boton ${peligro ? 'confirm-boton-peligro' : 'confirm-boton-primario'}`}
            onClick={onConfirmar}
            autoFocus
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}