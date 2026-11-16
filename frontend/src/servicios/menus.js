
import api from './api';


export async function obtenerMenuPorSucursal(sucursalId) {
  const respuesta = await api.get(`/menus/sucursal/${sucursalId}`);
  return respuesta.data;
}