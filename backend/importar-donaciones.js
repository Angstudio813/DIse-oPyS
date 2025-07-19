const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-credentials.json')),
});
const db = admin.firestore();

// Lee el archivo JSON
const donacionesPath = path.join(__dirname, 'donaciones.json');
const data = JSON.parse(fs.readFileSync(donacionesPath, 'utf8'));
const donaciones = data.donaciones;

// Importa cada donación como documento en la colección "donaciones"
async function importar() {
  for (const donacion of donaciones) {
    // Usa el campo "id" como documentId si existe, si no deja que Firestore lo genere
    const docId = donacion.id ? String(donacion.id) : undefined;
    try {
      if (docId) {
        await db.collection('donaciones').doc(docId).set(donacion);
      } else {
        await db.collection('donaciones').add(donacion);
      }
      console.log(`Donación ${donacion.id || '[sin id]'} importada`);
    } catch (err) {
      console.error(`Error importando donación ${donacion.id}:`, err);
    }
  }
  console.log('Importación finalizada.');
  process.exit(0);
}

importar();