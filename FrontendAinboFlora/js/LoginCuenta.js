document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const host = window.location.hostname || 'localhost';
    const API_URL = window.AINBO_API || `http://${host}:3000/api`;

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

            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error('json_parse_error');
            }

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                const rol = (data.usuario && (data.usuario.Rol || data.usuario.rol)) || 'usuario';
                if (rol === 'admin') {
                    window.location.href = 'checkout.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                alert(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            alert(error.message === 'json_parse_error' ? 'El servidor devolvió una respuesta inválida' : 'Error de conexión con el servidor');
        }
    });
});
