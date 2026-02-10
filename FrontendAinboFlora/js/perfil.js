document.addEventListener('DOMContentLoaded', () => {
  const usuarioStr = localStorage.getItem('usuario');
  try {
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const nombre = (usuario && (usuario.Nombre || usuario.nombre_usuario)) || 'Usuario';
    const email = (usuario && (usuario.Email || usuario.correo)) || 'N/A';
    const rol = (usuario && (usuario.Rol || usuario.rol)) || 'usuario';
    document.getElementById('perfilNombre').textContent = nombre;
    document.getElementById('perfilEmail').textContent = email;
    document.getElementById('inputNombre').value = nombre;
    document.getElementById('inputEmail').value = email;
    const initials = String(nombre || 'U').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
    document.getElementById('avatarText').textContent = initials || 'US';
    if (rol === 'admin') {
      const panel = document.getElementById('adminPanel');
      if (panel) panel.classList.remove('d-none');
      const btnCheckout = document.getElementById('btnIrCheckout');
      if (btnCheckout) btnCheckout.classList.add('d-none');
    }
  } catch {}
  const btn = document.getElementById('btnLogout');
  btn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.setItem('logout_at', String(Date.now()));
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
  // Admin: resumen de ventas
  const ventasTotalesEl = document.getElementById('ventas-totales');
  const ventasMetodosEl = document.getElementById('ventas-metodos');
  if (ventasTotalesEl && ventasMetodosEl) {
    fetch(`${API_BASE}/admin/ventas/totales`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (ok) {
          ventasTotalesEl.textContent = `Pedidos: ${j.pedidos} · Ingresos: S/. ${Number(j.ingresos || 0).toFixed(2)}`;
        }
      }).catch(() => {});
    fetch(`${API_BASE}/admin/ventas/metodos`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (ok) {
          const rows = j.resumen || [];
          ventasMetodosEl.innerHTML = '';
          rows.forEach(rw => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${rw.metodo || '-'}</td><td>${rw.pedidos}</td><td>S/. ${Number(rw.ingresos || 0).toFixed(2)}</td>`;
            ventasMetodosEl.appendChild(tr);
          });
        }
      }).catch(() => {});
  }
  // Admin: agregar producto
  const form = document.getElementById('admin-product-form');
  const msg = document.getElementById('admin-product-msg');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = 'Guardando...';
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const resp = await fetch(`${API_BASE}/registrar-producto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(data)
        });
        const j = await resp.json();
        if (resp.ok) {
          msg.textContent = 'Producto guardado';
          form.reset();
        } else {
          msg.textContent = j.message || j.mensaje || 'Error guardando producto';
        }
      } catch {
        msg.textContent = 'Error de red';
      }
    });
  }
});
