document.addEventListener('DOMContentLoaded', () => {
  const usuarioStr = localStorage.getItem('usuario');
  try {
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const nombre = (usuario && (usuario.Nombre || usuario.nombre_usuario)) || 'Usuario';
    const email = (usuario && (usuario.Email || usuario.correo)) || 'N/A';
    document.getElementById('perfilNombre').textContent = nombre;
    document.getElementById('perfilEmail').textContent = email;
    document.getElementById('inputNombre').value = nombre;
    document.getElementById('inputEmail').value = email;
    const initials = String(nombre || 'U').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
    document.getElementById('avatarText').textContent = initials || 'US';
  } catch {}
  const btn = document.getElementById('btnLogout');
  btn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'Login.html';
  });
  const tabla = document.getElementById('tabla-pedidos');
  const alerta = document.getElementById('pedidos-alert');
  const host = window.location.hostname || 'localhost';
  const API_BASE = window.AINBO_API || `http://${host}:3000/api`;
  const token = localStorage.getItem('token') || '';
  if (tabla) {
    fetch(`${API_BASE}/mis-pedidos`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) {
          alerta.textContent = j.mensaje || 'No se pudieron cargar los pedidos';
          alerta.classList.remove('d-none');
          return;
        }
        tabla.innerHTML = '';
        (j.pedidos || []).forEach(p => {
          const tr = document.createElement('tr');
          const pago = p.PaymentMethod ? `${p.PaymentMethod}${p.PagoCodigo ? ' ('+p.PagoCodigo+')' : ''}` : 'N/A';
          tr.innerHTML = `
            <td>${p.NumeroOrden || 'N/A'}</td>
            <td>${p.Estado || 'pendiente'}</td>
            <td>S/. ${Number(p.Total || 0).toFixed(2)}</td>
            <td>${pago}</td>
            <td><a class="btn btn-sm btn-outline-success" href="Rastreo.html?codigo=${encodeURIComponent(p.NumeroOrden || p.Id)}">Rastrear</a></td>
          `;
          tabla.appendChild(tr);
        });
      })
      .catch(() => {
        alerta.textContent = 'Error conectando con el servidor';
        alerta.classList.remove('d-none');
      });
  }
});
