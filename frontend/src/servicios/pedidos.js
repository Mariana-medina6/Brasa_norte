
import api from './api';

export async function crearPedido(datos) {
  const respuesta = await api.post('/pedidos', datos);
  return respuesta.data.pedido;
}


export async function obtenerMisPedidos() {
  const respuesta = await api.get('/pedidos/mis-pedidos');
  return respuesta.data.pedidos;
}

export async function cambiarEstadoPedido(pedidoId, nuevoEstado, nota = '') {
  const respuesta = await api.patch(`/pedidos/${pedidoId}/estado`, {
    nuevo_estado: nuevoEstado,
    nota,
  });
  return respuesta.data.pedido;
}