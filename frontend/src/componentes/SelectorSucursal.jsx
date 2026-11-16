

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerSucursales } from '../servicios/sucursales';
import './SelectorSucursal.css';

function SelectorSucursal() {
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    obtenerSucursales()
      .then((data) => {
        setSucursales(data);
        if (data.length > 0) setSucursalId(data[0]._id);
      })
      .catch((err) => {
        console.error('Error al cargar sucursales:', err);
        setError('No se pudieron cargar las sucursales.');
      })
      .finally(() => setCargando(false));
  }, []);

  function manejarContinuar() {
    if (!sucursalId) return;
    sessionStorage.setItem('sucursal_id', sucursalId);
    window.dispatchEvent(new Event('sucursal-seleccionada'));
    navigate('/menu');
  }

  if (cargando) {
    return (
      <div className="selector-sucursal">
        <div className="selector-cargando">
          <div className="selector-llama">🔥</div>
          <p>Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="selector-sucursal">
        <p className="selector-error">{error}</p>
      </div>
    );
  }

  const sucursalSeleccionada = sucursales.find((s) => s._id === sucursalId);

  return (
    <div className="selector-sucursal">
      <div className="selector-layout">
      
        <div className="selector-izquierda">
          <div className="selector-izquierda-header">
            <h2 className="selector-titulo">Elige tu sucursal</h2>
            <div className="selector-titulo-linea" />
          </div>

          <p className="selector-subtitulo">
            Selecciona dónde quieres ordenar
          </p>

          <label className="selector-label">
            Sucursal
            <select
              className="selector-select"
              value={sucursalId}
              onChange={(e) => setSucursalId(e.target.value)}
            >
              {sucursales.map((suc) => (
                <option key={suc._id} value={suc._id}>
                  {suc.nombre} — {suc.region}
                </option>
              ))}
            </select>
          </label>

          
          {sucursalSeleccionada && (
            <div className="selector-info">
              <div className="selector-info-header">
                <span className="selector-info-badge">
                  {sucursalSeleccionada.region}
                </span>
              </div>
              <h3 className="selector-info-nombre">
                {sucursalSeleccionada.nombre}
              </h3>
              {sucursalSeleccionada.direccion && (
                <p className="selector-info-direccion">
                  {sucursalSeleccionada.direccion}
                </p>
              )}
              <div className="selector-info-divisor" />
              <p className="selector-info-nota">
                Al continuar podrás ver el menú completo y hacer tu pedido.
              </p>
            </div>
          )}

          <button
            className="selector-boton-continuar"
            onClick={manejarContinuar}
            disabled={!sucursalId}
          >
            Continuar al menú →
          </button>
        </div>

        
        <div className="selector-derecha">
          <img
            src="/logo-brasa-norte.png"
            alt="Brasa Norte"
            className="selector-logo"
          />
          <p className="selector-lema">Sabor a la parrilla</p>
        </div>
      </div>
    </div>
  );
}

export default SelectorSucursal;