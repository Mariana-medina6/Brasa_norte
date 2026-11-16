
import api from './api';

export async function obtenerSucursales() {
  const respuesta = await api.get('/sucursales');
  return respuesta.data.sucursales;
}