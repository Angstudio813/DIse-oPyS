
const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Inicializa Firebase Admin solo si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../firebase-credentials.json')),
  });
}
const db = admin.firestore();

// Guardar mensaje de contacto en Firestore
router.post('/contacto', async (req, res) => {
  try {
    const nuevoMensaje = {
      fecha: new Date().toISOString(),
      ...req.body
    };
    // Si el cliente envía un id, lo usamos, si no Firestore lo genera
    let ref;
    if (req.body.id) {
      ref = db.collection('mensajes_contacto').doc(String(req.body.id));
      await ref.set(nuevoMensaje);
    } else {
      ref = await db.collection('mensajes_contacto').add(nuevoMensaje);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar el mensaje', error });
  }
});

module.exports = router;
