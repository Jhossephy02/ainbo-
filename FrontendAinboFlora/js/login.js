document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const API_URL = 'http://localhost:3306/api'; // Cambia el puerto aquí

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const Nombre = registerForm.querySelector('input[name="Nombre"]').value;
        const Apellido = registerForm.querySelector('input[name="Apellido"]').value;
        const Email = registerForm.querySelector('input[type="email"]').value;
        const NumeroCelular = registerForm.querySelector('input[type="tel"]').value;
        const Contraseña = registerForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${API_URL}/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Nombre,
                    Apellido,
                    Email,
                    NumeroCelular,
                    Contraseña     
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Usuario registrado con éxito');
                registerForm.reset();
                window.location.href = 'Login.html';
            } else {
                alert(data.message || 'Error al registrar el usuario');
                registerForm.reset();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor');
        }
    });
});