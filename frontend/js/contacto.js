// contacto.js - Lógica JS para la página de contacto

// Notificación de nuevos mensajes en el icono flotante
function inicializarNotificacionMensajes() {
  if (window.firebase && window.firebase.firestore) {
    const user = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (!user) return;
    const db = firebase.firestore();
    const chatsRef = db.collection('chats');
    let totalNuevos = 0;
    function actualizarNotificacion(nuevos) {
      const noti = document.getElementById('notiMensajes');
      if (nuevos > 0) {
        noti.textContent = nuevos;
        noti.style.display = 'inline-block';
      } else {
        noti.style.display = 'none';
      }
    }
    chatsRef.where('participantes', 'array-contains', String(user.id)).onSnapshot(snapshot => {
      totalNuevos = 0;
      const promesas = [];
      snapshot.forEach(doc => {
        const chatId = doc.id;
        promesas.push(db.collection('chats').doc(chatId).collection('mensajes')
          .where('leidoPor', 'not-in', [String(user.id)])
          .where('autorId', '!=', String(user.id))
          .get().then(msgSnap => {
            totalNuevos += msgSnap.size;
          })
        );
      });
      Promise.all(promesas).then(() => {
        actualizarNotificacion(totalNuevos);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', inicializarNotificacionMensajes);

// Envío asíncrono real del formulario de contacto
function inicializarFormularioContacto() {
  const form = document.getElementById('contactoForm');
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const feedback = document.getElementById('formFeedback');
    feedback.textContent = '';
    feedback.className = 'form-feedback';
    const data = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      asunto: form.asunto.value.trim(),
      mensaje: form.mensaje.value.trim()
    };
    feedback.textContent = 'Enviando...';
    feedback.classList.add('enviando');
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        feedback.textContent = '¡Mensaje enviado! Nos pondremos en contacto pronto.';
        feedback.classList.remove('enviando');
        feedback.classList.add('exito');
        form.reset();
      } else {
        feedback.textContent = result.message || 'Error al enviar el mensaje. Intenta nuevamente.';
        feedback.classList.remove('enviando');
        feedback.classList.add('error');
      }
    } catch (err) {
      feedback.textContent = 'Error de conexión. Intenta nuevamente.';
      feedback.classList.remove('enviando');
      feedback.classList.add('error');
    }
  });
}

document.addEventListener('DOMContentLoaded', inicializarFormularioContacto);
