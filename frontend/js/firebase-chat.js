// firebase-chat.js
// Integración básica de chat entre usuarios y entidades usando Firebase Firestore

// 1. Agrega el script de Firebase en tu HTML principal (dashboard, intercambios, etc)
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
// <script src="js/firebase-chat.js"></script>

// 2. Configura tu proyecto Firebase aquí:
// Usar Firebase CDN, no ES modules
// Los scripts deben estar cargados en el HTML:
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
// <script src="js/firebase-chat.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyDK09-WkdHfE5Cug58zhD1Ad-xhskslKkA",
  authDomain: "mensajeria-fe920.firebaseapp.com",
  projectId: "mensajeria-fe920",
  storageBucket: "mensajeria-fe920.appspot.com",
  messagingSenderId: "361838328124",
  appId: "1:361838328124:web:f9f85cd909627f5fa70639",
  measurementId: "G-TCG7Y6F28K"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. Funciones de chat

var chatIdActual = null;
var usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));

// Iniciar chat entre dos usuarios/entidad
window.iniciarChat = function(idOtro, nombreOtro) {
  usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
  if (!usuarioLogueado) return alert('Debes iniciar sesión');
  // Validar idOtro y nombreOtro
  if (!idOtro || idOtro === 'undefined' || !nombreOtro || nombreOtro === 'undefined') {
    alert('No se puede iniciar el chat: faltan datos del usuario.');
    return;
  }
  // Normalizar IDs a string para compatibilidad
  const miId = String(usuarioLogueado.id);
  const otroId = String(idOtro);
  chatIdActual = [miId, otroId].sort().join('_');
  // Crear el documento del chat si no existe
  const chatDocRef = db.collection('chats').doc(chatIdActual);
  chatDocRef.get().then(doc => {
    if (!doc.exists) {
      // Crear el documento con participantes y nombres
      const nombres = {};
      nombres[miId] = usuarioLogueado.nombre;
      nombres[otroId] = nombreOtro;
      chatDocRef.set({
        participantes: [miId, otroId],
        nombres: nombres
      });
    } else {
      // Si el documento existe, asegurarse que los IDs y nombres estén correctos
      const data = doc.data();
      let actualizados = false;
      let participantes = (data.participantes || []).map(String);
      if (!participantes.includes(miId) || !participantes.includes(otroId)) {
        participantes = Array.from(new Set([...participantes, miId, otroId]));
        actualizados = true;
      }
      const nombres = Object.assign({}, data.nombres);
      if (!nombres[miId]) { nombres[miId] = usuarioLogueado.nombre; actualizados = true; }
      if (!nombres[otroId]) { nombres[otroId] = nombreOtro; actualizados = true; }
      if (actualizados) {
        chatDocRef.update({ participantes, nombres });
      }
    }
    document.getElementById('chatModal').style.display = 'flex';
    document.getElementById('chatTitulo').textContent = 'Chat con ' + nombreOtro;
    escucharMensajes(chatIdActual);
  });
}

// Escuchar mensajes en tiempo real
function escucharMensajes(chatId) {
  const mensajesRef = db.collection('chats').doc(chatId).collection('mensajes');
  mensajesRef.orderBy('fecha').onSnapshot((snapshot) => {
    const mensajes = snapshot.docs.map(doc => doc.data());
    renderMensajes(mensajes);
  });
}

// Enviar mensaje
window.enviarMensajeActual = async function() {
  usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
  const texto = document.getElementById('chatInput').value;
  if (!texto.trim()) return;
  const mensajesRef = db.collection('chats').doc(chatIdActual).collection('mensajes');
  await mensajesRef.add({
    remitente: usuarioLogueado.nombre,
    remitenteId: String(usuarioLogueado.id),
    texto: texto,
    fecha: new Date()
  });
  document.getElementById('chatInput').value = '';
}

// Renderizar mensajes en el modal
function renderMensajes(mensajes) {
  const chatMensajes = document.getElementById('chatMensajes');
  chatMensajes.innerHTML = mensajes.map(m => `<div><b>${m.remitente}:</b> ${m.texto}</div>`).join('');
}

// Cerrar chat
window.cerrarChat = function() {
  document.getElementById('chatModal').style.display = 'none';
  chatIdActual = null;
}

// Puedes llamar iniciarChat(idOtro, nombreOtro) desde el botón "Contactar" en dashboard o intercambios
// Ejemplo: <button onclick="iniciarChat(5, 'Caritas Piura')">Contactar</button>
