// Redirige a login si no hay usuario logueado
(function(){
  const user = localStorage.getItem('usuarioLogueado');
  if (!user) {
    window.location.href = 'login.html';
  }
})();
