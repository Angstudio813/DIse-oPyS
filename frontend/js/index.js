// Cargar estadísticas al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  cargarEstadisticas();
  // Navbar dinámico: igual que en otras vistas
  const user = JSON.parse(localStorage.getItem('usuarioLogueado'));
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.innerHTML = `
      <li><a href="crear-donacion.html">Crear Donación</a></li>
      <li><a href="ver-donaciones.html">Ver Donaciones</a></li>
      <li><a href="crear-intercambio.html">Crear Intercambio</a></li>
      <li><a href="ver-intercambios.html">Ver Intercambios</a></li>
      <li><a href="contacto.html">Contacto</a></li>
      <li id="loginNav"><a href="login.html">Iniciar sesión</a></li>
      <li id="registerNav"><a href="register.html">Registrarse</a></li>
      <li id="userNav" style="display:none">
        <div class="user-dropdown" id="userDropdown">
          <button class="user-btn" id="userBtn"><span id="userName"></span> <span style="font-size:1.1em;">▼</span></button>
          <div class="user-dropdown-content" id="userDropdownContent">
            <a href="#" id="logoutLink">Cerrar sesión</a>
          </div>
        </div>
      </li>
    `;
    // Lógica de usuario logueado
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const userNav = document.getElementById('userNav');
    const userName = document.getElementById('userName');
    if (user) {
      if (loginNav) loginNav.style.display = 'none';
      if (registerNav) registerNav.style.display = 'none';
      if (userNav) userNav.style.display = 'inline-block';
      if (userName) userName.textContent = user.nombre || user.usuario || 'Usuario';
      // Dropdown funcional
      const userBtn = document.getElementById('userBtn');
      const dropdown = document.getElementById('userDropdown');
      if (userBtn && dropdown) {
        userBtn.onclick = function(e) {
          e.preventDefault();
          dropdown.classList.toggle('show');
        };
      }
      const logoutLink = document.getElementById('logoutLink');
      if (logoutLink) {
        logoutLink.onclick = function(e) {
          e.preventDefault();
          localStorage.removeItem('usuarioLogueado');
          window.location.href = 'login.html';
        };
      }
      document.addEventListener('click', function(e) {
        if (dropdown && !dropdown.contains(e.target) && e.target !== userBtn) dropdown.classList.remove('show');
      });
    } else {
      if (loginNav) loginNav.style.display = 'inline-block';
      if (registerNav) registerNav.style.display = 'inline-block';
      if (userNav) userNav.style.display = 'none';
    }
  }
});


        async function cargarEstadisticas() {
            try {
                const user = localStorage.getItem('usuarioLogueado');
                let userEmail = null;
                if (user) {
                    try {
                        const userObj = JSON.parse(user);
                        userEmail = userObj.email;
                    } catch {}
                }

                // Donaciones activas solo si el usuario está logueado
                let activasUsuario = 0;
                if (userEmail) {
                    const donacionesResponse = await fetch('/api/donaciones');
                    if (donacionesResponse.ok) {
                        const donaciones = await donacionesResponse.json();
                        activasUsuario = donaciones.filter(d => (!d.estadoDonacion || d.estadoDonacion !== 'entregada') && d.email === userEmail).length;
                    }
                }
                document.getElementById('totalDonaciones').textContent = activasUsuario;

                // Intercambios: puedes aplicar la misma lógica si quieres privacidad, o dejar global
                const intercambiosResponse = await fetch('/api/intercambios');
                if (intercambiosResponse.ok) {
                    const intercambios = await intercambiosResponse.json();
                    document.getElementById('totalIntercambios').textContent = intercambios.length;
                }
            } catch (error) {
                console.log('Error al cargar estadísticas:', error);
            }
        }

        // Animaciónes
        function animateNumber(element, target) {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 20);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = document.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.textContent);
                        if (target > 0) {
                            animateNumber(stat, target);
                        }
                    });
                }
            });
        });

        observer.observe(document.querySelector('.stats'));
