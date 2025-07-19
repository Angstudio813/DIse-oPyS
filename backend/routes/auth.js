
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }
  try {
    const snapshot = await db.collection('usuarios').where('email', '==', email).where('password', '==', password).get();
    if (snapshot.empty) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    const usuario = snapshot.docs[0].data();
    const { password: _, ...usuarioSinPassword } = usuario;
    return res.json({ success: true, usuario: usuarioSinPassword });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error de servidor' });
  }
});

module.exports = router;
