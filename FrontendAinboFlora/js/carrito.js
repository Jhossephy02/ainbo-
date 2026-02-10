document.addEventListener('DOMContentLoaded', function () {
  let cuponAplicado = false;
  function getCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
  }
  function setCarrito(items) {
    localStorage.setItem('carrito', JSON.stringify(items));
  }
  function cambiarCantidad(id, delta) {
    const carrito = getCarrito();
    const item = carrito.find(i => String(i.id) === String(id));
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      const idx = carrito.findIndex(i => String(i.id) === String(id));
      carrito.splice(idx, 1);
    }
    setCarrito(carrito);
    renderCarrito();
  }
  function eliminarProducto(id) {
    const carrito = getCarrito();
    const nuevo = carrito.filter(i => String(i.id) !== String(id));
    setCarrito(nuevo);
    renderCarrito();
  }
  function renderCarrito() {
    const cont = document.getElementById('carrito-items');
    const resumen = document.getElementById('resumen-items');
    cont.innerHTML = '';
    resumen.innerHTML = '';
    const carrito = getCarrito();
    let subtotal = 0;
    carrito.forEach(item => {
      subtotal += Number(item.precio) * Number(item.cantidad);
      const div = document.createElement('div');
      div.className = 'producto';
      div.innerHTML = `
        <img src="https://cdnjs.cloudflare.com/ajax/libs/placeholders/1.0.0/img/100x100.png" alt="${item.nombre}">
        <div class="info">
          <h4>${item.nombre}</h4>
          <p>S/. ${Number(item.precio).toFixed(2)}</p>
          <div class="cantidad">
            <button onclick="cambiarCantidad('${item.id}', -1)">-</button>
            <label>${item.cantidad}</label>
            <button onclick="cambiarCantidad('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="eliminar" onclick="eliminarProducto('${item.id}')">✕</button>
      `;
      cont.appendChild(div);
      const p = document.createElement('p');
      p.textContent = `${item.nombre} - ${item.cantidad} und`;
      resumen.appendChild(p);
    });
    let total = subtotal;
    const cuponTexto = document.getElementById('cupon-aplicado');
    if (cuponAplicado) {
      total *= 0.8;
      cuponTexto.style.display = 'block';
    } else {
      cuponTexto.style.display = 'none';
    }
    document.getElementById('subtotal').textContent = `S/. ${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `S/. ${total.toFixed(2)}`;
  }
  function continuarComprando() {
    window.location.href = 'index.html';
  }
  function cerrarCarrito() {
    window.history.back();
  }
  document.getElementById('descuento').addEventListener('change', function () {
    const cuponSection = document.getElementById('cupon-section');
    cuponSection.style.display = this.checked ? 'block' : 'none';
    cuponAplicado = false;
    renderCarrito();
  });
  document.getElementById('codigo-cupon').addEventListener('input', function () {
    const valor = this.value.trim().toLowerCase();
    cuponAplicado = valor === 'descuento20';
    renderCarrito();
  });
  window.cambiarCantidad = cambiarCantidad;
  window.eliminarProducto = eliminarProducto;
  window.continuarComprando = continuarComprando;
  window.cerrarCarrito = cerrarCarrito;
  renderCarrito();
});
