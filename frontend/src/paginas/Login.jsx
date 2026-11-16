
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import '../estilos/Formularios.css';

function Login() {
  const { iniciarSesion } = useAutenticacion();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function redirigirEmpleado(emp) {
    if (emp.puesto === 'administrador_sucursal') {
      navigate('/admin/sucursal', { replace: true });
    } else if (emp.puesto === 'cocina') {
      navigate('/empleado/cocina', { replace: true });
    } else if (emp.puesto === 'repartidor') {
      navigate('/empleado/repartidor', { replace: true });
    } else if (emp.puesto === 'mostrador') {
      navigate('/empleado/mostrador', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const resultado = await iniciarSesion(email, password);

      if (resultado.tipo === 'cliente') {
        navigate('/', { replace: true });
      } else if (resultado.tipo === 'empleado') {
        redirigirEmpleado(resultado.datos);
      }
    } catch (err) {
      const mensaje =
        err.response?.data?.error || 'Error al iniciar sesión. Intenta de nuevo.';
      setError(mensaje);
      setEnviando(false);
    }
  }

  return (
    <div className="form-pagina">
      <div className="form-tarjeta">
        <h2 className="form-titulo">Iniciar sesión</h2>
        <p className="form-subtitulo">Bienvenido de vuelta a Brasa Norte</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={manejarSubmit} className="form-campos">
          <label className="form-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="tu@email.com"
            />
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" disabled={enviando} className="form-boton">
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-divisor">
          <span>¿No tienes cuenta?</span>
        </div>

        <Link to="/registro" className="login-boton-registro">
          Crear cuenta de cliente
        </Link>

        <p className="form-ayuda">
          <small>Solo los clientes pueden registrarse.</small>
          <br />
          <small>Los empleados son creados por el administrador.</small>
        </p>

      
      </div>
    </div>
  );
}

export default Login;