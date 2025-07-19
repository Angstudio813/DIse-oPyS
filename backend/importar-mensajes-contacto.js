const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-credentials.json')),
});
const db = admin.firestore();

// Lee el archivo JSON
const mensajesPath = path.join(__dirname, 'mensajes-contacto.json');
const data = JSON.parse(fs.readFileSync(mensajesPath, 'utf8'));
const mensajes = data.mensajes;

// Importa cada mensaje como documento en la colección "mensajes_contacto"
async function importar() {
  for (const mensaje of mensajes) {
    // Usa el campo "id" como documentId si existe, si no deja que Firestore lo genere
    const docId = mensaje.id ? String(mensaje.id) : undefined;
    try {
      if (docId) {
        await db.collection('mensajes_contacto').doc(docId).set(mensaje);
      } else {
        await db.collection('mensajes_contacto').add(mensaje);
      }
      console.log(`Mensaje ${mensaje.id || '[sin id]'} importado`);
    } catch (err) {
      console.error(`Error importando mensaje ${mensaje.id}:`, err);
    }
  }
  console.log('Importación finalizada.');
  process.exit(0);
}

importar();
