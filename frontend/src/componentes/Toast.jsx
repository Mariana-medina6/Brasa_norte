
import { useEffect } from 'react';
import './Toast.css';

function IconoCheck({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconoX({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconoInfo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default function Toast({ tipo = 'info', mensaje, onCerrar, duracion = 3000 }) {
  useEffect(() => {
    if (!mensaje) return;
    const timeout = setTimeout(() => {
      onCerrar?.();
    }, duracion);
    return () => clearTimeout(timeout);
  }, [mensaje, duracion, onCerrar]);

  if (!mensaje) return null;

  const Icono = tipo === 'success' ? IconoCheck : tipo === 'error' ? IconoX : IconoInfo;

  return (
    <div className={`toast toast-${tipo}`} role="status">
      <span className="toast-icono">
        <Icono size={16} />
      </span>
      <span className="toast-mensaje">{mensaje}</span>
      <button className="toast-cerrar" onClick={onCerrar} aria-label="Cerrar">
        <IconoX size={12} />
      </button>
    </div>
  );
}