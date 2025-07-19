const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-credentials.json')),
});
const db = admin.firestore();

// Lee el archivo JSON
const usuariosPath = path.join(__dirname, 'usuarios.json');
const data = JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
const usuarios = data.usuarios;

// Importa cada usuario como documento en la colección "usuarios"
async function importar() {
  for (const usuario of usuarios) {
    // Usa el campo "id" como documentId si existe, si no deja que Firestore lo genere
    const docId = usuario.id ? String(usuario.id) : undefined;
    try {
      if (docId) {
        await db.collection('usuarios').doc(docId).set(usuario);
      } else {
        await db.collection('usuarios').add(usuario);
      }
      console.log(`Usuario ${usuario.id || '[sin id]'} importado`);
    } catch (err) {
      console.error(`Error importando usuario ${usuario.id}:`, err);
    }
  }
  console.log('Importación finalizada.');
  process.exit(0);
}

importar();
