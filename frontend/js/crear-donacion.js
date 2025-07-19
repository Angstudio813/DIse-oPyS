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

    static async obtenerPorId(id) {
        try {
            const response = await fetch(`${API_URL}/entidades/${id}`);
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo entidad:', error);
            return null;
        }
    }

    static async filtrarPorCategoria(categoria) {
        try {
            const response = await fetch(`${API_URL}/entidades/categoria/${categoria}`);
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error filtrando entidades:', error);
            return [];
        }
    }
}

// Clase para manejar las peticiones a la API
class DonacionesAPI {
    static async crear(donacion) {
        try {
            const response = await fetch(`${API_URL}/donaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(donacion)
            });
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creando donación:', error);
            return { success: false, message: 'Error de conexión: ' + error.message };
        }
    }

    static async obtenerTodas() {
        try {
            const response = await fetch(`${API_URL}/donaciones`);
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo donaciones:', error);
            return [];
        }
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

class FormularioDonacion {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.entidades = [];
        this.inicializar();
    }

    async inicializar() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.manejarEnvio(e));
            this.configurarVistaImagenes();
            await this.cargarEntidades();
            this.configurarSeleccionEntidad();
            this.configurarCategoriaHelp();
        } else {
            console.error('No se encontró el formulario con ID:', formId);
        }
    }

    async cargarEntidades() {
        try {
            const res = await fetch('/api/entidades');
            const entidades = await res.json();
            this.entidades = entidades; // Ya son solo entidades
            this.poblarSelectEntidades();
        } catch (error) {
            console.error('Error cargando entidades:', error);
            this.mostrarMensaje('Error al cargar entidades verificadas', 'error');
        }
    }

    async poblarSelectEntidades() {
        const select = document.getElementById('entidadBeneficiaria');
        // Limpiar opciones existentes (excepto la primera)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        this.entidades.forEach(entidad => {
            // Unificar estructura para el dataset
            const entidadData = {
                id: entidad.id,
                nombre: entidad.nombre,
                email: entidad.email,
                telefono: entidad.telefono,
                tipo: entidad.entidad_info?.tipo || '',
                descripcion: entidad.entidad_info?.descripcion || '',
                direccion: entidad.entidad_info?.direccion || '',
                categoria_necesidades: entidad.entidad_info?.categoria_necesidades || [],
                verificada: entidad.entidad_info?.verificada || false,
                activa: entidad.entidad_info?.activa || false
            };
            const option = document.createElement('option');
            option.value = entidad.id;
            option.textContent = `${entidad.nombre} (${entidad.email})`;
            option.dataset.entidad = JSON.stringify(entidadData);
            select.appendChild(option);
        });
    }

    configurarSeleccionEntidad() {
        const select = document.getElementById('entidadBeneficiaria');
        const infoDiv = document.getElementById('entidadInfo');
        
        select.addEventListener('change', (e) => {
            if (e.target.value) {
                const entidadData = JSON.parse(e.target.selectedOptions[0].dataset.entidad);
                this.mostrarInfoEntidad(entidadData);
                this.actualizarCategoriasRecomendadas(entidadData.categoria_necesidades);
            } else {
                infoDiv.style.display = 'none';
                this.limpiarCategoriasRecomendadas();
            }
        });
    }

    mostrarInfoEntidad(entidad) {
        const infoDiv = document.getElementById('entidadInfo');
        
        document.getElementById('entidadNombre').textContent = entidad.nombre;
        document.getElementById('entidadDescripcion').textContent = entidad.descripcion;
        document.getElementById('entidadDireccion').textContent = `📍 ${entidad.direccion}`;
        document.getElementById('entidadTelefono').textContent = `📞 ${entidad.telefono}`;
        document.getElementById('entidadEmail').textContent = `📧 ${entidad.email}`;
        document.getElementById('entidadNecesidades').textContent = entidad.categoria_necesidades.join(', ');
        
        infoDiv.style.display = 'block';
    }

    actualizarCategoriasRecomendadas(necesidades) {
        const categoriaSelect = document.getElementById('categoria');
        const options = categoriaSelect.querySelectorAll('option');
        
        // Resetear estilos
        options.forEach(option => {
            option.style.fontWeight = 'normal';
            option.style.backgroundColor = '';
        });
        
        // Destacar categorías recomendadas
        necesidades.forEach(necesidad => {
            const option = [...options].find(opt => opt.value === necesidad);
            if (option) {
                option.style.fontWeight = 'bold';
                option.style.backgroundColor = '#e8f5e8';
            }
        });
    }

    limpiarCategoriasRecomendadas() {
        const categoriaSelect = document.getElementById('categoria');
        const options = categoriaSelect.querySelectorAll('option');
        
        options.forEach(option => {
            option.style.fontWeight = 'normal';
            option.style.backgroundColor = '';
        });
    }

    configurarCategoriaHelp() {
        const categoriaSelect = document.getElementById('categoria');
        const helpDiv = document.getElementById('categoriaHelp');
        
        const mensajesAyuda = {
            'Ropa': 'Ropa limpia y en buen estado, zapatos, accesorios',
            'Alimentos': 'Solo alimentos no perecibles, enlatados, granos, etc.',
            'Tecnología': 'Computadoras, tablets, teléfonos en funcionamiento',
            'Libros': 'Libros educativos, cuentos, material didáctico',
            'Útiles escolares': 'Cuadernos, lápices, mochilas, material escolar',
            'Juguetes': 'Juguetes en buen estado, limpios y seguros',
            'Hogar': 'Muebles, utensilios de cocina, decoración',
            'Medicinas': 'Medicamentos vigentes, productos de primeros auxilios',
            'Herramientas': 'Herramientas de trabajo, equipos de construcción',
            'Útiles de oficina': 'Material de oficina, papelería, equipos'
        };
        
        categoriaSelect.addEventListener('change', (e) => {
            const categoria = e.target.value;
            if (categoria && mensajesAyuda[categoria]) {
                helpDiv.textContent = mensajesAyuda[categoria];
                helpDiv.classList.add('show');
            } else {
                helpDiv.classList.remove('show');
            }
        });
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
            previewArchivo.innerHTML = '<span style="color:#888;font-size:0.9em;">La imagen se mostrará aquí</span>';
        }
    }

    async manejarEnvio(evento) {
        evento.preventDefault();
        
        // Validar que se haya seleccionado una entidad
        const entidadSelect = document.getElementById('entidadBeneficiaria');
        if (!entidadSelect.value) {
            this.mostrarMensaje('Debes seleccionar una entidad beneficiaria', 'error');
            return;
        }
        
        // Obtener información de la entidad seleccionada
        const entidadData = JSON.parse(entidadSelect.selectedOptions[0].dataset.entidad);
        
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

        const donacion = {
            usuario: formData.get('usuario'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            ubicacion: formData.get('ubicacion'),
            categoria: formData.get('categoria'),
            estado: formData.get('estado'),
            itemDona: formData.get('itemDona'),
            descripcion: formData.get('descripcion'),
            imagen: imagen,
            // Información de la entidad beneficiaria
            entidadBeneficiaria: {
                id: entidadData.id,
                nombre: entidadData.nombre,
                tipo: entidadData.tipo,
                direccion: entidadData.direccion,
                telefono: entidadData.telefono,
                email: entidadData.email
            },
            tipoDonacion: 'entidad_verificada', // Marcar como donación a entidad verificada
            ubicacionEntrega: entidadData.direccion // La entrega será en la entidad
        };

        if (!this.validarCampos(donacion)) {
            this.mostrarMensaje('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        this.mostrarCargando(true);
        const resultado = await DonacionesAPI.crear(donacion);
        this.mostrarCargando(false);

        if (resultado.success) {
            this.mostrarMensaje('¡Donación registrada exitosamente! La entidad será notificada.', 'success');
            this.form.reset();
            document.getElementById('entidadInfo').style.display = 'none';
            this.limpiarCategoriasRecomendadas();
        } else {
            this.mostrarMensaje(resultado.message || 'Error al registrar donación', 'error');
        }
    }

    validarCampos(donacion) {
        // Validar campos obligatorios básicos
        const camposObligatorios = ['usuario', 'email', 'telefono', 'categoria', 'estado', 'itemDona', 'descripcion'];
        
        for (let campo of camposObligatorios) {
            if (!donacion[campo] || donacion[campo].trim() === '') {
                return false;
            }
        }
        
        // Validar que se haya seleccionado una entidad
        if (!donacion.entidadBeneficiaria || !donacion.entidadBeneficiaria.id) {
            return false;
        }
        
        return true;
    }

    mostrarMensaje(mensaje, tipo) {
        const mensajeDiv = document.getElementById(`${tipo}Message`);
        const mensajeTexto = document.getElementById(`${tipo}Text`);
        
        if (mensajeDiv && mensajeTexto) {
            mensajeTexto.textContent = mensaje;
            mensajeDiv.style.display = 'block';
            
            const otroTipo = tipo === 'success' ? 'error' : 'success';
            const otroMensaje = document.getElementById(`${otroTipo}Message`);
            if (otroMensaje) otroMensaje.style.display = 'none';
            
            setTimeout(() => {
                mensajeDiv.style.display = 'none';
            }, 5000);
        }
    }

    mostrarCargando(mostrar) {
        const boton = this.form.querySelector('button[type="submit"]');
        if (boton) {
            boton.disabled = mostrar;
            boton.textContent = mostrar ? 'Publicando...' : '✨ Publicar Donación';
        }
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('donacionForm')) {
        new FormularioDonacion('donacionForm');
    }
});

// routes/entidades.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    const usuariosPath = path.join(__dirname, '../usuarios.json');
    fs.readFile(usuariosPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo usuarios' });
        const usuarios = JSON.parse(data);
        const entidades = usuarios.filter(u => u.rol === 'entidad');
        res.json(entidades);
    });
});

module.exports = router;