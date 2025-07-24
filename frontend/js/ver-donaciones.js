// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Clase para manejar las peticiones a la API de entidades
class EntidadesAPI {
    static async obtenerTodas() {
        try {
            const response = await fetch(`${API_URL}/entidades`);
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo entidades:', error);
            return [];
        }
    }
}

// Clase para manejar las peticiones a la API
class DonacionesAPI {
    static async obtenerTodas(email) {
        try {
            if (!email) return [];
            const response = await fetch(`${API_URL}/donaciones?email=${encodeURIComponent(email)}`);
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo donaciones:', error);
            return [];
        }
    }
    
    // Filtrar donaciones por email de usuario
    static async obtenerPorUsuario(email) {
        const todas = await this.obtenerTodas();
        if (!todas || !Array.isArray(todas.donaciones)) return [];
        return todas.donaciones.filter(d => d.email === email);
    }

    static async filtrarPorCategoria(categoria) {
        try {
            const response = await fetch(`${API_URL}/donaciones/categoria/${categoria}`);
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error filtrando por categoría:', error);
            return [];
        }
    }

    static async buscar(termino) {
        try {
            const response = await fetch(`${API_URL}/donaciones/buscar/${termino}`);
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error buscando:', error);
            return [];
        }
    }
}

class VistaDonaciones {
    constructor() {
        this.container = document.getElementById('donacionesContainer');
        this.filtroCategoria = document.getElementById('filtroCategoria');
        this.filtroEntidad = document.getElementById('filtroEntidad');
        this.filtroBusqueda = document.getElementById('filtroBusqueda');
        this.totalDonaciones = document.getElementById('totalDonaciones');
        this.entidadesBeneficiadas = document.getElementById('entidadesBeneficiadas');
        this.noDonaciones = document.getElementById('noDonaciones');
        
        this.donaciones = [];
        this.entidades = [];
        this.donacionesFiltradas = [];
        
        this.inicializar();
    }

    async inicializar() {
        await this.cargarDatos();
        this.configurarEventos();
        this.poblarFiltroEntidades();
        this.mostrarDonaciones();
        // Recarga automática cada 5 segundos
        setInterval(async () => {
            await this.cargarDatos();
            this.poblarFiltroEntidades();
            this.mostrarDonaciones();
        }, 5000);
    }

    async cargarDatos() {
        // Obtener email del usuario logueado
        let user = localStorage.getItem('usuarioLogueado');
        let userEmail = null;
        if (user) {
            try {
                userEmail = JSON.parse(user).email;
            } catch {}
        }
        // Cargar donaciones y entidades en paralelo
        const [donaciones, entidades] = await Promise.all([
            DonacionesAPI.obtenerTodas(userEmail),
            EntidadesAPI.obtenerTodas()
        ]);
        this.entidades = entidades;
        // Solo mostrar donaciones del usuario logueado
        this.donaciones = Array.isArray(donaciones) ? donaciones.filter(d => d.email === userEmail) : [];
        // Si el campo estadoPublicacion no existe, mostrar igual
        this.donacionesFiltradas = this.donaciones.filter(d => !d.estadoPublicacion || d.estadoPublicacion === 'activo');
        this.actualizarEstadisticas();
    }

    poblarFiltroEntidades() {
        // Limpiar opciones existentes (excepto la primera)
        while (this.filtroEntidad.children.length > 1) {
            this.filtroEntidad.removeChild(this.filtroEntidad.lastChild);
        }
        
        // Obtener entidades únicas de las donaciones
        const entidadesEnDonaciones = new Set();
        this.donaciones.forEach(donacion => {
            if (donacion.entidadBeneficiaria && donacion.entidadBeneficiaria.nombre) {
                entidadesEnDonaciones.add(donacion.entidadBeneficiaria.nombre);
            }
        });
        
        // Agregar opciones al filtro
        entidadesEnDonaciones.forEach(nombreEntidad => {
            const option = document.createElement('option');
            option.value = nombreEntidad;
            option.textContent = nombreEntidad;
            this.filtroEntidad.appendChild(option);
        });
    }

    configurarEventos() {
        if (this.filtroCategoria) {
            this.filtroCategoria.addEventListener('change', () => this.aplicarFiltros());
        }
        if (this.filtroEntidad) {
            this.filtroEntidad.addEventListener('change', () => this.aplicarFiltros());
        }
        if (this.filtroBusqueda) {
            this.filtroBusqueda.addEventListener('input', () => this.aplicarFiltros());
        }
    }

    aplicarFiltros() {
        const categoria = this.filtroCategoria.value;
        const entidad = this.filtroEntidad.value;
        const busqueda = this.filtroBusqueda.value.toLowerCase();

        this.donacionesFiltradas = this.donaciones.filter(donacion => {
            if (donacion.estadoPublicacion !== 'activo') return false;

            const cumpleCategoria = !categoria || donacion.categoria === categoria;
            const cumpleEntidad = !entidad || 
                (donacion.entidadBeneficiaria && donacion.entidadBeneficiaria.nombre === entidad);
            const cumpleBusqueda = !busqueda || 
                donacion.itemDona.toLowerCase().includes(busqueda) ||
                donacion.descripcion.toLowerCase().includes(busqueda) ||
                donacion.usuario.toLowerCase().includes(busqueda) ||
                (donacion.entidadBeneficiaria && 
                 donacion.entidadBeneficiaria.nombre.toLowerCase().includes(busqueda));

            return cumpleCategoria && cumpleEntidad && cumpleBusqueda;
        });

        this.actualizarEstadisticas();
        this.mostrarDonaciones();
    }

    actualizarEstadisticas() {
        if (this.totalDonaciones) {
            this.totalDonaciones.textContent = this.donacionesFiltradas.length;
        }
        
        if (this.entidadesBeneficiadas) {
            const entidades = new Set();
            this.donacionesFiltradas.forEach(d => {
                if (d.entidadBeneficiaria && d.entidadBeneficiaria.nombre) {
                    entidades.add(d.entidadBeneficiaria.nombre);
                }
            });
            this.entidadesBeneficiadas.textContent = entidades.size;
        }
    }

    mostrarDonaciones() {
        if (!this.container) return;

        if (this.donacionesFiltradas.length === 0) {
            this.container.innerHTML = '';
            this.container.style.display = 'block';
            if (this.noDonaciones) {
                this.noDonaciones.style.display = 'block';
                this.noDonaciones.textContent = 'No tienes donaciones disponibles.';
            }
            return;
        }

        this.container.style.display = 'grid';
        if (this.noDonaciones) this.noDonaciones.style.display = 'none';

        this.container.innerHTML = this.donacionesFiltradas.map(donacion => 
            this.crearTarjetaDonacion(donacion)
        ).join('');
    }

    crearTarjetaDonacion(donacion) {
        const fecha = new Date(donacion.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const iniciales = donacion.usuario
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();

        const imagenHTML = donacion.imagen ? 
            `<div class="item-imagen"><img src="${donacion.imagen}" alt="${donacion.itemDona}"></div>` : 
            '';

        // Información de la entidad beneficiaria
        const entidadHTML = donacion.entidadBeneficiaria ? `
            <div class="entidad-section">
                <div class="section-title">🏢 Beneficiario:</div>
                <div class="entidad-info">
                    <strong>${donacion.entidadBeneficiaria.nombre}</strong>
                    <div class="entidad-tipo">${donacion.entidadBeneficiaria.tipo}</div>
                    <div class="entidad-ubicacion">📍 ${donacion.entidadBeneficiaria.direccion}</div>
                </div>
            </div>
        ` : '';

        return `
            <div class="donacion-card">
                <div class="card-header">
                    <div class="usuario-info">
                        <div class="usuario-avatar">${iniciales}</div>
                        <div>
                            <strong>${donacion.usuario}</strong>
                            <div class="fecha">${fecha}</div>
                        </div>
                    </div>
                    <div class="categoria-badge">${donacion.categoria}</div>
                </div>

                ${entidadHTML}

                <div class="donacion-section">
                    <div class="section-title">🎁 Artículo donado:</div>
                    <div class="item-name">${donacion.itemDona}</div>
                    ${imagenHTML}
                    <div class="item-description">${donacion.descripcion}</div>
                    <div class="estado-badge">${donacion.estado}</div>
                </div>

                <div class="contact-info">
                    <div class="contact-header">💬 Contactar al donante:</div>
                    <div class="contact-item">📧 ${donacion.email}</div>
                    <div class="contact-item">📱 ${donacion.telefono}</div>
                    ${donacion.ubicacion ? `<div class="contact-item">📍 ${donacion.ubicacion}</div>` : ''}
                </div>
            </div>
        `;
    }

    async recargar() {
        await this.cargarDatos();
        this.poblarFiltroEntidades();
        this.aplicarFiltros();
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const vista = new VistaDonaciones();
    // Recargar cada 30 segundos para mantener actualizada la información
    setInterval(() => vista.recargar(), 30000);
});