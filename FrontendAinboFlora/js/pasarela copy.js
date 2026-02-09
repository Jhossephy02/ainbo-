let metodoSeleccionado = "";

function cambiarPago(event, metodo, boton) {
    event.preventDefault();
    metodoSeleccionado = metodo;

    const botones = document.querySelectorAll('.pay-option');
    botones.forEach(btn => btn.classList.remove('activo'));

    boton.classList.add('activo');

    const contenedor = document.getElementById('detallesPago');
    switch (metodo) {
        case 'visa':
            contenedor.innerHTML = '<input type="text" placeholder="Número de tarjeta Visa">';
            break;
        case 'paypal':
            contenedor.innerHTML = '<p>Serás redirigido a PayPal para completar el pago.</p>';
            break;
        case 'yape':
            contenedor.innerHTML = '<p>Escanea el código QR en tu app de Yape.</p>';
            break;
        default:
            contenedor.innerHTML = '';
    }

    const finalizarBtn = document.getElementById('finalizarBtn');
    finalizarBtn.innerHTML = `🛒 Finalizar compra con ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`;
}

function irAPago() {
    if (!metodoSeleccionado) {
        alert("Selecciona un método de pago antes de continuar.");
        return;
    }
    const envio = localStorage.getItem("reglaEnvio") || "Envío estándar: S/0.00";
    alert(`Método seleccionado: ${metodoSeleccionado.toUpperCase()}
${envio}
¡Redirigiendo a pasarela de pago...!`);
}

function abrirCotizador() {
    const ventana = window.open("", "Cotizador", "width=400,height=300");
    ventana.document.write(`
        <html>
        <head><title>Nueva regla de envío</title></head>
        <body>
            <h2>Agregar nueva regla de envío</h2>
            <input id="regla" type="text" placeholder="Ej: Envío prioritario: S/10.00">
            <button onclick="
                localStorage.setItem('reglaEnvio', document.getElementById('regla').value);
                window.close();
            ">Guardar</button>
        </body>
        </html>
    `);
}