// dashboard-entidad.js
// Lógica para mostrar y gestionar donaciones para entidades

const API_URL = '/api';

// Simulación: obtener entidad logueada desde localStorage

const entidad = JSON.parse(localStorage.getItem('usuarioLogueado'));
if (!entidad || entidad.rol !== 'entidad') {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('entidadInfo').innerHTML = `<b>Entidad:</b> ${entidad.nombre} <span style="color:#888;font-size:0.95em;">(${entidad.email})</span><br><span style='color:#1976d2;font-size:0.95em;'>ID: ${entidad.id}</span>`;
  // Cargar usuarios del sistema para saber el rol de cada donante
  try {
    const resUsuarios = await fetch('/api/usuarios');
    window.usuariosSistema = await resUsuarios.json();
  } catch(e) {
    window.usuariosSistema = [];
  }
  await cargarDonaciones();
});

async function cargarDonaciones() {
  const tbody = document.getElementById('donacionesEntidadBody');
  tbody.innerHTML = '<tr><td colspan="7">Cargando donaciones...</td></tr>';
  try {
    // Solicitar solo las donaciones donde la entidad logueada es beneficiaria
    const res = await fetch(`${API_URL}/donaciones?entidadEmail=${encodeURIComponent(entidad.email)}&entidadId=${encodeURIComponent(entidad.id)}`);
    const donaciones = await res.json();
    // Filtrar por entidad logueada (por email o id)
    const disponibles = Array.isArray(donaciones) ? donaciones.filter(d =>
      d.estadoPublicacion === 'activo' &&
      (
        (d.entidadBeneficiaria && (d.entidadBeneficiaria.email === entidad.email || String(d.entidadBeneficiaria.id) === String(entidad.id))) ||
        (d.entidadReceptora && (d.entidadReceptora.email === entidad.email || String(d.entidadReceptora.id) === String(entidad.id)))
      )
    ) : [];
    disponibles.forEach(d => {
      if (!d.estadoDonacion) d.estadoDonacion = 'pendiente';
    });
    if (disponibles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hay donaciones disponibles.</td></tr>';
      return;
    }
    tbody.innerHTML = disponibles.map(d => renderDonacionRow(d)).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7">Error al cargar donaciones.</td></tr>';
  }
}

function renderDonacionRow(d) {
  // Solo mostrar botón de chat/contactar si el donante tiene idUsuario válido y existe en usuariosSistema
  let btnChat = '';
  let btnContactar = '';
  let usuarioDonante = null;
  if (d.idUsuario && window.usuariosSistema) {
    usuarioDonante = window.usuariosSistema.find(u => u.id === d.idUsuario);
    if (usuarioDonante) {
      btnChat = `<button onclick=\"iniciarChat(${usuarioDonante.id}, '${usuarioDonante.nombre}')\" style=\"background:#2563eb;color:#fff;margin-left:6px;\">Chat</button>`;
      btnContactar = `<button class=\"btn-contacto\" onclick=\"iniciarChat(${usuarioDonante.id}, '${usuarioDonante.nombre}')\">Contactar</button>`;
    }
  }
  return `<tr>
    <td>${d.usuario}</td>
    <td>${d.email}</td>
    <td>${d.telefono}</td>
    <td>${d.itemDona}<br>${d.imagen ? `<img src='${d.imagen}' style='max-width:60px;max-height:60px;border-radius:7px;margin-top:4px;'>` : ''}</td>
    <td>${d.descripcion}</td>
    <td><span class=\"estado-badge estado-${d.estadoDonacion}\">${d.estadoDonacion.charAt(0).toUpperCase() + d.estadoDonacion.slice(1)}</span></td>
    <td>
      <button onclick=\"rechazarDonacion(${d.id})\" style=\"background:#e74c3c;\">Rechazar</button>
      ${btnContactar}
      <button onclick=\"abrirModalEntrega(${d.id})\" style=\"background:#2ecc71;\">Entregada</button>
      ${btnChat}
    </td>
  </tr>`;
}


// Modal de entrega
let donacionEntregaId = null;
window.abrirModalEntrega = function(id) {
  donacionEntregaId = id;
  document.getElementById('modalEntrega').style.display = 'flex';
  document.getElementById('archivosEntrega').value = '';
  document.getElementById('previewArchivos').innerHTML = '';
};
document.getElementById('cancelarModal').onclick = function() {
  document.getElementById('modalEntrega').style.display = 'none';
  donacionEntregaId = null;
};
document.getElementById('archivosEntrega').onchange = function(e) {
  const files = Array.from(e.target.files);
  const preview = document.getElementById('previewArchivos');
  preview.innerHTML = '';
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = '80px';
      img.style.marginRight = '8px';
      img.style.marginBottom = '8px';
      preview.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.textContent = file.name;
      preview.appendChild(span);
    }
  });
};
document.getElementById('formEntrega').onsubmit = async function(e) {
  e.preventDefault();
  const archivos = document.getElementById('archivosEntrega').files;
  if (!archivos.length) return alert('Debes subir al menos un archivo.');
  // Aquí deberías enviar los archivos al backend (no implementado en backend aún)
  // Simulación: solo cambiar estado
  await accionDonacion(donacionEntregaId, 'entregada');
  document.getElementById('modalEntrega').style.display = 'none';
  donacionEntregaId = null;
};

window.rechazarDonacion = async function(id) {
  if (!confirm('¿Rechazar esta donación?')) return;
  await accionDonacion(id, 'rechazar');
};

window.marcarEntregada = async function(id) {
  if (!confirm('¿Marcar como entregada?')) return;
  await accionDonacion(id, 'entregada');
};

window.contactarDonante = function(email) {
  window.location.href = `mailto:${email}`;
};

async function accionDonacion(id, accion) {
  try {
    const res = await fetch(`${API_URL}/donaciones/${id}/accion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion, entidad: { id: entidad.id, nombre: entidad.nombre, email: entidad.email } })
    });
    const result = await res.json();
    if (result.success) {
      await cargarDonaciones();
    } else {
      alert(result.message || 'No se pudo actualizar la donación.');
    }
  } catch (err) {
    alert('Error de conexión.');
  }
}

// Función para abrir el modal de chat con el usuario donante
window.iniciarChat = function(idUsuario, nombreUsuario) {
  if (!idUsuario || !nombreUsuario) {
    alert('No se puede iniciar el chat: faltan datos del usuario.');
    return;
  }
  // Mostrar el modal de chat
  const chatModal = document.getElementById('chatModal');
  if (chatModal) {
    chatModal.style.display = 'flex';
    // Mostrar el nombre del usuario en el título del chat
    const chatTitulo = document.getElementById('chatTitulo');
    if (chatTitulo) {
      chatTitulo.textContent = `Chat con ${nombreUsuario}`;
    }
    // Limpiar mensajes previos
    const chatMensajes = document.getElementById('chatMensajes');
    if (chatMensajes) {
      chatMensajes.innerHTML = '';
    }
    // Guardar el idUsuario actual para el chat
    window.chatUsuarioActual = { id: idUsuario, nombre: nombreUsuario };
  }
};
