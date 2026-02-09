document.addEventListener('DOMContentLoaded', function() {

    
    // Agregar producto al carrito
    document.querySelectorAll('.agregar-carrito').forEach(button => {
        button.addEventListener('click', async function() {
            const productoId = this.dataset.id;
            const respuesta = await fetch('/carrito/agregar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productoId })
            });
            
            if (respuesta.ok) {
                alert('Producto agregado al carrito');
                actualizarContadorCarrito();
            }
        });
    });

    // Actualizar cantidad en carrito
    document.querySelectorAll('.cantidad-input').forEach(input => {
        input.addEventListener('change', async function() {
            const itemId = this.dataset.itemId;
            const nuevaCantidad = this.value;
            
            const respuesta = await fetch(`/carrito/actualizar/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cantidad: nuevaCantidad })
            });
            
            if (respuesta.ok) {
                location.reload(); // Recargar para ver cambios
            }
        });
    });

    // Eliminar item del carrito
    document.querySelectorAll('.eliminar-item').forEach(button => {
        button.addEventListener('click', async function() {
            const itemId = this.dataset.itemId;
            
            const respuesta = await fetch(`/carrito/eliminar/${itemId}`, {
                method: 'DELETE'
            });
            
            if (respuesta.ok) {
                location.reload();
            }
        });
    });

    // Función para actualizar contador del carrito
    async function actualizarContadorCarrito() {
        const respuesta = await fetch('/carrito/cantidad');
        if (respuesta.ok) {
            const cantidad = await respuesta.json();
            document.querySelector('.carrito-contador').textContent = cantidad;
        }
    }
});