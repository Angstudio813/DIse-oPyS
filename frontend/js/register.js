// js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('usuarioLogueado');
    if (user) {
        window.location.href = 'index.html';
        return;
    }
    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.textContent = '';
        successDiv.textContent = '';

        const nombre = form.nombre.value.trim();
        const email = form.email.value.trim();
        const telefono = form.telefono.value.trim();
        const password = form.password.value;
        const dni = form.dni.value.trim();
        const direccion = form.direccion.value.trim();
        const fechaNacimiento = form.fechaNacimiento.value;

        if (!nombre || !email || !telefono || !password || !dni || !direccion || !fechaNacimiento) {
            errorDiv.textContent = 'Completa todos los campos.';
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, telefono, password, dni, direccion, fechaNacimiento })
            });
            const data = await res.json();
            if (res.ok) {
                successDiv.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
                form.reset();
            } else {
                errorDiv.textContent = data.error || 'Error al registrar usuario.';
            }
        } catch (err) {
            errorDiv.textContent = 'Error de red.';
        }
    });
});
