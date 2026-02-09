document.addEventListener("DOMContentLoaded", function () {
    let cantidad = {
      delicia: 2,
      bonsai: 1
    };
  
    const precios = {
      delicia: 120,
      bonsai: 2250
    };
  
    let cuponAplicado = false;
  
    function cambiarCantidad(producto, delta) {
      cantidad[producto] += delta;
      if (cantidad[producto] < 0) cantidad[producto] = 0;
  
      document.getElementById(`cant-${producto}`).textContent = cantidad[producto];
  
      actualizarResumen();
    }
  
    function actualizarResumen() {
        let subtotal = (cantidad.delicia * precios.delicia) + (cantidad.bonsai * precios.bonsai);
        let total = subtotal;
      
        const cuponTexto = document.getElementById('cupon-aplicado');
        
        if (cuponAplicado) {
          total *= 0.8; // 20% de descuento
          cuponTexto.style.display = 'block';
        } else {
          cuponTexto.style.display = 'none';
        }
      
        document.getElementById('subtotal').textContent = `S/. ${subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `S/. ${total.toFixed(2)}`;
      
        document.getElementById('resumen-delicia').textContent =
          `Delicia carnivora - ${cantidad.delicia} und`;
        document.getElementById('resumen-bonsai').textContent =
          `Bonsai de 15 años - ${cantidad.bonsai} und`;
      }
      
  
    function continuarComprando() {
      alert("Regresando a la tienda...");
    }
  
    // Mostrar/ocultar el campo para ingresar cupón
    document.getElementById("descuento").addEventListener("change", function () {
      const cuponSection = document.getElementById("cupon-section");
      cuponSection.style.display = this.checked ? "block" : "none";
      cuponAplicado = false; // Reinicia el descuento
      actualizarResumen();
    });
  
    // Detectar si se escribe un cupón válido
    document.getElementById("codigo-cupon").addEventListener("input", function () {
      const valor = this.value.trim().toLowerCase();
  
      if (valor === "descuento20") {
        cuponAplicado = true;
      } else {
        cuponAplicado = false;
      }
  
      actualizarResumen();
    });
  
    window.cambiarCantidad = cambiarCantidad;
    window.continuarComprando = continuarComprando;
  
    actualizarResumen();
  });
  