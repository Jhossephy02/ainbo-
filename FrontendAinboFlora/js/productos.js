const host = window.location.hostname || 'localhost';
const API_BASE = window.AINBO_API || `http://${host}:3000/api`;

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = total;
}

function agregarAlCarrito(id, nombre, precio) {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const existente = carrito.find(item => item.id === id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  const n = document.createElement('div');
  n.className = 'alert alert-success position-fixed top-0 end-0 m-3';
  n.style.zIndex = '9999';
  n.textContent = 'Producto añadido al carrito';
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2000);
}

async function cargarProductos() {
  const container = document.getElementById('productosDinamicos');
  if (!container) return;
  try {
    const resp = await fetch(`${API_BASE}/productos`);
    const data = await resp.json();
    if (data && data.success && Array.isArray(data.data)) {
      data.data.forEach(p => {
        const html = `
          <div class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100">
              <span class="badge-new">Nuevo</span>
              <img src="${p.Imagen || 'https://cdnjs.cloudflare.com/ajax/libs/placeholders/1.0.0/img/300x200.png'}" class="card-img-top" alt="${p.Nombre}">
              <div class="card-body">
                <h5 class="card-title">${p.Nombre}</h5>
                <p class="card-text">${p.Descripcion || ''}</p>
                <p class="fw-bold">S/. ${Number(p.Precio).toFixed(2)}</p>
                <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${p.Id || p.idProductos || 0}, '${p.Nombre}', ${Number(p.Precio) || 0})">
                  <i class="bi bi-cart-plus"></i> Añadir al carrito
                </button>
              </div>
            </div>
          </div>`;
        container.insertAdjacentHTML('beforeend', html);
      });
    }
  } catch (e) {
    console.error('Error al cargar productos', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
  cargarProductos();
  window.agregarAlCarrito = agregarAlCarrito;
});
