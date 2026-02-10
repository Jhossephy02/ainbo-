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
      <div class="d-flex align-items-center">
        <img src="${it.imagen || 'img/img1.png'}" alt="${it.nombre}" class="rounded me-2" style="width:40px;height:40px;object-fit:cover;">
        <span>${it.nombre} x${it.cantidad}</span>
      </div>
      <span>S/. ${Number(it.precio * it.cantidad).toFixed(2)}</span>
    `;
    ul.appendChild(li);
  });
  document.getElementById('subtotal').textContent = `S/. ${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent = `S/. ${subtotal.toFixed(2)}`;
}

async function crearPedido(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando pedido...';
  }
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
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Crear pedido';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const rol = (usuario && (usuario.Rol || usuario.rol)) || 'usuario';
  if (rol === 'admin') {
    const root = document.querySelector('.container.py-4') || document.body;
    if (root) {
      root.innerHTML = `
        <div class="row">
          <div class="col-md-3">
            <div class="list-group">
              <a href="#" class="list-group-item list-group-item-action active" data-view="productos"><i class="bi bi-box-seam me-2"></i>Productos</a>
              <a href="#" class="list-group-item list-group-item-action" data-view="ventas"><i class="bi bi-graph-up me-2"></i>Ventas</a>
              <a href="#" class="list-group-item list-group-item-action" data-view="pedidos"><i class="bi bi-receipt me-2"></i>Pedidos</a>
              <a href="#" class="list-group-item list-group-item-action" data-view="usuarios"><i class="bi bi-people me-2"></i>Usuarios</a>
            </div>
          </div>
          <div class="col-md-9">
            <div id="admin-content"></div>
          </div>
        </div>
      `;
      const token = localStorage.getItem('token') || '';
      const content = document.getElementById('admin-content');
      const navItems = document.querySelectorAll('.list-group .list-group-item');
      const setActive = (view) => {
        navItems.forEach(n => n.classList.toggle('active', n.dataset.view === view));
      };
      const renderProductos = () => {
        content.innerHTML = `
          <h4 class="mb-3 d-flex align-items-center text-success"><i class="bi bi-box-seam me-2"></i>Productos</h4>
          <form id="admin-product-form" class="mb-3">
            <div class="row g-2">
              <div class="col-md-6"><input class="form-control" name="Nombre" placeholder="Nombre" required></div>
              <div class="col-md-6"><input class="form-control" name="Categoria" placeholder="Categoría" required></div>
              <div class="col-12"><input class="form-control" name="Descripcion" placeholder="Descripción" required></div>
              <div class="col-md-4"><input class="form-control" name="Precio" type="number" step="0.01" placeholder="Precio" required></div>
              <div class="col-md-4"><input class="form-control" name="Stock" type="number" placeholder="Stock" required></div>
              <div class="col-md-4"><input class="form-control" name="Imagen" placeholder="URL Imagen o ruta img/..." required></div>
            </div>
            <button class="btn btn-success mt-3" type="submit">Guardar producto</button>
            <div id="admin-product-msg" class="mt-2 small text-muted"></div>
          </form>
        `;
        const form = document.getElementById('admin-product-form');
        const msg = document.getElementById('admin-product-msg');
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
      };
      const renderVentas = () => {
        content.innerHTML = `
          <h4 class="mb-3 d-flex align-items-center text-success"><i class="bi bi-graph-up me-2"></i>Ventas</h4>
          <div id="ventas-totales" class="mb-3">—</div>
          <table class="table table-sm">
            <thead><tr><th>Método</th><th>Pedidos</th><th>Ingresos</th></tr></thead>
            <tbody id="ventas-metodos"></tbody>
          </table>
        `;
        fetch(`${API_BASE}/admin/ventas/totales`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.json().then(j => ({ ok: r.ok, j })))
          .then(({ ok, j }) => {
            if (ok) document.getElementById('ventas-totales').textContent = `Pedidos: ${j.pedidos} · Ingresos: S/. ${Number(j.ingresos || 0).toFixed(2)}`;
          }).catch(() => {});
        fetch(`${API_BASE}/admin/ventas/metodos`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.json().then(j => ({ ok: r.ok, j })))
          .then(({ ok, j }) => {
            if (ok) {
              const rows = j.resumen || [];
              const tbody = document.getElementById('ventas-metodos');
              tbody.innerHTML = '';
              rows.forEach(rw => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${rw.metodo || '-'}</td><td>${rw.pedidos}</td><td>S/. ${Number(rw.ingresos || 0).toFixed(2)}</td>`;
                tbody.appendChild(tr);
              });
            }
          }).catch(() => {});
      };
      const renderPedidos = () => {
        content.innerHTML = `
          <h4 class="mb-3 d-flex align-items-center text-success"><i class="bi bi-receipt me-2"></i>Pedidos</h4>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th>Orden</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Estado</th></tr></thead>
              <tbody id="admin-pedidos"></tbody>
            </table>
          </div>
        `;
        fetch(`${API_BASE}/admin/pedidos`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.json().then(j => ({ ok: r.ok, j })))
          .then(({ ok, j }) => {
            const tbody = document.getElementById('admin-pedidos');
            tbody.innerHTML = '';
            if (ok) {
              (j.pedidos || []).forEach(p => {
                const pago = p.PaymentMethod ? `${p.PaymentMethod}${p.PagoCodigo ? ' ('+p.PagoCodigo+')' : ''}` : 'N/A';
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${p.NumeroOrden || 'N/A'}</td><td>${p.Nombre || p.Email || '—'}</td><td>S/. ${Number(p.Total || 0).toFixed(2)}</td><td>${pago}</td><td>${p.PaymentStatus || p.Estado || 'pendiente'}</td>`;
                tbody.appendChild(tr);
              });
            }
          }).catch(() => {});
      };
      const renderUsuarios = () => {
        content.innerHTML = `
          <h4 class="mb-3 d-flex align-items-center text-success"><i class="bi bi-people me-2"></i>Usuarios</h4>
          <div class="row">
            <div class="col-md-6">
              <h6>Crear administrador</h6>
              <form id="admin-create-form">
                <div class="row g-2">
                  <div class="col-md-6"><input class="form-control" name="Nombre" placeholder="Nombre" required></div>
                  <div class="col-md-6"><input class="form-control" name="Apellido" placeholder="Apellido" required></div>
                  <div class="col-12"><input class="form-control" name="Email" type="email" placeholder="Email" required></div>
                  <div class="col-12"><input class="form-control" name="NumeroCelular" type="tel" placeholder="Celular (opcional)"></div>
                  <div class="col-12"><input class="form-control" name="Contraseña" type="password" placeholder="Contraseña" required></div>
                </div>
                <button class="btn btn-success mt-3" type="submit">Crear admin</button>
                <div id="admin-create-msg" class="mt-2 small text-muted"></div>
              </form>
            </div>
            <div class="col-md-6">
              <p class="text-muted">Para edición avanzada de usuarios y roles, usa el panel dedicado.</p>
              <a class="btn btn-outline-success" href="Panel.html">Abrir gestión de usuarios</a>
            </div>
          </div>
        `;
        const form = document.getElementById('admin-create-form');
        const msg = document.getElementById('admin-create-msg');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          msg.textContent = 'Creando...';
          const data = Object.fromEntries(new FormData(form).entries());
          data.Rol = 'admin';
          try {
            const resp = await fetch(`${API_BASE}/admin/usuarios`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(data)
            });
            const j = await resp.json();
            if (resp.ok) {
              msg.textContent = 'Administrador creado';
              form.reset();
            } else {
              msg.textContent = j.message || 'Error creando administrador';
            }
          } catch {
            msg.textContent = 'Error de red';
          }
        });
      };
      const views = { productos: renderProductos, ventas: renderVentas, pedidos: renderPedidos, usuarios: renderUsuarios };
      navItems.forEach(n => n.addEventListener('click', (e) => {
        e.preventDefault();
        const v = n.dataset.view;
        setActive(v);
        views[v] && views[v]();
      }));
      setActive('productos');
      renderProductos();
    }
    return;
  }
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
