const host = window.location.hostname || 'localhost';
const API_BASE = window.AINBO_API || `http://${host}:3000/api`;

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
  const metodo = Array.from(document.querySelectorAll('input[name=\"metodo\"]')).find(r => r.checked)?.value || 'tarjeta';
  const pagoDatos = {};
  if (metodo === 'tarjeta') {
    pagoDatos.cardNumber = document.getElementById('card-number').value.trim();
    pagoDatos.cardName = document.getElementById('card-name').value.trim();
    pagoDatos.cardExp = document.getElementById('card-exp').value.trim();
    pagoDatos.cardCvv = document.getElementById('card-cvv').value.trim();
    if (!pagoDatos.cardNumber || !pagoDatos.cardName || !pagoDatos.cardExp || !pagoDatos.cardCvv) {
      alert('Completa los datos de la tarjeta');
      return;
    }
  } else if (metodo === 'yape') {
    pagoDatos.numero = document.getElementById('yape-numero').value.trim();
    if (!pagoDatos.numero) {
      alert('Ingresa el número para Yape');
      return;
    }
  } else if (metodo === 'pagoefectivo') {
    pagoDatos.solicitud = 'CIP';
  }
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
      body: JSON.stringify({ direccion, cuponCodigo, items, metodoPago: metodo, pagoDatos })
    });
    const data = await resp.json();
    if (resp.ok) {
      localStorage.removeItem('carrito');
      const qp = new URLSearchParams({ pedidoId: String(data.pedidoId || ''), numeroOrden: String(data.numeroOrden || ''), metodoPago: String(data.metodoPago || ''), cip: String(data.cip || '') });
      window.location.href = 'confirmacion.html?' + qp.toString();
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
  const radios = document.querySelectorAll('input[name=\"metodo\"]');
  const tarjetaFields = document.getElementById('tarjeta-fields');
  const yapeFields = document.getElementById('yape-fields');
  const peFields = document.getElementById('pagoefectivo-fields');
  const toggle = () => {
    const v = Array.from(radios).find(r => r.checked)?.value;
    tarjetaFields.classList.toggle('d-none', v !== 'tarjeta');
    yapeFields.classList.toggle('d-none', v !== 'yape');
    peFields.classList.toggle('d-none', v !== 'pagoefectivo');
  };
  radios.forEach(r => r.addEventListener('change', toggle));
  toggle();
});
