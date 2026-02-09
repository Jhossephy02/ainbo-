 // Script para mostrar el número de productos en el carrito
 document.addEventListener('DOMContentLoaded', function() {
  // Simular agregar al carrito
  const addButtons = document.querySelectorAll('.btn-primary');
  const cartBadge = document.querySelector('.badge');
  let cartCount = 0;
  
  addButtons.forEach(button => {
      button.addEventListener('click', function() {
          cartCount++;
          cartBadge.textContent = cartCount;
          
          // Feedback visual
          this.innerHTML = '<i class="bi bi-check-circle"></i> Añadido';
          this.classList.remove('btn-primary');
          this.classList.add('btn-success');
          
          setTimeout(() => {
              this.innerHTML = '<i class="bi bi-cart-plus"></i> Añadir al carrito';
              this.classList.remove('btn-success');
              this.classList.add('btn-primary');
          }, 1500);
      });
  });
  
  // Activar tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
  });
});



    // Objeto para almacenar los productos del carrito
    let carritoItems = {
      'delicia': { id: 'delicia', nombre: 'Delicia Carnívora', precio: 120.00, cantidad: 2 },
      'bonsai': { id: 'bonsai', nombre: 'Bonsái de 15 años', precio: 2250.00, cantidad: 1, detalle: '70cm - 80cm' },
      'kit': { id: 'kit', nombre: 'Kit de Herramientas', precio: 85.00, cantidad: 0 }
    };
    
    // Variables para descuentos
    let descuentoAplicado = false;
    let porcentajeDescuento = 0.20; 
    
    // Función para abrir el carrito
    function abrirCarrito() {
      document.getElementById('carrito').classList.add('abierto');
      document.getElementById('overlay').classList.add('activo');
      document.body.style.overflow = 'hidden'; // Evita el desplazamiento de la página
      actualizarCarrito();
    }
    
    // Función para cerrar el carrito
    function cerrarCarrito() {
      document.getElementById('carrito').classList.remove('abierto');
      document.getElementById('overlay').classList.remove('activo');
      document.body.style.overflow = 'auto'; // Restaura el desplazamiento
    }
    
    // Función para mostrar/ocultar el campo de cupón
    function toggleCupon() {
      const cuponInput = document.getElementById('cupon-input');
      cuponInput.style.display = cuponInput.style.display === 'flex' ? 'none' : 'flex';
    }
    
    // Función para aplicar el cupón de descuento
    function aplicarCupon() {
      const codigoCupon = document.getElementById('codigo-cupon').value.trim().toUpperCase();
      const cuponMensaje = document.getElementById('cupon-mensaje');
      
      // Lista de cupones válidos (normalmente esto se verificaría en el servidor)
      const cuponesValidos = ['AINBO20', 'FLORA2025', 'BIENVENIDO'];
      
      if (cuponesValidos.includes(codigoCupon)) {
        descuentoAplicado = true;
        cuponMensaje.style.display = 'block';
        document.getElementById('cupon-input').style.display = 'none';
        actualizarCarrito();
      } else {
        alert('Cupón inválido o expirado');
      }
    }
    
    // Función para agregar un producto al carrito
    function agregarAlCarrito(id, nombre, precio, cantidad, detalle = '') {
      if (carritoItems[id]) {
        carritoItems[id].cantidad += cantidad;
      } else {
        carritoItems[id] = { id, nombre, precio, cantidad, detalle };
      }
      
      // Actualizar contador de productos
      actualizarContadorCarrito();
      
      // Mostrar animación o mensaje de confirmación
      const boton = event.currentTarget;
      const textoOriginal = boton.innerHTML;
      
      boton.innerHTML = '<i class="bi bi-check-circle"></i> ¡Añadido!';
      boton.classList.remove('btn-success');
      boton.classList.add('btn-outline-success');
      
      setTimeout(() => {
        boton.innerHTML = textoOriginal;
        boton.classList.remove('btn-outline-success');
        boton.classList.add('btn-success');
      }, 1500);
      
      // Abrir el carrito automáticamente
      abrirCarrito();
    }
    
    // Función para cambiar la cantidad de un producto
    function cambiarCantidad(id, cambio) {
      if (carritoItems[id]) {
        carritoItems[id].cantidad += cambio;
        
        // Si la cantidad llega a 0, eliminar el producto
        if (carritoItems[id].cantidad <= 0) {
          delete carritoItems[id];
        }
        
        actualizarCarrito();
        actualizarContadorCarrito();
      }
    }
    
    // Función para eliminar un producto del carrito
    function eliminarProducto(id) {
      if (carritoItems[id]) {
        delete carritoItems[id];
        actualizarCarrito();
        actualizarContadorCarrito();
      }
    }
    
    // Función para actualizar el contenido del carrito
    function actualizarCarrito() {
      const carritoItemsElement = document.getElementById('carrito-items');
      carritoItemsElement.innerHTML = '';
      
      let hayProductos = false;
      let subtotal = 0;
      
      // Agregar cada producto al carrito
      for (const id in carritoItems) {
        if (carritoItems[id].cantidad > 0) {
          hayProductos = true;
          const item = carritoItems[id];
          subtotal += item.precio * item.cantidad;
          
          const productoElement = document.createElement('div');
          productoElement.className = 'carrito-producto';
          productoElement.innerHTML = `
            <img src="https://cdnjs.cloudflare.com/ajax/libs/placeholders/1.0.0/img/100x100.png" alt="${item.nombre}">
            <div class="producto-info">
              <h5>${item.nombre}</h5>
              <p class="producto-precio">S/. ${item.precio.toFixed(2)}</p>
              ${item.detalle ? `<p class="producto-detalle">${item.detalle}</p>` : ''}
              <div class="producto-cantidad">
                <button class="cantidad-btn" onclick="cambiarCantidad('${id}', -1)">-</button>
                <span class="cantidad-valor">${item.cantidad}</span>
                <button class="cantidad-btn" onclick="cambiarCantidad('${id}', 1)">+</button>
              </div>
            </div>
            <button class="eliminar-producto" onclick="eliminarProducto('${id}')">
              <i class="bi bi-trash"></i>
            </button>
          `;
          
          carritoItemsElement.appendChild(productoElement);
        }
      }
      
      // Mostrar mensaje si el carrito está vacío
      if (!hayProductos) {
        carritoItemsElement.innerHTML = `
          <div class="carrito-vacio">
            <i class="bi bi-cart-x"></i>
            <h5>Tu carrito está vacío</h5>
            <p>Añade algunos productos para comenzar</p>
            <a href="index.html" class="seguir-comprando" onclick="cerrarCarrito()">Seguir comprando</a>
          </div>
        `;
      }
      
      // Actualizar subtotal y total
      const subtotalElement = document.getElementById('subtotal-valor');
      const totalElement = document.getElementById('total-valor');
      
      subtotalElement.textContent = `S/. ${subtotal.toFixed(2)}`;
      
      let total = subtotal;
      if (descuentoAplicado) {
        total = subtotal * (1 - porcentajeDescuento);
      }
      
      totalElement.textContent = `S/. ${total.toFixed(2)}`;
    }
    
    // Función para actualizar el contador de productos en el icono del carrito
    function actualizarContadorCarrito() {
      const contador = document.querySelector('.contador-carrito');
      let totalItems = 0;
      
      for (const id in carritoItems) {
        totalItems += carritoItems[id].cantidad;
      }
      
      contador.textContent = totalItems;
      
      // Ocultar el contador si no hay productos
      if (totalItems === 0) {
        contador.style.display = 'none';
      } else {
        contador.style.display = 'flex';
      }
    }
    
    // Inicializar el carrito al cargar la página
    window.onload = function() {
      actualizarContadorCarrito();
    };


document.addEventListener('DOMContentLoaded', function () {
  const chatIcon = document.getElementById('chatIcon');
  const chatContainer = document.getElementById('chatContainer');
  const closeChat = document.getElementById('closeChat');
  const userMessage = document.getElementById('userMessage');
  const sendMessage = document.getElementById('sendMessage');
  const chatMessages = document.getElementById('chatMessages');
  const notificationBadge = document.querySelector('.notification-badge');

  chatIcon.addEventListener('click', function () {
    chatContainer.classList.add('visible');
    notificationBadge.style.display = 'none';
  });

  closeChat.addEventListener('click', function () {
    chatContainer.classList.remove('visible');
  });

  function sendMessageHandler() {
    const messageText = userMessage.value.trim();
    if (messageText !== '') {
      addMessage(messageText, 'sent');
      userMessage.value = '';

      setTimeout(() => {
        const responses = [
          "Gracias por tu mensaje. ¿Cómo puedo ayudarte?",
          "Interesante, ¿puedes darme más detalles?",
          "Estoy procesando tu solicitud...",
          "¿Hay algo más en lo que pueda ayudarte?",
          "Voy a verificar eso por ti."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'received');
      }, 1000 + Math.random() * 2000);
    }
  }

  sendMessage.addEventListener('click', sendMessageHandler);
  userMessage.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessageHandler();
  });

  function addMessage(text, type) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${text}</p>
        <span class="message-time">${timeString}</span>
      </div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (!chatContainer.classList.contains('visible') && type === 'received') {
      notificationBadge.style.display = 'flex';
    }
  }

  setTimeout(() => {
    if (!chatContainer.classList.contains('visible')) {
      notificationBadge.style.display = 'flex';
    }
  }, 5000);
});

/*parte de los testimonios*/ 

document.addEventListener('DOMContentLoaded', function() {
    const btnAgregar = document.getElementById('btnAgregarTestimonio');
    const formulario = document.getElementById('formularioTestimonio');
    const btnCancelar = document.getElementById('btnCancelarTestimonio');
    const formTestimonio = document.getElementById('nuevoTestimonioForm');
    const testimoniosContainer = document.getElementById('testimonios-container');
    const stars = document.querySelectorAll('.rating-input i');
    const ratingInput = document.getElementById('calificacionTestimonio');
    
    // Mostrar formulario
    btnAgregar.addEventListener('click', function() {
        formulario.classList.remove('d-none');
        btnAgregar.classList.add('d-none');
        window.scrollTo({
            top: formulario.offsetTop - 100,
            behavior: 'smooth'
        });
    });
    
    // Ocultar formulario
    btnCancelar.addEventListener('click', function() {
        formulario.classList.add('d-none');
        btnAgregar.classList.remove('d-none');
        formTestimonio.reset();
        resetStars();
    });
    
    // Manejar estrellas de calificación
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = rating;
            updateStars(rating);
        });
        
        star.addEventListener('mouseover', function() {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < hoverRating) {
                    s.classList.add('text-warning');
                } else {
                    s.classList.remove('text-warning');
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(ratingInput.value);
            updateStars(currentRating);
        });
    });
    
    function updateStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('bi-star');
                star.classList.add('bi-star-fill', 'text-warning');
            } else {
                star.classList.remove('bi-star-fill', 'text-warning');
                star.classList.add('bi-star');
            }
        });
    }
    
    function resetStars() {
        ratingInput.value = '0';
        stars.forEach(star => {
            star.classList.remove('bi-star-fill', 'text-warning');
            star.classList.add('bi-star');
        });
    }
    
    // Enviar formulario
    formTestimonio.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombreTestimonio').value.trim();
        const ubicacion = document.getElementById('ubicacionTestimonio').value.trim();
        const calificacion = parseInt(ratingInput.value);
        const comentario = document.getElementById('comentarioTestimonio').value.trim();
        
        if (calificacion === 0) {
            alert('Por favor selecciona una calificación con las estrellas');
            return;
        }
        
        // Crear iniciales para el avatar
        const nombres = nombre.split(' ');
        let initials = '';
        if (nombres.length >= 2) {
            initials = (nombres[0][0] + nombres[1][0]).toUpperCase();
        } else {
            initials = nombre.substring(0, 2).toUpperCase();
        }
        
        // Crear el HTML del nuevo testimonio
        const testimonioHTML = `
        <div class="col-md-4 mb-4">
            <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                    <div class="rating mb-3">
                        ${'<i class="bi bi-star-fill"></i>'.repeat(Math.floor(calificacion))}
                        ${calificacion % 1 !== 0 ? '<i class="bi bi-star-half"></i>' : ''}
                        ${'<i class="bi bi-star"></i>'.repeat(5 - Math.ceil(calificacion))}
                    </div>
                    <p class="card-text fst-italic">"${comentario}"</p>
                    <div class="d-flex align-items-center mt-3">
                        <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                            style="width: 50px; height: 50px;">
                            <span class="fw-bold">${initials}</span>
                        </div>
                        <div class="ms-3">
                            <h6 class="mb-0">${nombre}</h6>
                            <small class="text-muted">${ubicacion}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Agregar el testimonio al contenedor (al principio)
        testimoniosContainer.insertAdjacentHTML('afterbegin', testimonioHTML);
        
        // Resetear formulario
        formTestimonio.reset();
        resetStars();
        formulario.classList.add('d-none');
        btnAgregar.classList.remove('d-none');
        
        // Mostrar mensaje de éxito
        const alertHTML = `
        <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            ¡Gracias por tu comentario! Se ha publicado correctamente.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        
        formulario.insertAdjacentHTML('beforebegin', alertHTML);
        
        // Cerrar automáticamente la alerta después de 5 segundos
        setTimeout(() => {
            const alert = document.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    });
});
