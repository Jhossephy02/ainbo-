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
  const estadoBadge = document.getElementById('estadoBadge');
  const estadoBadgeText = document.getElementById('estadoBadgeText');
  const totalEl = document.getElementById('total');
  alerta.classList.add('d-none');
  cont.classList.add('d-none');
  items.innerHTML = '';
  const histEl = document.getElementById('historial');
  if (histEl) histEl.innerHTML = '<div class="skeleton-line mb-2"></div><div class="skeleton-line mb-2"></div><div class="skeleton-line mb-2"></div>';
  for (let i = 0; i < 3; i++) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between';
    li.innerHTML = '<div class="skeleton-box" style="width: 100%;"></div>';
    items.appendChild(li);
  }
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
    const estado = (pedido.PaymentStatus || pedido.Estado || 'pendiente').toLowerCase();
    estadoEl.textContent = estado;
    if (estadoBadge) {
      estadoBadge.classList.remove('d-none','status-pendiente','status-aprobado','status-rechazado');
      estadoBadgeText.textContent = estado.charAt(0).toUpperCase()+estado.slice(1);
      estadoBadge.classList.add(estado === 'aprobado' ? 'status-aprobado' : estado === 'rechazado' ? 'status-rechazado' : 'status-pendiente');
    }
    let total = 0;
    items.innerHTML = '';
    // mapear productos para mostrar nombre e imagen
    let productos = [];
    try {
      const allResp = await fetch(`${API_BASE}/productos`);
      const j = await allResp.json();
      productos = (j && j.success && Array.isArray(j.data)) ? j.data : [];
    } catch {}
    dets.forEach(d => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between';
      const lineTotal = Number(d.PrecioUnitario) * Number(d.Cantidad);
      total += lineTotal;
      const prod = productos.find(p => Number(p.Id) === Number(d.ProductoId));
      const nombre = prod ? prod.Nombre : `Producto ${d.ProductoId}`;
      const img = prod ? (prod.Imagen || 'img/img1.png') : 'img/img1.png';
      li.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${img}" alt="${nombre}" class="rounded me-2" style="width:40px;height:40px;object-fit:cover;">
          <span>${nombre} x${d.Cantidad}</span>
        </div>
        <span>${formatoMoneda(lineTotal)}</span>`;
      items.appendChild(li);
    });
    if (histEl) {
      histEl.innerHTML = '';
      hist.forEach(h => {
        const div = document.createElement('div');
        div.className = 'timeline-item d-flex justify-content-between';
        div.innerHTML = `<span>${String(h.Estado).replace(/_/g,' ')}</span><span class="text-muted">${new Date(h.Fecha).toLocaleString()}</span>`;
        histEl.appendChild(div);
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
