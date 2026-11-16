
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import '../estilos/formularios.css';

function Registro() {
  const { registrarse } = useAutenticacion();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function manejarCambio(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      await registrarse(formulario);
      navigate('/menu');
    } catch (err) {
      const mensaje =
        err.response?.data?.error || 'Error al registrarse. Intenta de nuevo.';
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="form-pagina">
      <div className="form-tarjeta">
        <h2 className="form-titulo">Crear cuenta</h2>
        <p className="form-subtitulo">
  Únete a Brasa Norte (solo clientes)
</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={manejarSubmit} className="form-campos">
          <label className="form-label">
            Nombre completo
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              required
              className="form-input"
              placeholder=""
            />
          </label>

          <label className="form-label">
            Email
            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={manejarCambio}
              required
              className="form-input"
              placeholder=""
            />
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              name="password"
              value={formulario.password}
              onChange={manejarCambio}
              required
              className="form-input"
              placeholder="Mín. 8 chars, 1 may, 1 min, 1 num"
            />
          </label>

          <label className="form-label">
            Teléfono 
            <input
              type="tel"
              name="telefono"
              value={formulario.telefono}
              onChange={manejarCambio}
              className="form-input"
              placeholder=""
            />
          </label>

          <label className="form-label">
            Dirección (opcional)
            <input
              type="text"
              name="direccion"
              value={formulario.direccion}
              onChange={manejarCambio}
              className="form-input"
              placeholder=""
            />
          </label>

          <button type="submit" disabled={enviando} className="form-boton">
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="form-pie">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;