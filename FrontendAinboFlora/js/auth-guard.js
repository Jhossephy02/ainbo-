function verificarSesion() {
  const token = localStorage.getItem('token');
  const paginasPublicas = ['Login.html', 'crearCuenta.html', 'index.html', 'Blog.html'];
  const paginaActual = window.location.pathname.split('/').pop();

  if (!token && !paginasPublicas.includes(paginaActual)) {
    window.location.href = 'Login.html';
  }
}

verificarSesion();
