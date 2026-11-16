
import { Navigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';


function RutaProtegida({ children, requiereTipo, requierePuesto }) {
  const { cliente, empleado, tipo, cargando } = useAutenticacion();

  
  if (cargando) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  }

  
  if (requiereTipo && tipo !== requiereTipo) {
    return <Navigate to={requiereTipo === 'empleado' ? '/empleado/login' : '/login'} replace />;
  }

  if (requierePuesto && requierePuesto.length > 0) {
    if (!empleado || !requierePuesto.includes(empleado.puesto)) {
      return <Navigate to="/empleado/login" replace />;
    }
  }

  return children;
}

export default RutaProtegida;