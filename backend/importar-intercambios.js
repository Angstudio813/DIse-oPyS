const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-credentials.json')),
});
const db = admin.firestore();

// Lee el archivo JSON
const intercambiosPath = path.join(__dirname, 'intercambios.json');
const data = JSON.parse(fs.readFileSync(intercambiosPath, 'utf8'));
const intercambios = data.intercambios;

// Importa cada intercambio como documento en la colección "intercambios"
async function importar() {
  for (const intercambio of intercambios) {
    // Usa el campo "id" como documentId si existe, si no deja que Firestore lo genere
    const docId = intercambio.id ? String(intercambio.id) : undefined;
    try {
      if (docId) {
        await db.collection('intercambios').doc(docId).set(intercambio);
      } else {
        await db.collection('intercambios').add(intercambio);
      }
      console.log(`Intercambio ${intercambio.id || '[sin id]'} importado`);
    } catch (err) {
      console.error(`Error importando intercambio ${intercambio.id}:`, err);
    }
  }
  console.log('Importación finalizada.');
  process.exit(0);
}

importar();
