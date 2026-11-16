import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ProveedorAutenticacion, useAutenticacion } from './contextos/ContextoAutenticacion';
import { ProveedorCarrito, useCarrito } from './contextos/CarritoContext';
import { ConfirmProvider, useConfirm } from './contextos/ConfirmProvider';
import { crearPedido } from './servicios/pedidos';
import { obtenerSucursales } from './servicios/sucursales';
import Header from './componentes/Header';
import Footer from './componentes/Footer';
import CarritoModal from './componentes/CarritoModal';
import BotonCarritoFlotante from './componentes/BotonCarritoFlotante';
import ModalConfirmarPedido from './componentes/ModalConfirmarPedido';
import RutaProtegida from './componentes/RutaProtegida';
import SelectorSucursal from './componentes/SelectorSucursal';
import Login from './paginas/Login';
import Registro from './paginas/Registro';
import LoginEmpleado from './paginas/LoginEmpleado';
import Menu from './paginas/Menu';
import MisPedidos from './paginas/MisPedidos';
import PanelMostrador from './paginas/PanelMostrador';
import PanelCocina from './paginas/PanelCocina';
import PanelRepartidor from './paginas/PanelRepartidor';
import PanelAdminSucursal from './paginas/PanelAdminSucursal';
import './App.css';

function Inicio() {
  const { cliente, empleado, cargando } = useAutenticacion();

  if (empleado) {
    if (empleado.puesto === 'administrador_sucursal') {
      return <Navigate to="/admin/sucursal" replace />;
    } else if (empleado.puesto === 'cocina') {
      return <Navigate to="/empleado/cocina" replace />;
    } else if (empleado.puesto === 'repartidor') {
      return <Navigate to="/empleado/repartidor" replace />;
    } else if (empleado.puesto === 'mostrador') {
      return <Navigate to="/empleado/mostrador" replace />;
    }
  }

  if (cliente) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        <SelectorSucursal />
      </div>
    );
  }

  if (cargando) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  }

  return <Navigate to="/login" replace />;
}

function ContenidoApp() {
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorPedido, setErrorPedido] = useState('');

  const { cliente } = useAutenticacion();
  const { items, vaciar } = useCarrito();
  const { confirmar, toast } = useConfirm();
  const navigate = useNavigate();

  function manejarAbrirModal() {
    if (!cliente) {
      setCarritoAbierto(false);
      toast('Inicia sesión para confirmar tu pedido.', 'error');
      navigate('/login');
      return;
    }
    if (items.length === 0) return;
    setErrorPedido('');
    setModalAbierto(true);
    setCarritoAbierto(false);
  }

  async function manejarConfirmarPedido({ tipo, telefono, direccion }) {
    setEnviando(true);
    setErrorPedido('');
    const sucursalId = sessionStorage.getItem('sucursal_id');
    if (!sucursalId) {
      setErrorPedido('No hay sucursal seleccionada. Vuelve al menú.');
      setEnviando(false);
      return;
    }
    const datos = {
      sucursal_id: sucursalId,
      tipo,
      telefono_contacto: telefono,
      direccion_entrega: tipo === 'domicilio' ? direccion : undefined,
      productos: items.map((item) => ({
        producto_id: item.producto._id,
        cantidad: item.cantidad,
      })),
    };
    try {
      await crearPedido(datos);
      vaciar();
      setModalAbierto(false);
      toast('¡Pedido creado correctamente!', 'success');
      navigate('/mis-pedidos');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al crear el pedido.';
      setErrorPedido(mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/empleado/login" element={<LoginEmpleado />} />
          <Route
            path="/empleado/cocina"
            element={
              <RutaProtegida requiereTipo="empleado" requierePuesto={['cocina']}>
                <PanelCocina />
              </RutaProtegida>
            }
          />
          <Route
            path="/empleado/mostrador"
            element={
              <RutaProtegida requiereTipo="empleado" requierePuesto={['mostrador']}>
                <PanelMostrador />
              </RutaProtegida>
            }
          />
          <Route
            path="/empleado/repartidor"
            element={
              <RutaProtegida requiereTipo="empleado" requierePuesto={['repartidor']}>
                <PanelRepartidor />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/sucursal"
            element={
              <RutaProtegida requiereTipo="empleado" requierePuesto={['administrador_sucursal']}>
                <PanelAdminSucursal />
              </RutaProtegida>
            }
          />
          <Route
            path="/menu"
            element={
              <RutaProtegida requiereTipo="cliente">
                <Menu />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-pedidos"
            element={
              <RutaProtegida requiereTipo="cliente">
                <MisPedidos />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
      <Footer />

      {cliente && (
        <BotonCarritoFlotante onAbrir={() => setCarritoAbierto(true)} />
      )}

      <CarritoModal
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        onConfirmar={manejarAbrirModal}
      />

      <ModalConfirmarPedido
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onConfirmar={manejarConfirmarPedido}
        enviando={enviando}
        error={errorPedido}
      />
    </div>
  );
}

function App() {
  return (
    <ProveedorAutenticacion>
      <ConfirmProvider>
        <ProveedorCarrito>
          <BrowserRouter>
            <ContenidoApp />
          </BrowserRouter>
        </ProveedorCarrito>
      </ConfirmProvider>
    </ProveedorAutenticacion>
  );
}

export default App;