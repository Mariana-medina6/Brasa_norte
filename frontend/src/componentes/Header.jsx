

import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useState, useEffect } from 'react';
import './Header.css';

function Header() {
  const { cliente, empleado, cerrarSesion } = useAutenticacion();
  const navigate = useNavigate();

  const [tieneSucursal, setTieneSucursal] = useState(false);

  useEffect(() => {
    const checkSucursal = () => {
      setTieneSucursal(!!sessionStorage.getItem('sucursal_id'));
    };
    checkSucursal();

    window.addEventListener('storage', checkSucursal);
    window.addEventListener('sucursal-seleccionada', checkSucursal);

    return () => {
      window.removeEventListener('storage', checkSucursal);
      window.removeEventListener('sucursal-seleccionada', checkSucursal);
    };
  }, []);

  function manejarLogout() {
    cerrarSesion();
    sessionStorage.removeItem('sucursal_id');
    window.history.replaceState(null, '', '/login');
    navigate('/login', { replace: true });
  }

  const haySesion = cliente || empleado;
  const nombre = cliente?.nombre || empleado?.nombre || '';
  const primerNombre = nombre.split(' ')[0];

  return (
    <header className="header">
      <div className="header-contenedor">
       
        <div className="header-izquierda">
          <Link to="/" className="header-marca">
            <div className="header-logo-wrap">
              <img
                src="/logo-brasa-norte.png"
                alt="Brasa Norte"
                className="header-logo-img"
              />
            </div>
          </Link>

          {haySesion && (
            <span className="header-saludo">
              Hola, <strong>{primerNombre}</strong>
            </span>
          )}
        </div>

      
        <nav className="header-nav">
          {cliente && tieneSucursal && (
            <Link to="/menu" className="header-enlace">
              Menú
            </Link>
          )}

          {cliente && (
            <Link to="/mis-pedidos" className="header-enlace">
              Mis pedidos
            </Link>
          )}

          {haySesion && (
            <button onClick={manejarLogout} className="header-boton-salir">
              Cerrar sesión
            </button>
          )}

          {!haySesion && (
            <Link to="/login" className="header-boton-registro">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;