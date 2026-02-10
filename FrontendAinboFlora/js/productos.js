const host = window.location.hostname || 'localhost';
const API_BASE = window.AINBO_API || `http://${host}:3000/api`;

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total === 0 ? 'none' : 'inline-flex';
  }
}

function agregarAlCarrito(id, nombre, precio, imagen) {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const existente = carrito.find(item => item.id === id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1, imagen: imagen || 'img/img1.png' });
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  mostrarToast('Añadido al carrito', `${nombre} x1`);
  try {
    const cartLink = document.querySelector('a[href="checkout.html"]') || document.querySelector('.bi-cart3')?.closest('a');
    if (cartLink) {
      cartLink.classList.add('shake');
      setTimeout(() => cartLink.classList.remove('shake'), 400);
    }
  } catch {}
}

async function cargarProductos() {
  const container = document.getElementById('productosDinamicos');
  if (!container) return;
  try {
    mostrarSkeletons(container, 8);
    const resp = await fetch(`${API_BASE}/productos`);
    const data = await resp.json();
    if (data && data.success && Array.isArray(data.data)) {
      container.innerHTML = '';
      data.data.forEach(p => {
        const html = `
          <div class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100">
              <span class="badge-new">Nuevo</span>
              <img src="${p.Imagen || 'img/img1.png'}" class="card-img-top" alt="${p.Nombre}" loading="lazy">
              <div class="card-body">
                <h5 class="card-title">${p.Nombre}</h5>
                <p class="card-text">${p.Descripcion || ''}</p>
                <p class="fw-bold">S/. ${Number(p.Precio).toFixed(2)}</p>
                ${(() => {
                  const luz = p.Luz || '';
                  const riego = p.Riego || '';
                  const pet = (p.PetFriendly === 1 || p.PetFriendly === true);
                  if (!luz && !riego && typeof pet !== 'boolean') return '';
                  return `<div class="d-flex gap-2 align-items-center mb-2">
                    ${luz ? `<span class="badge bg-light text-dark"><i class="bi bi-sun me-1"></i>${luz}</span>` : ''}
                    ${riego ? `<span class="badge bg-light text-dark"><i class="bi bi-droplet me-1"></i>${riego}</span>` : ''}
                    ${typeof pet === 'boolean' ? `<span class="badge ${pet ? 'bg-success' : 'bg-danger'}"><i class="bi ${pet ? 'bi-shield-check' : 'bi-exclamation-triangle'} me-1"></i>${pet ? 'Pet Friendly' : 'No Pet Friendly'}</span>` : ''}
                  </div>`;
                })()}
                <button class="btn btn-primary w-100 btn-add-cart" data-id="${p.Id || p.idProductos || 0}" data-nombre="${p.Nombre}" data-precio="${Number(p.Precio) || 0}">
                  <i class="bi bi-cart-plus"></i> Añadir al carrito
                </button>
                <a class="btn btn-outline-success w-100 mt-2" target="_blank" href="https://wa.me/51978011943?text=${encodeURIComponent('Comprar: '+(p.Nombre||'')+' · S/. '+(Number(p.Precio).toFixed(2)))}">
                  <i class="bi bi-whatsapp"></i> Comprar por WhatsApp
                </a>
              </div>
            </div>
          </div>`;
        container.insertAdjacentHTML('beforeend', html);
      });
    }
  } catch (e) {
    console.error('Error al cargar productos', e);
  } finally {
    ocultarSkeletons(container);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
  cargarProductos();
  window.agregarAlCarrito = agregarAlCarrito;
  // Evita que los botones dentro de formularios recarguen la página
  document.addEventListener('submit', e => {
    try { e.preventDefault(); } catch {}
  });
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const text = (btn.textContent || '').toLowerCase();
    if (!text.includes('añadir al') && !btn.classList.contains('btn-add-cart')) return;
    const form = btn.closest('form');
    if (form) { try { e.preventDefault(); } catch {} }
    const card = btn.closest('.card');
    if (!card) return;
    const nombreEl = card.querySelector('.card-title');
    const precioEl = card.querySelector('.fw-bold');
    const nombre = btn.dataset.nombre || (nombreEl ? nombreEl.textContent.trim() : '');
    let precioTxt = btn.dataset.precio || (precioEl ? precioEl.textContent.trim() : '0');
    precioTxt = precioTxt.replace(/[^0-9.,]/g, '').replace(',', '.');
    const precio = Number(precioTxt) || 0;
    const id = Number(btn.dataset.id || 0) || Math.floor(Math.random() * 1000000);
    const imgEl = card.querySelector('img');
    const imagen = imgEl ? imgEl.src : 'img/img1.png';
    agregarAlCarrito(id, nombre, precio, imagen);
    if (typeof window.abrirCarrito === 'function') {
      window.abrirCarrito();
    } else {
      try { window.location.href = 'checkout.html'; } catch {}
    }
    if (typeof window.renderResumen === 'function') window.renderResumen();
  });
});

function mostrarToast(titulo, detalle) {
  let cont = document.querySelector('.toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.className = 'toast-container';
    document.body.appendChild(cont);
  }
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-bg-success border-0';
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong>${titulo}</strong> · ${detalle}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  cont.appendChild(toastEl);
  if (window.bootstrap && typeof bootstrap.Toast === 'function') {
    const toast = new bootstrap.Toast(toastEl, { delay: 1800 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  } else {
    setTimeout(() => toastEl.remove(), 1800);
  }
}

function mostrarSkeletons(container, count) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const html = `
      <div class="col-md-4 col-lg-3 mb-4">
        <div class="card h-100 skeleton-card">
          <div class="skeleton skeleton-img"></div>
          <div class="p-3">
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line-lg"></div>
          </div>
        </div>
      </div>`;
    container.insertAdjacentHTML('beforeend', html);
  }
}

function ocultarSkeletons(container) {
  const sk = container.querySelectorAll('.skeleton-card');
  sk.forEach(el => el.remove());
}
