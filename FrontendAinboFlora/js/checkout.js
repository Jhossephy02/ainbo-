const API_BASE = window.AINBO_API || 'http://localhost:3000/api';

function getLS() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function renderResumen() {
  const items = getLS();
  const ul = document.getElementById('resumen-items');
  ul.innerHTML = '';
  let subtotal = 0;
  items.forEach(it => {
    subtotal += Number(it.precio) * Number(it.cantidad);
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${it.nombre} x${it.cantidad}</span>
      <span>S/. ${Number(it.precio * it.cantidad).toFixed(2)}</span>
    `;
    ul.appendChild(li);
  });
  document.getElementById('subtotal').textContent = `S/. ${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent = `S/. ${subtotal.toFixed(2)}`;
}

async function crearPedido(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const direccion = document.getElementById('direccion').value.trim();
  const cuponCodigo = document.getElementById('cupon').value.trim() || null;
  const items = getLS().map(it => ({
    productoId: it.id,
    cantidad: Number(it.cantidad),
    precio: Number(it.precio)
  }));

  if (!direccion || items.length === 0) {
    alert('Completa la dirección y agrega productos al carrito');
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/crear-pedido`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({ direccion, cuponCodigo, items })
    });
    const data = await resp.json();
    if (resp.ok) {
      localStorage.removeItem('carrito');
      window.location.href = 'confirmacion.html?pedidoId=' + data.pedidoId;
    } else {
      alert(data.mensaje || 'Error al crear pedido');
    }
  } catch (e) {
    alert('No se pudo conectar con el servidor');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderResumen();
  document.getElementById('checkout-form').addEventListener('submit', crearPedido);
});
