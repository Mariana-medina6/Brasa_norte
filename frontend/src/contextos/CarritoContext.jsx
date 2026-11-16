import { createContext, useState, useEffect, useContext } from 'react';
import { useConfirm } from '../contextos/ConfirmProvider';

const CarritoContext = createContext(null);
const CLAVE_sessionStorage = 'carrito_brasa_norte';

export function ProveedorCarrito({ children }) {
  // Obtenemos confirmar y toast
  const { toast, confirmar } = useConfirm();

  const [items, setItems] = useState(() => {
    try {
      const guardado = sessionStorage.getItem(CLAVE_sessionStorage);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem(CLAVE_sessionStorage, JSON.stringify(items));
  }, [items]);

  function agregar(producto) {
    setItems((prev) => {
      const existente = prev.find((item) => item.producto._id === producto._id);
      
      if (existente) {
        if (existente.cantidad >= producto.stock_disponible) {
          // En lugar de toast, mostramos el ConfirmDialog
          confirmar({
            titulo: 'Stock máximo alcanzado',
            mensaje: `No puedes agregar más de ${producto.stock_disponible} unidades de "${producto.nombre}".`,
            textoConfirmar: 'Entendido',
            textoCancelar: 'Cerrar', // O puedes poner null si quieres ocultarlo
            peligro: true,
          });
          return prev;
        }
        
        return prev.map((item) =>
          item.producto._id === producto._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function quitar(productoId) {
    setItems((prev) => prev.filter((item) => item.producto._id !== productoId));
  }

  function cambiarCantidad(productoId, delta) {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.producto._id !== productoId) return item;
          
          const nuevaCantidad = item.cantidad + delta;
          
          if (nuevaCantidad < 1) return item;
          
          if (nuevaCantidad > item.producto.stock_disponible) {
            // En lugar de toast, mostramos el ConfirmDialog
            confirmar({
              titulo: 'Stock máximo alcanzado',
              mensaje: `Solo hay ${item.producto.stock_disponible} unidades disponibles de "${item.producto.nombre}".`,
              textoConfirmar: 'Entendido',
              textoCancelar: 'Cerrar',
              peligro: true,
            });
            return item;
          }
          
          return { ...item, cantidad: nuevaCantidad };
        })
        .filter((item) => item.cantidad > 0)
    );
  }

  async function vaciar() {
    if (items.length === 0) return;

    const ok = await confirmar({
      titulo: 'Vaciar carrito',
      mensaje: '¿Estás seguro de que quieres eliminar todos los productos de tu carrito?',
      textoConfirmar: 'Sí, vaciar',
      textoCancelar: 'Cancelar',
      peligro: true,
    });

    if (ok) {
      setItems([]);
      toast('Carrito vaciado', 'success');
    }
  }

  const totalItems = items.reduce((suma, item) => suma + item.cantidad, 0);
  const totalPrecio = items.reduce(
    (suma, item) => suma + item.cantidad * item.producto.precio,
    0
  );

  const valor = {
    items,
    totalItems,
    totalPrecio,
    agregar,
    quitar,
    cambiarCantidad,
    vaciar,
  };

  return (
    <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
  );
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de ProveedorCarrito');
  }
  return contexto;
}