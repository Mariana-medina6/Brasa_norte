import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import api from '../servicios/api';

const ContextoAutenticacion = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [cliente, setCliente] = useState(null);
  const [empleado, setEmpleado] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const tipoGuardado = sessionStorage.getItem('tipo_usuario');

    if (!token) {
      setCargando(false);
      return;
    }

    if (tipoGuardado === 'empleado') {
      try {
        const empleadoGuardado = JSON.parse(sessionStorage.getItem('empleado'));
        if (empleadoGuardado) {
          setEmpleado(empleadoGuardado);
          setTipo('empleado');
        }
      } catch {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('empleado');
        sessionStorage.removeItem('tipo_usuario');
      }
      setCargando(false);
      return;
    }

    api
      .get('/autenticacion/perfil')
      .then((resp) => {
        setCliente(resp.data.cliente);
        setTipo('cliente');
      })
      .catch(() => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('cliente');
        sessionStorage.removeItem('tipo_usuario');
      })
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(email, password) {
    const resp = await api.post('/autenticacion/login', { email, password });
    const { tipo: tipoUsuario, token, cliente: clienteData, empleado: empleadoData } = resp.data;

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('tipo_usuario', tipoUsuario);

    if (tipoUsuario === 'cliente') {
      sessionStorage.setItem('cliente', JSON.stringify(clienteData));
      setCliente(clienteData);
      setEmpleado(null);
      setTipo('cliente');
      return { tipo: 'cliente', datos: clienteData };
    } else if (tipoUsuario === 'empleado') {
      sessionStorage.setItem('empleado', JSON.stringify(empleadoData));
      setEmpleado(empleadoData);
      setCliente(null);
      setTipo('empleado');
      return { tipo: 'empleado', datos: empleadoData };
    } else {
      throw new Error('Tipo de usuario desconocido');
    }
  }

  async function registrarse(datos) {
    const resp = await api.post('/autenticacion/registro', datos);
    const { token, cliente: clienteData } = resp.data;
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('cliente', JSON.stringify(clienteData));
    sessionStorage.setItem('tipo_usuario', 'cliente');
    setCliente(clienteData);
    setEmpleado(null);
    setTipo('cliente');
    return clienteData;
  }

  async function iniciarSesionEmpleado(email, password) {
    const resp = await api.post('/autenticacion/login-empleado', { email, password });
    const { token, empleado: empleadoData } = resp.data;
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('empleado', JSON.stringify(empleadoData));
    sessionStorage.setItem('tipo_usuario', 'empleado');
    setEmpleado(empleadoData);
    setCliente(null);
    setTipo('empleado');
    return empleadoData;
  }

  function cerrarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('cliente');
    sessionStorage.removeItem('empleado');
    sessionStorage.removeItem('tipo_usuario');
    sessionStorage.removeItem('sucursal_id');
    setCliente(null);
    setEmpleado(null);
    setTipo(null);
  }

  const esCliente = tipo === 'cliente';
  const esEmpleado = tipo === 'empleado';
  const esAdminSucursal = esEmpleado && empleado?.puesto === 'administrador_sucursal';
  const esMostrador = esEmpleado && empleado?.puesto === 'mostrador';
  const esRepartidor = esEmpleado && empleado?.puesto === 'repartidor';

  const valor = useMemo(
    () => ({
      cliente,
      empleado,
      tipo,
      iniciarSesion,
      iniciarSesionEmpleado,
      registrarse,
      cerrarSesion,
      cargando,
      esCliente,
      esEmpleado,
      esAdminSucursal,
      esMostrador,
      esRepartidor,
    }),
    [cliente, empleado, tipo, cargando]
  );

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}

export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de ProveedorAutenticacion');
  }
  return contexto;
}