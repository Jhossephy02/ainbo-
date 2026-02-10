function verificarSesion() {
  const token = localStorage.getItem('token');
  const paginasPublicas = ['Login.html', 'crearCuenta.html', 'index.html', 'Blog.html'];
  const paginaActual = window.location.pathname.split('/').pop();

  if (!token && !paginasPublicas.includes(paginaActual)) {
    window.location.href = 'Login.html';
  }
}

verificarSesion();

// Revalidar al volver con el botón atrás (BFCache/pageshow)
function revalidarSesion() {
  const token = localStorage.getItem('token');
  const logoutAt = Number(localStorage.getItem('logout_at') || 0);
  const paginaActual = window.location.pathname.split('/').pop();
  const paginasPublicas = ['Login.html', 'crearCuenta.html', 'index.html', 'Blog.html'];
  const debeRedirigir = (!token || logoutAt > 0) && !paginasPublicas.includes(paginaActual);
  if (debeRedirigir) {
    localStorage.removeItem('logout_at');
    window.location.replace('Login.html');
  }
}

window.addEventListener('pageshow', revalidarSesion);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') revalidarSesion();
});
