// Script clásico, funciones de chat están en window por firebase-chat.js

// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Clase para manejar las peticiones a la API
class IntercambiosAPI {
    static async obtenerTodos() {
        try {
            const response = await fetch(`${API_URL}/intercambios`);
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo intercambios:', error);
            return [];
        }
    }

    static async filtrarPorCategoria(categoria) {
        try {
            const response = await fetch(`${API_URL}/categoria/${categoria}`);
            return await response.json();
        } catch (error) {
            console.error('Error filtrando por categoría:', error);
            return [];
        }
    }

    static async buscar(termino) {
        try {
            const response = await fetch(`${API_URL}/buscar/${termino}`);
            return await response.json();
        } catch (error) {
            console.error('Error buscando:', error);
            return [];
        }
    }
}

class VistaIntercambios {
    constructor() {
        this.container = document.getElementById('intercambiosContainer');
        this.filtroCategoria = document.getElementById('filtroCategoria');
        this.filtroBusqueda = document.getElementById('filtroBusqueda');
        this.totalIntercambios = document.getElementById('totalIntercambios');
        this.categoriasActivas = document.getElementById('categoriasActivas');
        this.noIntercambios = document.getElementById('noIntercambios');
        
        this.intercambios = [];
        this.intercambiosFiltrados = [];
        
        this.inicializar();
    }

    async inicializar() {
        await this.cargarIntercambios();
        this.configurarEventos();
        this.mostrarIntercambios();
    }

    async cargarIntercambios() {
        this.intercambios = await IntercambiosAPI.obtenerTodos();
        this.intercambiosFiltrados = this.intercambios.filter(i => i.estado === 'activo');
        this.actualizarEstadisticas();
    }

    configurarEventos() {
        this.filtroCategoria.addEventListener('change', () => this.aplicarFiltros());
        this.filtroBusqueda.addEventListener('input', () => this.aplicarFiltros());
    }

    aplicarFiltros() {
        const categoria = this.filtroCategoria.value;
        const busqueda = this.filtroBusqueda.value.toLowerCase();

        this.intercambiosFiltrados = this.intercambios.filter(intercambio => {
            if (intercambio.estado !== 'activo') return false;

            const cumpleCategoria = !categoria || intercambio.categoria === categoria;
            const cumpleBusqueda = !busqueda || 
                intercambio.itemOfrece.toLowerCase().includes(busqueda) ||
                intercambio.itemBusca.toLowerCase().includes(busqueda) ||
                intercambio.descripcionOfrece.toLowerCase().includes(busqueda) ||
                intercambio.descripcionBusca.toLowerCase().includes(busqueda);

            return cumpleCategoria && cumpleBusqueda;
        });

        this.actualizarEstadisticas();
        this.mostrarIntercambios();
    }

    actualizarEstadisticas() {
        this.totalIntercambios.textContent = this.intercambiosFiltrados.length;
        const categorias = new Set(this.intercambiosFiltrados.map(i => i.categoria));
        this.categoriasActivas.textContent = categorias.size;
    }

    mostrarIntercambios() {
        if (this.intercambiosFiltrados.length === 0) {
            this.container.style.display = 'none';
            this.noIntercambios.style.display = 'block';
            return;
        }

        this.container.style.display = 'grid';
        this.noIntercambios.style.display = 'none';

        this.container.innerHTML = this.intercambiosFiltrados.map(intercambio => 
            this.crearTarjetaIntercambio(intercambio)
        ).join('');
    }

    crearTarjetaIntercambio(intercambio) {
        const fecha = new Date(intercambio.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const iniciales = intercambio.usuario
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();

        const imagenHTML = intercambio.imagen ? 
            `<div class="item-imagen"><img src="${intercambio.imagen}" alt="${intercambio.itemOfrece}"></div>` : 
            '';

        // Mostrar botón contactar solo para usuarios logueados tipo 'usuario' y distinto al publicador
        const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
        let contactarBtn = '';
        if (usuarioLogueado && usuarioLogueado.rol === 'usuario' && usuarioLogueado.id !== intercambio.idUsuario) {
            contactarBtn = `<button class='contactar-btn' data-idusuario='${intercambio.idUsuario}' data-nombreusuario='${intercambio.usuario}' style='margin-top:1em;background:#21b573;color:#fff;padding:0.5em 1.2em;border:none;border-radius:7px;font-weight:600;cursor:pointer;'>Contactar</button>`;
        }

        return `
            <div class="intercambio-card">
                <div class="card-header">
                    <div class="usuario-info">
                        <div class="usuario-avatar">${iniciales}</div>
                        <div>
                            <strong>${intercambio.usuario}</strong>
                            <div class="fecha">${fecha}</div>
                        </div>
                    </div>
                    <div class="categoria-badge">${intercambio.categoria}</div>
                </div>

                <div class="intercambio-section">
                    <div class="section-title">🎁 Ofrece:</div>
                    <div class="item-name">${intercambio.itemOfrece}</div>
                    ${imagenHTML}
                    <div class="item-description">${intercambio.descripcionOfrece}</div>
                </div>

                <div class="intercambio-section">
                    <div class="section-title">🔍 Busca:</div>
                    <div class="item-name">${intercambio.itemBusca}</div>
                    <div class="item-description">${intercambio.descripcionBusca}</div>
                </div>

                <div class="contact-info">
                    <div class="contact-item">📧 ${intercambio.email}</div>
                    <div class="contact-item">📱 ${intercambio.telefono}</div>
                    <div class="contact-item">📍 ${intercambio.ubicacion}</div>
                </div>
                ${contactarBtn}
            </div>
        `;
    }

    async recargar() {
        await this.cargarIntercambios();
        this.aplicarFiltros();
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const vista = new VistaIntercambios();
    setInterval(function() { vista.recargar(); }, 30000);
    document.getElementById('intercambiosContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('contactar-btn')) {
            const idUsuario = e.target.getAttribute('data-idusuario');
            const nombreUsuario = e.target.getAttribute('data-nombreusuario');
            if (!nombreUsuario) {
                alert('No se puede abrir el chat: faltan datos del usuario.');
                console.error('Faltan datos para iniciar chat:', { idUsuario, nombreUsuario });
                return;
            }
            // Si no hay idUsuario, solo muestra el modal sin lógica de chat
            if (!idUsuario || idUsuario === 'undefined') {
                const chatModal = document.getElementById('chatModal');
                const chatTitulo = document.getElementById('chatTitulo');
                chatTitulo.textContent = 'Chat con ' + nombreUsuario + ' (sin mensajería)';
                chatModal.style.display = 'flex';
                document.getElementById('chatMensajes').innerHTML = '<div style="color:#e74c3c">No se puede iniciar mensajería con este usuario.</div>';
                document.getElementById('chatInput').disabled = true;
                return;
            }
            // Si todo está bien, abre el chat normal
            console.log('Abriendo chat con:', idUsuario, nombreUsuario);
            document.getElementById('chatInput').disabled = false;
            if (typeof window.iniciarChat === 'function') {
                window.iniciarChat(idUsuario, nombreUsuario);
            } else {
                // Fallback mínimo si no existe la función global
                const chatModal = document.getElementById('chatModal');
                const chatTitulo = document.getElementById('chatTitulo');
                chatTitulo.textContent = 'Chat con ' + nombreUsuario;
                chatModal.style.display = 'flex';
            }
        }
    });
    document.getElementById('chatInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (typeof window.enviarMensajeActual === 'function') {
                window.enviarMensajeActual();
            }
        }
    });
    // Los botones del modal usan onclick directo en el HTML, no es necesario asignar aquí
});