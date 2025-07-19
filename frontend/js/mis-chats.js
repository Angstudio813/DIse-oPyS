// mis-chats.js
// Muestra todas las conversaciones del usuario logueado usando Firestore

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

let usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
let chats = [];
let chatActualId = null;
let unsubscribe = null;

const chatList = document.getElementById('chatList');
const chatHeader = document.getElementById('chatHeader');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

if (!usuarioLogueado) {
  chatHeader.textContent = 'Debes iniciar sesión para ver tus chats.';
  chatInput.disabled = true;
  sendBtn.disabled = true;
} else {
  chatInput.disabled = false;
  sendBtn.disabled = false;
  cargarChats();
}

function cargarChats() {
  // Buscar todos los chats donde el usuario participa
  // Buscar chats donde el usuario participa, soportando IDs numéricos y string
  db.collection('chats')
    .onSnapshot(snapshot => {
      chats = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Normalizar IDs a string para comparación
        const participantes = (data.participantes || []).map(String);
        if (participantes.includes(String(usuarioLogueado.id))) {
          chats.push({
            id: doc.id,
            ...data
          });
        }
      });
      renderChatList();
    });
}

function renderChatList() {
  chatList.innerHTML = '';
  if (chats.length === 0) {
    chatList.innerHTML = '<li>No tienes conversaciones aún.</li>';
    chatHeader.textContent = 'Selecciona un chat';
    chatMessages.innerHTML = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;
    return;
  }
  chats.forEach(chat => {
    // Mostrar el nombre del otro participante (soporta string y numérico)
    const miId = String(usuarioLogueado.id);
    const otroId = (chat.participantes || []).map(String).find(id => id !== miId);
    const nombreOtro = chat.nombres && chat.nombres[otroId] ? chat.nombres[otroId] : 'Usuario';
    const li = document.createElement('li');
    li.textContent = nombreOtro;
    li.className = chatActualId === chat.id ? 'active' : '';
    li.onclick = () => seleccionarChat(chat.id, nombreOtro);
    chatList.appendChild(li);
  });
}

function seleccionarChat(chatId, nombreOtro) {
  chatActualId = chatId;
  chatHeader.textContent = 'Chat con ' + nombreOtro;
  chatInput.disabled = false;
  sendBtn.disabled = false;
  chatMessages.innerHTML = '<div style="text-align:center;color:#888;">Cargando mensajes...</div>';
  if (unsubscribe) unsubscribe();
  unsubscribe = db.collection('chats').doc(chatId).collection('mensajes').orderBy('fecha')
    .onSnapshot(snapshot => {
      const mensajes = snapshot.docs.map(doc => doc.data());
      renderMensajes(mensajes);
    });
  renderChatList();
}

function renderMensajes(mensajes) {
  chatMessages.innerHTML = mensajes.map(m => `
    <div class="chat-message${String(m.remitenteId) === String(usuarioLogueado.id) ? ' me' : ''}">
      <div class="bubble"><b>${m.remitente}:</b> ${m.texto}</div>
    </div>
  `).join('');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.onclick = enviarMensaje;
chatInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') enviarMensaje();
});

function enviarMensaje() {
  const texto = chatInput.value;
  if (!texto.trim() || !chatActualId) return;
  const mensajesRef = db.collection('chats').doc(chatActualId).collection('mensajes');
  mensajesRef.add({
    remitente: usuarioLogueado.nombre,
    remitenteId: String(usuarioLogueado.id),
    texto: texto,
    fecha: new Date()
  });
  chatInput.value = '';
}

// Para crear un chat nuevo desde otra vista, asegúrate de guardar en Firestore:
// chats/{chatId} { participantes: [id1, id2], nombres: {id1: nombre1, id2: nombre2} }
// Los mensajes van en chats/{chatId}/mensajes
