import api from './api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function listarProductos() {
  const r = await api.get('/admin/mi-sucursal/productos');
  return r.data.productos;
}

export async function crearProducto(datos) {
  const r = await api.post('/admin/mi-sucursal/productos', datos);
  return r.data.producto;
}

export async function actualizarProducto(id, datos) {
  const r = await api.put(`/admin/mi-sucursal/productos/${id}`, datos);
  return r.data.producto;
}

export async function eliminarProducto(id) {
  await api.delete(`/admin/mi-sucursal/productos/${id}`);
}

export async function listarInventario() {
  const r = await api.get('/admin/mi-sucursal/inventario');
  return r.data.inventarios;
}

export async function ajustarInventario(productoId, datos) {
  const r = await api.put(`/admin/mi-sucursal/inventario/${productoId}`, datos);
  return r.data.inventario;
}

export async function listarEmpleados() {
  const r = await api.get('/admin/mi-sucursal/empleados');
  return r.data.empleados;
}

export async function crearEmpleado(datos) {
  const r = await api.post('/admin/mi-sucursal/empleados', datos);
  return r.data.empleado;
}

export async function actualizarEmpleado(id, datos) {
  const r = await api.put(`/admin/mi-sucursal/empleados/${id}`, datos);
  return r.data.empleado;
}

export async function eliminarEmpleado(id) {
  await api.delete(`/admin/mi-sucursal/empleados/${id}`);
}

export async function subirImagenProducto(id, imagenBase64) {
  const r = await api.post(`/admin/mi-sucursal/productos/${id}/imagen`, {
    imagen_base64: imagenBase64,
  });
  return r.data.producto;
}

export async function obtenerMenuVisual() {
  const r = await api.get('/admin/mi-sucursal/menu-visual');
  return r.data;
}

export async function listarBitacora(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.limite) params.append('limite', filtros.limite);
  if (filtros.accion) params.append('accion', filtros.accion);
  if (filtros.usuario_tipo) params.append('usuario_tipo', filtros.usuario_tipo);

  const query = params.toString() ? `?${params.toString()}` : '';
  const r = await api.get(`/admin/bitacora${query}`);
  return r.data;
}

export async function descargarBitacoraCSV() {
  const r = await api.get('/admin/bitacora/exportar', {
    responseType: 'blob',
  });
  return r.data;
}

export async function listarSucursales() {
  const r = await api.get('/sucursales');
  return r.data.sucursales;
}

export function generarBitacoraPDF(registros, nombreSucursal = 'Brasa Norte') {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  doc.setFontSize(18);
  doc.setTextColor(178, 34, 34);
  doc.text('Brasa Norte — Reporte de Bitácora', 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Sucursal: ${nombreSucursal}`, 14, 22);
  doc.text(`Fecha de generación: ${new Date().toLocaleString('es-MX')}`, 14, 27);
  doc.text(`Total de registros: ${registros.length}`, 14, 32);

  const columnas = [
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Acción', dataKey: 'accion' },
    { header: 'Tipo', dataKey: 'tipo' },
    { header: 'Detalles', dataKey: 'detalles' },
  ];

  const filas = registros.map((r) => ({
    fecha: new Date(r.fecha).toLocaleString('es-MX'),
    accion: r.accion,
    tipo: r.usuario_tipo,
    detalles: resumirDetallesPDF(r),
  }));

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 38,
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [178, 34, 34],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 239, 230],
    },
    columnStyles: {
      fecha: { cellWidth: 35 },
      accion: { cellWidth: 45 },
      tipo: { cellWidth: 20 },
      detalles: { cellWidth: 'auto' },
    },
  });

  return doc;
}

function resumirDetallesPDF(r) {
  const d = r.detalles || {};
  if (r.accion.includes('login') || r.accion === 'registro_cliente') {
    return d.email || '—';
  }
  if (r.accion === 'crear_pedido') {
    return `Pedido #${(d.pedido_id || '').slice(-6).toUpperCase()} · $${d.total || 0} · ${d.tipo || ''}`;
  }
  if (r.accion === 'cambiar_estado_pedido') {
    return `Pedido #${(d.pedido_id || '').slice(-6).toUpperCase()} · ${d.estado_anterior} → ${d.estado_nuevo}`;
  }
  if (r.accion === 'registrar_pago') {
    return `Pedido #${(d.pedido_id || '').slice(-6).toUpperCase()} · $${d.monto || 0} · ${d.metodo_pago || ''}`;
  }
  if (
    r.accion.startsWith('crear_producto') ||
    r.accion.startsWith('actualizar_producto') ||
    r.accion === 'eliminar_producto'
  ) {
    return `${d.nombre || d.producto_id || ''}`;
  }
  if (r.accion === 'subir_imagen_producto') {
    return `Producto #${(d.producto_id || '').slice(-6).toUpperCase()} · ${Math.round((d.tamano_base64 || 0) / 1024)} KB`;
  }
  if (
    r.accion.startsWith('crear_empleado') ||
    r.accion.startsWith('actualizar_empleado') ||
    r.accion === 'eliminar_empleado'
  ) {
    return `${d.email || ''} (${d.puesto || ''})`;
  }
  if (r.accion === 'ajustar_inventario') {
    return `${d.producto_nombre || ''} · ${d.stock_anterior} → ${d.stock_nuevo}`;
  }
  return '—';
}