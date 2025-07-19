document.addEventListener('DOMContentLoaded', function() {
  const user = localStorage.getItem('usuarioLogueado');
  if (user) {
    window.location.href = 'index.html';
    return;
  }
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const errorDiv = document.getElementById('loginError');
      errorDiv.textContent = '';
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));
          // Redirigir a dashboard de entidad si el rol es entidad
          if (data.usuario.rol === 'entidad') {
            window.location.href = 'dashboard-entidad.html';
          } else {
            window.location.href = 'index.html';
          }
        } else {
          errorDiv.textContent = data.message || 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
        }
      } catch (err) {
        errorDiv.textContent = 'Error de conexión. Intenta nuevamente.';
      }
    });
  }
});
