import { createContext, useState, useEffect, useContext } from 'react';

const CarritoContext = createContext(null);

const CLAVE_sessionStorage = 'carrito_brasa_norte';

export function ProveedorCarrito({ children }) {
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
          alert(`No puedes agregar más de ${producto.stock_disponible} de "${producto.nombre}"`);
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
            alert(`Stock máximo: ${item.producto.stock_disponible}`);
            return item;
          }
          return { ...item, cantidad: nuevaCantidad };
        })
        .filter((item) => item.cantidad > 0)
    );
  }

  function vaciar() {
    setItems([]);
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