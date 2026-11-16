import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerSucursales } from '../servicios/sucursales';
import { obtenerMenuPorSucursal } from '../servicios/menus';
import { useCarrito } from '../contextos/CarritoContext';
import TarjetaProducto from '../componentes/TarjetaProducto';
import './Menu.css';

function Menu() {
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState('');
  const [productos, setProductos] = useState([]);
  const [cargandoMenu, setCargandoMenu] = useState(false);
  const [errorMenu, setErrorMenu] = useState('');
  const navigate = useNavigate();

  const { agregar } = useCarrito();

  useEffect(() => {
    const guardada = sessionStorage.getItem('sucursal_id');
    if (!guardada) {
      navigate('/', { replace: true });
      return;
    }
    setSucursalId(guardada);
  }, [navigate]);

  useEffect(() => {
    obtenerSucursales()
      .then((data) => setSucursales(data))
      .catch((error) => console.error('Error al cargar sucursales:', error));
  }, []);

  useEffect(() => {
    if (!sucursalId) return;

    setCargandoMenu(true);
    setErrorMenu('');

    obtenerMenuPorSucursal(sucursalId)
      .then((data) => {
        setProductos(data.productos || []);
      })
      .catch((error) => {
        console.error('Error al cargar menú:', error);
        setErrorMenu('No se pudo cargar el menú. Intenta de nuevo.');
        setProductos([]);
      })
      .finally(() => setCargandoMenu(false));
  }, [sucursalId]);

  function manejarAgregar(producto) {
    agregar(producto);
  }

  function cambiarSucursal() {
    sessionStorage.removeItem('sucursal_id');
    navigate('/');
  }

  const sucursalActual = sucursales.find((s) => s._id === sucursalId);

  const categorias = useMemo(() => {
    const orden = ['Entradas', 'Platos fuertes', 'Postres', 'Bebidas'];
    const grupos = {};

    productos.forEach((p) => {
      const cat = p.categoria || 'Otros';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(p);
    });

    return orden
      .filter((cat) => grupos[cat] && grupos[cat].length > 0)
      .map((cat) => ({ nombre: cat, productos: grupos[cat] }))
      .concat(
        Object.keys(grupos)
          .filter((cat) => !orden.includes(cat))
          .map((cat) => ({ nombre: cat, productos: grupos[cat] }))
      );
  }, [productos]);

  return (
    <div className="menu-pagina">
      <div className="menu-header-sucursal">
        <div className="menu-header-info">
          <h1 className="menu-titulo">Nuestro Menú</h1>
          {sucursalActual && (
            <div className="menu-sucursal-actual">
              <span className="menu-sucursal-label">Estás viendo:</span>
              <span className="menu-sucursal-nombre">{sucursalActual.nombre}</span>
            </div>
          )}
        </div>
        <button className="menu-boton-cambiar" onClick={cambiarSucursal}>
          Cambiar sucursal
        </button>
      </div>

      {cargandoMenu && (
        <div className="menu-estado">
          <p>Cargando productos...</p>
        </div>
      )}

      {errorMenu && <div className="menu-error">{errorMenu}</div>}

      {!cargandoMenu && productos.length === 0 && !errorMenu && (
        <div className="menu-estado">
          <p>Esta sucursal no tiene productos disponibles en este momento.</p>
        </div>
      )}

      {!cargandoMenu &&
        productos.length > 0 &&
        categorias.map((cat) => (
          <section key={cat.nombre} className="menu-categoria">
            <h3 className="menu-categoria-titulo">{cat.nombre}</h3>
            <div className="menu-categoria-grid">
              {cat.productos.map((producto) => (
                <TarjetaProducto
                  key={producto._id}
                  producto={producto}
                  onAgregar={manejarAgregar}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

export default Menu;