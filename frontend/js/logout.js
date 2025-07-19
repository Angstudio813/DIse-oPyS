// Cerrar sesión
function logout() {
  localStorage.removeItem('usuarioLogueado');
  window.location.href = 'login.html';
}
