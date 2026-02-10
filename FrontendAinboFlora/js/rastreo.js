const host = window.location.hostname || 'localhost';
const API_BASE = window.AINBO_API || `http://${host}:3000/api`;

function formatoMoneda(v) {
  return `S/. ${Number(v).toFixed(2)}`;
}

async function buscarPedido(e) {
  e.preventDefault();
  const codigo = document.getElementById('codigo').value.trim();
  const alerta = document.getElementById('alerta');
  const cont = document.getElementById('resultado');
  const items = document.getElementById('items');
  const pedidoIdEl = document.getElementById('pedido-id');
  const estadoEl = document.getElementById('pedido-estado');
  const totalEl = document.getElementById('total');
  alerta.classList.add('d-none');
  cont.classList.add('d-none');
  items.innerHTML = '';
  if (!codigo) return;
  try {
    let resp = await fetch(`${API_BASE}/seguimiento/${encodeURIComponent(codigo)}`);
    if (!resp.ok) {
      resp = await fetch(`${API_BASE}/pedido/${encodeURIComponent(codigo)}`);
    }
    const data = await resp.json();
    if (!resp.ok) {
      alerta.textContent = data.mensaje || 'Pedido no encontrado';
      alerta.classList.remove('d-none');
      return;
    }
    const pedido = data.pedido;
    const dets = data.detalles || [];
    const hist = data.historial || [];
    pedidoIdEl.textContent = `#${pedido.Id}`;
    estadoEl.textContent = pedido.Estado || 'pendiente';
    let total = 0;
    dets.forEach(d => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between';
      const lineTotal = Number(d.PrecioUnitario) * Number(d.Cantidad);
      total += lineTotal;
      li.innerHTML = `<span>Producto ${d.ProductoId} x${d.Cantidad}</span><span>${formatoMoneda(lineTotal)}</span>`;
      items.appendChild(li);
    });
    const histUl = document.getElementById('historial');
    if (histUl) {
      histUl.innerHTML = '';
      hist.forEach(h => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between';
        li.innerHTML = `<span>${String(h.Estado).replace(/_/g,' ')}</span><span>${new Date(h.Fecha).toLocaleString()}</span>`;
        histUl.appendChild(li);
      });
    }
    totalEl.textContent = formatoMoneda(total || pedido.Total || 0);
    cont.classList.remove('d-none');
  } catch {
    alerta.textContent = 'Error conectando con el servidor';
    alerta.classList.remove('d-none');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('rastreo-form').addEventListener('submit', buscarPedido);
  const params = new URLSearchParams(window.location.search);
  const code = params.get('codigo');
  if (code) {
    document.getElementById('codigo').value = code;
    document.getElementById('rastreo-form').dispatchEvent(new Event('submit'));
  }
});
