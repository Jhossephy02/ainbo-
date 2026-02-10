document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const API_URL = window.AINBO_API || 'http://localhost:3000/api';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const Email = loginForm.querySelector('input[type="email"]').value;
        const Contraseña = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email, Contraseña })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            alert('Error de conexión con el servidor');
        }
    });
});
