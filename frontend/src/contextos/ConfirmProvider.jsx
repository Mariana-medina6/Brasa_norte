
import { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../componentes/ConfirmDialog';
import Toast from '../componentes/Toast';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialogo, setDialogo] = useState(null);
  const [toastState, setToastState] = useState({ tipo: 'info', mensaje: '' });

  const confirmar = useCallback((opciones) => {
    return new Promise((resolve) => {
      const config =
        typeof opciones === 'string' ? { mensaje: opciones } : opciones || {};

      setDialogo({
        ...config,
        onResolver: (valor) => {
          setDialogo(null);
          resolve(valor);
        },
      });
    });
  }, []);

  const toast = useCallback((mensaje, tipo = 'info') => {
    setToastState({ tipo, mensaje });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirmar, toast }}>
      {children}

      <ConfirmDialog
        abierto={!!dialogo}
        titulo={dialogo?.titulo}
        mensaje={dialogo?.mensaje}
        textoConfirmar={dialogo?.textoConfirmar}
        textoCancelar={dialogo?.textoCancelar}
        peligro={dialogo?.peligro}
        onConfirmar={() => dialogo?.onResolver?.(true)}
        onCancelar={() => dialogo?.onResolver?.(false)}
      />

      <Toast
        tipo={toastState.tipo}
        mensaje={toastState.mensaje}
        onCerrar={() => setToastState({ tipo: 'info', mensaje: '' })}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  }
  return ctx;
}