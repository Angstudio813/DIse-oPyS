// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Clase para manejar las peticiones a la API
class IntercambiosAPI {
    
    // Obtener todos los intercambios
    static async obtenerTodos() {
        try {
            const response = await fetch(`${API_URL}/intercambios`);
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo intercambios:', error);
            return [];
        }
    }

    // Crear nuevo intercambio
    static async crear(intercambio) {
        try {
            const response = await fetch(`${API_URL}/intercambios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(intercambio)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creando intercambio:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    // Obtener intercambio por ID
    static async obtenerPorId(id) {
        try {
            const response = await fetch(`${API_URL}/intercambios/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo intercambio:', error);
            return null;
        }
    }

    // Filtrar por categoría
    static async filtrarPorCategoria(categoria) {
        try {
            const response = await fetch(`${API_URL}/categoria/${categoria}`);
            return await response.json();
        } catch (error) {
            console.error('Error filtrando por categoría:', error);
            return [];
        }
    }

    // Buscar por término
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

// Funciones para el formulario de crear intercambio
class FormularioIntercambio {
    
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.inicializar();
    }

    inicializar() {
        if (this.form) {
            this.autocompletarUsuario();
            this.form.addEventListener('submit', (e) => this.manejarEnvio(e));
            this.configurarVistaImagenes();
        }
    }

    autocompletarUsuario() {
        // Obtener usuario logueado de localStorage
        const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
        if (usuario) {
            if (this.form.usuario) this.form.usuario.value = usuario.nombre || '';
            if (this.form.email) this.form.email.value = usuario.email || '';
            if (this.form.telefono) this.form.telefono.value = usuario.telefono || '';
            if (this.form.ubicacion) this.form.ubicacion.value = usuario.ubicacion || '';
        }
    }

    configurarVistaImagenes() {
        const radioButtons = document.querySelectorAll('input[name="tipoImagen"]');
        const urlContainer = document.getElementById('urlImagenContainer');
        const archivoContainer = document.getElementById('archivoImagenContainer');
        const urlInput = document.querySelector('#urlImagenContainer input');
        const archivoInput = document.querySelector('#archivoImagenContainer input');
        const previewUrl = document.getElementById('previewUrl');
        const previewArchivo = document.getElementById('previewArchivo');

        // Cambiar entre URL y archivo
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'url') {
                    urlContainer.style.display = 'block';
                    archivoContainer.style.display = 'none';
                } else {
                    urlContainer.style.display = 'none';
                    archivoContainer.style.display = 'block';
                }
            });
        });

        // Vista previa de URL
        if (urlInput) {
            urlInput.addEventListener('input', function() {
                const url = this.value.trim();
                if (url) {
                    previewUrl.innerHTML = `<img src="${url}" style="max-inline-size:180px;max-block-size:180px;object-fit:contain;border:1px solid #ccc;" onerror="this.onerror=null;this.src='https://via.placeholder.com/180x180?text=Sin+imagen';">`;
                } else {
                    previewUrl.innerHTML = '<span style="color:#888;font-size:0.9em;">La imagen se mostrará aquí</span>';
                }
            });
            // Inicializar preview si ya hay valor
            if (urlInput.value.trim()) {
                urlInput.dispatchEvent(new Event('input'));
            } else {
                previewUrl.innerHTML = '<span style="color:#888;font-size:0.9em;">La imagen se mostrará aquí</span>';
            }
        }

        // Vista previa de archivo
        if (archivoInput) {
            archivoInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewArchivo.innerHTML = `<img src="${e.target.result}" style="max-inline-size:180px;max-block-size:180px;object-fit:contain;border:1px solid #ccc;">`;
                    };
                    reader.readAsDataURL(this.files[0]);
                } else {
                    previewArchivo.innerHTML = '<span style="color:#888;font-size:0.9em;">La imagen se mostrará aquí</span>';
                }
            });
            // Inicializar preview
            previewArchivo.innerHTML = '<span style="color:#888;font-size:0.9em;">La imagen se mostrará aquí</span>';
        }
    }

    async manejarEnvio(evento) {
        evento.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(this.form);
        const tipoImagen = formData.get('tipoImagen');
        
        let imagen = '';
        
        if (tipoImagen === 'url') {
            imagen = formData.get('imagen') || '';
        } else if (tipoImagen === 'archivo') {
            const fileInput = document.getElementById('imagenArchivo');
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                imagen = await new Promise(resolve => {
                    reader.onload = e => resolve(e.target.result);
                    reader.readAsDataURL(fileInput.files[0]);
                });
            }
        }

        const intercambio = {
            usuario: formData.get('usuario'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            ubicacion: formData.get('ubicacion'),
            categoria: formData.get('categoria'),
            itemOfrece: formData.get('itemOfrece'),
            descripcionOfrece: formData.get('descripcionOfrece'),
            itemBusca: formData.get('itemBusca'),
            descripcionBusca: formData.get('descripcionBusca'),
            imagen: imagen
        };

        // Validar campos
        if (!this.validarCampos(intercambio)) {
            this.mostrarMensaje('Por favor completa todos los campos', 'error');
            return;
        }

        // Enviar a la API
        this.mostrarCargando(true);
        const resultado = await IntercambiosAPI.crear(intercambio);
        this.mostrarCargando(false);

        if (resultado.success) {
            this.mostrarMensaje('¡Intercambio creado exitosamente!', 'success');
            this.form.reset();
        } else {
            this.mostrarMensaje(resultado.message || 'Error al crear intercambio', 'error');
        }
    }

    validarCampos(intercambio) {
        const campos = Object.values(intercambio);
        return campos.every(campo => campo && campo.trim() !== '');
    }

    mostrarMensaje(mensaje, tipo) {
        const mensajeDiv = document.getElementById(`${tipo}Message`);
        const mensajeTexto = document.getElementById(`${tipo}Text`);
        
        if (mensajeDiv && mensajeTexto) {
            mensajeTexto.textContent = mensaje;
            mensajeDiv.style.display = 'block';
            
            // Ocultar otros mensajes
            const otroTipo = tipo === 'success' ? 'error' : 'success';
            const otroMensaje = document.getElementById(`${otroTipo}Message`);
            if (otroMensaje) otroMensaje.style.display = 'none';
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                mensajeDiv.style.display = 'none';
            }, 5000);
        }
    }

    mostrarCargando(mostrar) {
        const boton = this.form.querySelector('button[type="submit"]');
        if (boton) {
            boton.disabled = mostrar;
            boton.textContent = mostrar ? 'Guardando...' : 'Crear Intercambio';
        }
    }
}

// Funciones para la vista de intercambios
class VistaIntercambios {
    
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.intercambios = [];
        this.intercambiosFiltrados = [];
        this.inicializar();
    }

    async inicializar() {
        await this.cargarIntercambios();
        this.configurarFiltros();
        this.mostrarIntercambios();
    }

    async cargarIntercambios() {
        this.intercambios = await IntercambiosAPI.obtenerTodos();
        this.intercambiosFiltrados = this.intercambios.filter(i => i.estado === 'activo');
        this.actualizarEstadisticas();
    }

    configurarFiltros() {
        const filtroCategoria = document.getElementById('filtroCategoria');
        const filtroBusqueda = document.getElementById('filtroBusqueda');

        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', () => this.aplicarFiltros());
        }

        if (filtroBusqueda) {
            filtroBusqueda.addEventListener('input', () => this.aplicarFiltros());
        }
    }

    aplicarFiltros() {
        const categoria = document.getElementById('filtroCategoria')?.value || '';
        const busqueda = document.getElementById('filtroBusqueda')?.value.toLowerCase() || '';

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
        const totalElement = document.getElementById('totalIntercambios');
        const categoriasElement = document.getElementById('categoriasActivas');

        if (totalElement) {
            totalElement.textContent = this.intercambiosFiltrados.length;
        }

        if (categoriasElement) {
            const categorias = new Set(this.intercambiosFiltrados.map(i => i.categoria));
            categoriasElement.textContent = categorias.size;
        }
    }

    mostrarIntercambios() {
        if (!this.container) return;

        const noIntercambios = document.getElementById('noIntercambios');

        if (this.intercambiosFiltrados.length === 0) {
            this.container.style.display = 'none';
            if (noIntercambios) noIntercambios.style.display = 'block';
            return;
        }

        this.container.style.display = 'grid';
        if (noIntercambios) noIntercambios.style.display = 'none';

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

        const iniciales = intercambio.usuario.split(' ').map(n => n[0]).join('').toUpperCase();

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
                    <div class="item-description">${intercambio.descripcionOfrece}</div>
                </div>

                <div class="intercambio-section">
                    <div class="section-title">🔍 Busca:</div>
                    <div class="item-name">${intercambio.itemBusca}</div>
                    <div class="item-description">${intercambio.descripcionBusca}</div>
                </div>

                <div class="card-footer">
                    <div class="contact-info">
                        <div class="contact-item">📧 ${intercambio.email}</div>
                        <div class="contact-item">📱 ${intercambio.telefono}</div>
                        <div class="contact-item">📍 ${intercambio.ubicacion}</div>
                    </div>
                </div>
            </div>
        `;
    }

    async recargar() {
        await this.cargarIntercambios();
        this.aplicarFiltros();
    }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    // Si estamos en la página de crear intercambio
    if (document.getElementById('intercambioForm')) {
        new FormularioIntercambio('intercambioForm');
    }
    
    // Si estamos en la página de ver intercambios
    if (document.getElementById('intercambiosContainer')) {
        const vista = new VistaIntercambios('intercambiosContainer');
        
        // Recargar cada 30 segundos
        setInterval(() => vista.recargar(), 30000);
    }
});